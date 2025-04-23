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
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        td, th {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background-color: #f2f2f2;
        }
        .label {
          font-weight: bold;
        }
        .section-title {
          text-align: center;
          font-weight: bold;
          border-bottom: 2px solid black;
          margin: 20px 0 10px;
          font-size: 16px;
        }
      </style>
    </head>
    <body>

      <table>
        <tr>
          <td colspan="4"><strong>Ref No:</strong> ${order.refNo}</td>
        </tr>
        <tr>
          <td class="label">Customer Name</td><td>${order.customerName}</td>
          <td class="label">Mobile Number</td><td>${order.mobile}</td>
        </tr>
        <tr>
          <td class="label">Customer Email</td><td>${order.email}</td>
          <td class="label">Item Name</td><td>${order.itemName}</td>
        </tr>
      </table>

      <table>
        <tr>
          <td class="label">Gross Weight</td><td>${order.grossWeight}</td>
          <td class="label">Deduction</td><td>${order.deduction}</td>
        </tr>
        <tr>
          <td class="label">Tare Weight</td><td>${order.tareWeight}</td>
          <td></td><td></td>
        </tr>
        <tr>
          <td class="label">Net Weight</td><td>${order.netWeight}</td>
          <td class="label">Air</td><td>${order.airLoss}</td>
        </tr>
        <tr>
          <td class="label">Weighing Loss</td><td>${order.weighingLoss}</td>
          <td></td><td></td>
        </tr>
        <tr>
          <td class="label">Container</td><td>${order.container}</td>
          <td></td><td></td>
        </tr>
        <tr>
          <td class="label">Weight Deduction</td><td>${order.weightDeduction}</td>
          <td class="label">Net Deduction</td><td>${order.netDeduction}</td>
        </tr>
        <tr>
          <td class="label">Clean Weight</td><td>${order.cleanWeight}</td>
          <td></td><td></td>
        </tr>
        <tr>
          <td class="label">Price</td><td>${order.price}</td>
          <td></td><td></td>
        </tr>
        <tr>
          <td class="label">Total Amount</td><td>${order.totalAmount}</td>
          <td class="label">Oil Content Report</td><td>${order.oilContentReport}</td>
        </tr>
        <tr>
          <td class="label">Labor Charges</td><td>${order.laborCharges}</td>
          <td></td><td></td>
        </tr>
        <tr>
          <td class="label">Net Amount</td><td>${order.netAmount}</td>
          <td></td><td></td>
        </tr>
      </table>

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
