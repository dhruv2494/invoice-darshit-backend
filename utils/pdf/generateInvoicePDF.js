const PDFDocument = require('pdfkit');

function generateInvoicePDF(invoiceData) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- HEADER ---
            doc.fontSize(22).text('INVOICE', { align: 'right' });
            doc.moveDown(0.5);
            doc.fontSize(12).text(`Invoice #: ${invoiceData.invoice_number}`, { align: 'right' });
            doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, { align: 'right' });
            doc.text(`Status: ${invoiceData.status || ''}`, { align: 'right' });

            // --- CUSTOMER INFO ---
            doc.moveDown(1.5);
            doc.fontSize(14).text('Bill To:', { underline: true });
            const customer = invoiceData.customer || {};
            doc.fontSize(12)
                .text(customer.name || 'N/A')
                .text(customer.address || '')
                .text(`${customer.city || ''}, ${customer.state || ''} ${customer.pincode || ''}`)
                .text(`GST: ${customer.gst_number || '-'}`)
                .text(`Email: ${customer.email || '-'}`)
                .text(`Phone: ${customer.phone || '-'}`);

            // --- ITEMS TABLE HEADER ---
            doc.moveDown(1.5);
            doc.fontSize(13).text('Invoice Items:', { underline: true });
            doc.moveDown(0.5);

            // Table Header
            doc.font('Helvetica-Bold');
            doc.text('Item', 40, doc.y, { continued: true, width: 100 });
            doc.text('Gross', 150, doc.y, { continued: true, width: 50 });
            doc.text('Tare', 200, doc.y, { continued: true, width: 50 });
            doc.text('Net', 250, doc.y, { continued: true, width: 50 });
            doc.text('Clean', 300, doc.y, { continued: true, width: 50 });
            doc.text('Price', 350, doc.y, { continued: true, width: 50 });
            doc.text('Total', 400, doc.y, { width: 80 });
            doc.moveDown(0.2);
            doc.font('Helvetica');

            // Table Rows
            (invoiceData.items || []).forEach((item, idx) => {
                doc.text(item.item_name, 40, doc.y, { continued: true, width: 100 });
                doc.text(item.gross_weight, 150, doc.y, { continued: true, width: 50 });
                doc.text(item.tare_weight, 200, doc.y, { continued: true, width: 50 });
                doc.text(item.net_weight, 250, doc.y, { continued: true, width: 50 });
                doc.text(item.clean_weight, 300, doc.y, { continued: true, width: 50 });
                doc.text(item.price, 350, doc.y, { continued: true, width: 50 });
                doc.text(item.total_amount, 400, doc.y, { width: 80 });
                doc.moveDown(0.2);
            });

            // --- TOTALS, NOTES, TERMS ---
            doc.moveDown(1.5);
            doc.font('Helvetica-Bold').text(`Total Amount: ₹${invoiceData.total_amount}`, { align: 'right' });
            doc.font('Helvetica').moveDown(0.5);
            if (invoiceData.notes) {
                doc.text(`Notes: ${invoiceData.notes}`);
            }
            if (invoiceData.terms_conditions) {
                doc.text(`Terms: ${invoiceData.terms_conditions}`);
            }

            // --- FOOTER ---
            doc.moveDown(2);
            doc.fontSize(10).text('Thank you for your business!', { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = generateInvoicePDF;
