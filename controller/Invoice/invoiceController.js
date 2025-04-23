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
        body { font-family: Arial, sans-serif; font-size: 14px; padding: 20px; }
        h1, h2, h3 { margin: 0; }
        .header, .section { margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: auto auto auto auto; gap: 10px; }
        .divider { border-top: 1px solid #000; margin: 20px 0; }
        .label { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Ref No: ${order.refNo}</h2>
        <p><strong>Customer Name:</strong> ${order.customerName} &nbsp;&nbsp; <strong>Mobile:</strong> ${order.mobile}</p>
        <p><strong>Email:</strong> ${order.email} &nbsp;&nbsp; <strong>Item Name:</strong> ${order.itemName}</p>
      </div>

      <div class="divider"></div>

      <div class="grid">
        <div class="label">Gross Weight</div><div>${order.grossWeight}</div><div class="label">Deduction</div><div>${order.deduction}</div>
        <div class="label">Tare Weight</div><div>${order.tareWeight}</div><div></div><div></div>
        <div class="label">Net Weight</div><div>${order.netWeight}</div><div class="label">Air</div><div>${order.airLoss}</div>
        <div class="label">Weighing Loss</div><div>${order.weighingLoss}</div><div></div><div></div>
        <div class="label">Container</div><div>${order.container}</div><div></div><div></div>
        <div class="label">Weight Deduction</div><div>${order.weightDeduction}</div><div class="label">Net Deduction</div><div>${order.netDeduction}</div>
        <div class="label">Clean Weight</div><div>${order.cleanWeight}</div><div></div><div></div>
        <div class="label">Price</div><div>${order.price}</div><div></div><div></div>
        <div class="label">Total Amount</div><div>${order.totalAmount}</div><div class="label">Oil Content Report</div><div>${order.oilContentReport}</div>
        <div class="label">Labor Charges</div><div>${order.laborCharges}</div><div></div><div></div>
        <div class="label">Net Amount</div><div>${order.netAmount}</div><div></div><div></div>
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
