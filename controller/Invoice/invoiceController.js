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
    // Query the database for the purchase order details
    const [rows] = await pool.query(
      `SELECT po.*, c.name AS customerName
       FROM purchase_orders po
       LEFT JOIN customer c ON po.customer = c.uuid
       WHERE po.status = 'completed' AND po.uuid = ?`,
      [uuid]
    );

    // Check if no order found
    if (rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    // Generate the PDF content using Puppeteer (or any PDF generator of your choice)
    const pdfBuffer = await generatePDF(rows[0]);

    // Set the correct headers to indicate this is a PDF file
    res.setHeader("Content-Type", "application/pdf"); // Set content type as PDF
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice_${uuid}.pdf`
    ); // Force download with proper filename

    // Send the PDF buffer as the response (in binary form)
    res.end(pdfBuffer);
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Error while retrieving invoice!", 500));
  }
};

// Helper function to generate the PDF using Puppeteer
async function generatePDF(order) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Prepare the HTML for the invoice (simplified and clean design)
  const invoiceHTML = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #fff;
              color: #333;
              font-size: 14px;
            }
            h1, h2 {
              margin-bottom: 0;
              color: #000;
              font-size: 20px;
              font-weight: normal;
            }
            .container {
              max-width: 800px;
              margin: auto;
            }
            .header, .footer {
              text-align: center;
            }
            .header {
              margin-bottom: 20px;
            }
            .footer {
              font-size: 12px;
              margin-top: 30px;
              color: #666;
            }
            .invoice-details {
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
            .total {
              font-weight: bold;
              text-align: right;
              padding-right: 20px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice</h1>
              <h2>Ref No: ${order.refNo}</h2>
            </div>
  
            <div class="invoice-details">
              <p><strong>Customer:</strong> ${order.customerName}</p>
              <p><strong>Email:</strong> ${order.email}</p>
            </div>
  
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price (₹)</th>
                  <th>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${order.itemName}</td>
                  <td>${order.quantity}</td>
                  <td>${order.price}</td>
                  <td>${order.price * order.quantity}</td>
                </tr>
              </tbody>
            </table>
  
            <p class="total">Total: ₹${order.price * order.quantity}</p>
  
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>For any queries, contact support@gmail.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

  // Set the page content
  await page.setContent(invoiceHTML);

  // Generate the PDF from the HTML content
  const pdfBuffer = await page.pdf({
    format: "A4", // PDF page format
    printBackground: true, // Print background images (if any)
    margin: {
      top: "20mm",
      right: "20mm",
      bottom: "20mm",
      left: "20mm",
    },
  });

  await browser.close();

  return pdfBuffer;
}
