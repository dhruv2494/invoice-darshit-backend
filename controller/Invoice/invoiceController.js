const ErrorHandler = require("../../utils/default/errorHandler");
const puppeteer = require("puppeteer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

exports.AddUpdate = async (req, res, next) => {
  const pool = req.pool;
  const {
    uuid,
    refNo,
    grossWeight,
    tareWeight,
    netWeight,
    weighingLoss,
    container,
    weightDeduction,
    cleanWeight,
    price,
    totalAmount,
    laborCharges,
    netAmount,
    deduction,
    airLoss,
    netDeduction,
    oilContentReport,
    purchaseOrderId,
    customerId,
  } = req.body;

  try {
    if (uuid) {
      // Update existing invoice
      const [result] = await pool.query(
        `UPDATE invoice SET
          purchaseOrderId = ?, refNo = ?, customerId = ?, grossWeight = ?, tareWeight = ?, netWeight = ?,
          weighingLoss = ?, container = ?, weightDeduction = ?, cleanWeight = ?, price = ?, totalAmount = ?,
          laborCharges = ?, netAmount = ?, deduction = ?, airLoss = ?, netDeduction = ?, oilContentReport = ?
        WHERE uuid = ?`,
        [
          purchaseOrderId,
          refNo,
          customerId,
          grossWeight,
          tareWeight,
          netWeight,
          weighingLoss,
          container,
          weightDeduction,
          cleanWeight,
          price,
          totalAmount,
          laborCharges,
          netAmount,
          deduction,
          airLoss,
          netDeduction,
          oilContentReport,
          uuid,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      return res
        .status(200)
        .json({ message: "Invoice updated successfully", uuid });
    } else {
      // Add new invoice
      const newUuid = uuidv4();
      await pool.query(
        `INSERT INTO invoice (
          uuid, purchaseOrderId, refNo, customerId, grossWeight, tareWeight, netWeight, weighingLoss,
          container, weightDeduction, cleanWeight, price, totalAmount, laborCharges,
          netAmount, deduction, airLoss, netDeduction, oilContentReport
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUuid,
          purchaseOrderId,
          refNo,
          customerId,
          grossWeight,
          tareWeight,
          netWeight,
          weighingLoss,
          container,
          weightDeduction,
          cleanWeight,
          price,
          totalAmount,
          laborCharges,
          netAmount,
          deduction,
          airLoss,
          netDeduction,
          oilContentReport,
        ]
      );

      return res
        .status(201)
        .json({ message: "Invoice created successfully", uuid: newUuid });
    }
  } catch (error) {
    console.error(error);
    return next(new Error("Failed to create or update invoice"));
  }
};

exports.Get = async (req, res, next) => {
  const pool = req.pool;

  try {
    const [rows] = await pool.query(
      `SELECT 
        i.uuid,
        i.refNo,
        i.grossWeight,
        i.tareWeight,
        i.netWeight,
        i.weighingLoss,
        i.container,
        i.weightDeduction,
        i.cleanWeight,
        i.price,
        i.totalAmount,
        i.laborCharges,
        i.netAmount,
        i.deduction,
        i.airLoss,
        i.netDeduction,
        i.oilContentReport,
        c.name AS customerName,
        c.mobile,
        c.email,
        po.itemName
      FROM invoice i
      LEFT JOIN customer c ON i.customerId = c.uuid
      LEFT JOIN purchase_orders po ON i.purchaseOrderId = po.uuid
      ORDER BY i.id DESC`
    );

    res.status(200).json({ Status: "200", Message: "Success", list: rows });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return next(new Error("Failed to fetch invoices"));
  }
};

exports.downloadInvoice = async (req, res, next) => {
  const pool = req.pool;
  const uuid = req.params.purchaseOrderUuid;

  try {
    const [rows] = await pool.query(
      `SELECT 
        i.uuid,
        i.refNo,
        i.grossWeight,
        i.tareWeight,
        i.netWeight,
        i.weighingLoss,
        i.container,
        i.weightDeduction,
        i.cleanWeight,
        i.price,
        i.totalAmount,
        i.laborCharges,
        i.netAmount,
        i.deduction,
        i.airLoss,
        i.netDeduction,
        i.oilContentReport,
        c.name AS customerName,
        c.mobile,
        c.email,
        po.itemName
      FROM invoice i
      LEFT JOIN customer c ON i.customerId = c.uuid
      LEFT JOIN purchase_orders po ON i.purchaseOrderId = po.uuid
      WHERE i.uuid = ?
      ORDER BY i.id DESC`,
      [uuid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    const pdfBuffer = await generatePDF(rows[0]);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice_${uuid}.pdf`
    );
    res.end(pdfBuffer);
  } catch (error) {
    console.error(error);
    return next(new Error("Error while retrieving invoice!"));
  }
};

async function generatePDF(order) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const invoiceHTML = `
  <html>

<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }

        .details-table td,
        .details-table th {
            border: 1px solid #000;
            padding: 6px;
        }

        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 10px;
        }

        .table-1 td,
        .table-1 th {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }

        .label {
            font-weight: bold;
        }

        .split-container {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }

        .half-table {
            width: 50%;
        }

        .value-cell {
            width: 50%;
        }

        .table-2 {
            border: 1px solid #000;
            border-left: 0px;
        }

        .table-2 td,
        .table-2 th {
            padding: 8px;
            text-align: left;
        }
    </style>
</head>

<body>

    <table class="details-table">
        <tr>
            <td colspan="4"><strong>Ref No:</strong> ${order.refNo}</td>
        </tr>
        <tr>
            <td class="label">Customer Name</td>
            <td>${order.customerName}</td>
            <td class="label">Mobile Number</td>
            <td>${order.mobile}</td>
        </tr>
        <tr>
            <td class="label">Customer Email</td>
            <td>${order.email}</td>
            <td class="label">Item Name</td>
            <td>${order.itemName}</td>
        </tr>
    </table>

    <div class="split-container">
        <!-- Left Table (T1) -->
        <table class="half-table table-1">
            <tr>
                <td class="label">Gross Weight</td>
                <td class="value-cell">${order.grossWeight}</td>
            </tr>
            <tr>
                <td class="label">Tare Weight</td>
                <td class="value-cell">${order.tareWeight}</td>
            </tr>
            <tr>
                <td class="label">Weighing Loss</td>
                <td class="value-cell">${order.weighingLoss}</td>
            </tr>
            <tr>
                <td class="label">Container</td>
                <td class="value-cell">${order.container}</td>
            </tr>
            <tr>
                <td class="label">Weight Deduction</td>
                <td class="value-cell">${order.weightDeduction}</td>
            </tr>
            <tr>
                <td class="label">Clean Weight</td>
                <td class="value-cell">${order.cleanWeight}</td>
            </tr>
            <tr>
                <td class="label">Price</td>
                <td class="value-cell">${order.price}</td>
            </tr>
            <tr>
                <td class="label">Total Amount</td>
                <td class="value-cell">${order.totalAmount}</td>
            </tr>
            <tr>
                <td class="label">Labor Charges</td>
                <td class="value-cell">${order.laborCharges}</td>
            </tr>
            <tr>
                <td class="label">Net Amount</td>
                <td class="value-cell">${order.netAmount}</td>
            </tr>
        </table>

        <!-- Right Table (T2) -->
        <table class="half-table table-2">
            <tr>
                <td class="label">Deduction</td>
                <td class="value-cell">${order.deduction}</td>
            </tr>
            <tr>
                <td class="label">Air</td>
                <td class="value-cell">${order.airLoss}</td>
            </tr>
            <tr>
                <td class="label">Net Deduction</td>
                <td class="value-cell">${order.netDeduction}</td>
            </tr>
            <tr>
                <td class="label">Oil Content Report</td>
                <td class="value-cell">${order.oilContentReport}</td>
            </tr>
        </table>
    </div>

</body>

</html>
  `;

  await page.setContent(invoiceHTML, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });

  await browser.close();
  return pdfBuffer;
}
