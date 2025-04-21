const ErrorHandler = require("../../utils/default/errorHandler");
const puppeteer = require("puppeteer");
const fs = require("fs");

exports.GetComplatedPurchaseOrder = async (req, res, next) => {
  const pool = req.pool;

  try {
    const [rows] = await pool.query(
      `SELECT po.*, c.name AS customerName 
         FROM purchase_orders po 
         LEFT JOIN customer c ON po.customer = c.uuid
         WHERE po.status = 'completed' 
         ORDER BY po.createdAt DESC`
    );

    res.status(200).json({ Status: "200", Message: "Success", list: rows });
  } catch (err) {
    console.error(err);
    return next(
      new ErrorHandler("Error while retrieving purchase orders!", 500)
    );
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
    res.setHeader('Content-Type', 'application/pdf'); // Set content type as PDF
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${uuid}.pdf`); // Force download with proper filename

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

  // Prepare the HTML for the invoice (you can customize the HTML template)
  const invoiceHTML = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
          }
          h1, h2, h3 {
            color: #4A90E2;
          }
          .container {
            padding: 20px;
            width: 100%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          .total {
            font-weight: bold;
            font-size: 18px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Invoice</h1>
          <h2>Ref No: ${order.refNo}</h2>
          <h3>Customer: ${order.customerName}</h3>
          <h4>Email: ${order.email}</h4>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.itemName}</td>
                <td>${order.quantity}</td>
                <td>₹${order.price}</td>
                <td>₹${order.price * order.quantity}</td>
              </tr>
            </tbody>
          </table>

          <p class="total">Total: ₹${order.price * order.quantity}</p>
        </div>
      </body>
    </html>
  `;

  // Set the page content
  await page.setContent(invoiceHTML);

  // Generate the PDF from the HTML content
  const pdfBuffer = await page.pdf({
    format: 'A4', // PDF page format
    printBackground: true, // Print background images (if any)
  });

  await browser.close();

  return pdfBuffer;
}
