const puppeteer = require('puppeteer');
const generateHtml = require('./generateTamplate');
const fs = require('fs');

async function generateInvoicePDF(invoiceData) {
  try {
    const htmlContent = generateHtml(invoiceData);

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '40px',
        left: '20px'
      }
    });
    fs.writeFileSync('invoice-debug.pdf', pdfBuffer);

    await browser.close();
    return pdfBuffer;

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

module.exports = generateInvoicePDF;
