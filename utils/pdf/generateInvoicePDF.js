const PDFDocument = require('pdfkit');

function generateInvoicePDF(invoiceData) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = doc.pipe(Buffer.from([])); // Use a buffer to stream the PDF

        // Header
        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();

        // Company and Customer Info
        const customer = invoiceData.customer || {};
        doc.fontSize(12).text(`Invoice Number: ${invoiceData.invoice_number}`, { align: 'right' });
        doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();
        doc.text('Bill To:', { underline: true });
        doc.text(customer.name || 'N/A');
        doc.text(customer.email || '');
        doc.text(customer.address || '');
        doc.moveDown(2);

        // Table Header
        const tableTop = doc.y;
        doc.fontSize(10);
        doc.text('Description', 50, tableTop);
        doc.text('Quantity', 280, tableTop, { width: 90, align: 'right' });
        doc.text('Unit Price', 370, tableTop, { width: 90, align: 'right' });
        doc.text('Total', 0, tableTop, { align: 'right' });
        doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

        // Table Rows
        let y = tableTop + 30;
        invoiceData.items.forEach(item => {
            doc.text(item.description, 50, y);
            doc.text(item.quantity.toString(), 280, y, { width: 90, align: 'right' });
            doc.text(`$${item.unit_price.toFixed(2)}`, 370, y, { width: 90, align: 'right' });
            doc.text(`$${(item.quantity * item.unit_price).toFixed(2)}`, 0, y, { align: 'right' });
            y += 20;
        });
        doc.moveTo(50, y).lineTo(550, y).stroke();
        doc.moveDown();

        // Total
        doc.fontSize(12).text(`Total: $${invoiceData.total_amount.toFixed(2)}`, { align: 'right' });

        // Footer
        doc.fontSize(8).text('Thank you for your business!', 50, 780, { align: 'center', width: 500 });

        doc.end();

        // Collect buffers
        const buffers = [];
        stream.on('data', buffers.push.bind(buffers));
        stream.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        stream.on('error', reject);
    });
}

module.exports = { generateInvoicePDF };
