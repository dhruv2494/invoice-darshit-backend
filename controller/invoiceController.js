const { v4: uuidv4 } = require('uuid');
const ErrorHandler = require('../utils/default/errorHandler');

// CREATE Invoice
// exports.createInvoice = async (req, res, next) => {
//   const { customer_id, po_id, invoice_number, date, due_date, status, items, total_amount, notes, terms } = req.body;
//   if (!customer_id || !invoice_number || !date || !status || !items || !Array.isArray(items) || items.length === 0 || !total_amount) {
//     return next(new ErrorHandler('Missing required fields', 400));
//   }
//   const connection = await req.pool.getConnection();
//   try {
//     await connection.beginTransaction();
//     const id = uuidv4();
//     const invoiceData = {
//       id,
//       customer_id,
//       po_id: po_id || null,
//       invoice_number,
//       date,
//       due_date: due_date || null,
//       total_amount,
//       status,
//       notes: notes || '',
//       terms: terms || '',
//       created_at: new Date(),
//       updated_at: new Date(),
//     };
//     await connection.query('INSERT INTO invoices SET ?', invoiceData);
//     const itemPromises = items.map(item => {
//       const item_id = uuidv4();
//       return connection.query('INSERT INTO invoice_items SET ?', {
//         id: item_id,
//         invoice_id: id,
//         item_name: item.itemName,
//         gross_weight: item.grossWeight,
//         tare_weight: item.tareWeight,
//         net_weight: item.netWeight,
//         weighing_loss: item.weighingLoss,
//         clean_weight: item.cleanWeight,
//         container: item.container,
//         price: item.price,
//         labor_charges: item.laborCharges,
//         deduction: item.deduction,
//         air_loss: item.airLoss,
//         net_deduction: item.netDeduction,
//         total_amount: item.totalAmount,
//       });
//     });
//     await Promise.all(itemPromises);
//     await connection.commit();
//     res.status(201).json({ success: true, message: 'Invoice created successfully', data: { id } });
//   } catch (error) {
//     await connection.rollback();
//     console.error('Create Invoice Error:', error);
//     return next(new ErrorHandler('Server Error', 500));
//   } finally {
//     connection.release();
//   }
// };

// // GET ALL Invoices
// // exports.getAllInvoices = async (req, res, next) => {
// //   try {
// //     const pool = req.pool;
// //     const [rows] = await pool.query('SELECT * FROM invoices ORDER BY date DESC');
// //     res.status(200).json({ success: true, count: rows.length, data: rows });
// //   } catch (error) {
// //     console.error('Get All Invoices Error:', error);
// //     return next(new ErrorHandler('Server Error', 500));
// //   }
// // };
// exports.getAllInvoices = async (req, res, next) => {
//   console.log("hello");
//   try {
//     const pool = req.pool;
//     const [rows] = await pool.query('SELECT * FROM invoices ORDER BY date DESC');
//     rows.forEach(async row => {
//       const [customer_rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [row.customer_id]);
//       console.log(customer_rows);
//       row.customer = customer_rows[0];
//     });
//     res.status(200).json({  data: rows });
//   } catch (error) {
//     console.error('Get All Invoices Error:', error);
//     return next(new ErrorHandler('Server Error', 500));
//   }
// };




// // GET Invoice by ID
// exports.getInvoiceById = async (req, res, next) => {
//   try {
//     const pool = req.pool;
//     const [invoice_rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
//     if (invoice_rows.length === 0) {
//       return next(new ErrorHandler('Invoice not found', 404));
//     }
//     const [item_rows] = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id]);
//     // console.log(item_rows);
//     const [customer_rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [invoice_rows[0].customer_id]);
//     const invoice = { ...invoice_rows[0], items: item_rows, customer: customer_rows[0] };
//     res.status(200).json({ success: true, data: invoice });
//   } catch (error) {
//     console.error('Get Invoice By ID Error:', error);
//     return next(new ErrorHandler('Server Error', 500));
//   }
// };

// // UPDATE Invoice
// exports.updateInvoice = async (req, res, next) => {
//   const { customer_id, po_id, invoice_number, date, due_date, status, items, total_amount, notes, terms } = req.body;
//   const connection = await req.pool.getConnection();
//   try {
//     await connection.beginTransaction();
//     const [result] = await connection.query(
//       'UPDATE invoices SET customer_id=?, po_id=?, invoice_number=?, date=?, due_date=?, total_amount=?, status=?, notes=?, terms=?, updated_at=? WHERE id=?',
//       [customer_id, po_id || null, invoice_number, date, due_date || null, total_amount, status, notes || '', terms || '', new Date(), req.params.id]
//     );
//     if (result.affectedRows === 0) {
//       await connection.rollback();
//       return next(new ErrorHandler('Invoice not found', 404));
//     }
//     await connection.query('DELETE FROM invoice_items WHERE invoice_id = ?', [req.params.id]);
//     const itemPromises = items.map(item => {
//       const item_id = uuidv4();
//       return connection.query('INSERT INTO invoice_items SET ?', {
//         id: item_id,
//         invoice_id: req.params.id,
//         item_name: item.itemName,
//         gross_weight: item.grossWeight,
//         tare_weight: item.tareWeight,
//         net_weight: item.netWeight,
//         weighing_loss: item.weighingLoss,
//         clean_weight: item.cleanWeight,
//         container: item.container,
//         price: item.price,
//         labor_charges: item.laborCharges,
//         deduction: item.deduction,
//         air_loss: item.airLoss,
//         net_deduction: item.netDeduction,
//         total_amount: item.totalAmount,
//       });
//     });
//     await Promise.all(itemPromises);
//     await connection.commit();
//     res.status(200).json({ success: true, message: 'Invoice updated successfully' });
//   } catch (error) {
//     await connection.rollback();
//     console.error('Update Invoice Error:', error);
//     return next(new ErrorHandler('Server Error', 500));
//   } finally {
//     connection.release();
//   }
// };

// // DELETE Invoice
// exports.deleteInvoice = async (req, res, next) => {
//   const connection = await req.pool.getConnection();
//   try {
//     await connection.beginTransaction();
//     await connection.query('DELETE FROM invoice_items WHERE invoice_id = ?', [req.params.id]);
//     const [result] = await connection.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);
//     await connection.commit();
//     if (result.affectedRows === 0) {
//       return next(new ErrorHandler('Invoice not found', 404));
//     }
//     res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
//   } catch (error) {
//     await connection.rollback();
//     console.error('Delete Invoice Error:', error);
//     return next(new ErrorHandler('Server Error', 500));
//   } finally {
//     connection.release();
//   }
// };

const generateInvoicePDF = require('../utils/pdf/generateInvoicePDF');

/**
 * @description Create a new invoice
 * @route POST /api/invoices
 * @access Private
 */
exports.createInvoice = async (req, res, next) => {
  const { customer_id, po_id, invoice_number, date, items, total_amount } = req.body;

  if (!customer_id || !invoice_number || !date || !items || !total_amount) {
    return next(new ErrorHandler('Please provide all required fields', 400));
  }

  try {
    const pool = req.pool;
    const id = uuidv4();

    await pool.query(
      'INSERT INTO invoices (id, customer_id, po_id, invoice_number, date, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [id, customer_id, po_id, invoice_number, date, total_amount]
    );

    const itemPromises = items.map(item => {
      const item_id = uuidv4();
      return pool.query(
        'INSERT INTO invoice_items (id, invoice_id, item_name, gross_weight, tare_weight, net_weight, weighing_loss, clean_weight, container, price, labor_charges, deduction, air_loss, net_deduction, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [item_id, id, item.item_name, item.gross_weight, item.tare_weight, item.net_weight, item.weighing_loss, item.clean_weight, item.container, item.price, item.labor_charges, item.deduction, item.air_loss, item.net_deduction, item.total_amount]
      );
    });

    await Promise.all(itemPromises);

    res.status(201).json({ success: true, message: 'Invoice created successfully', data: { id } });
  } catch (error) {
    console.error('Create Invoice Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

/**
 * @description Get all invoices
 * @route GET /api/invoices
 * @access Private
 */
exports.getAllInvoices = async (req, res, next) => {
  try {
    const pool = req.pool;

    const [rows] = await pool.query(`
      SELECT 
        invoices.*, 
        customers.name AS customer_name,
        purchase_orders.po_number
      FROM invoices
      LEFT JOIN customers ON invoices.customer_id = customers.id
      LEFT JOIN purchase_orders ON invoices.po_id = purchase_orders.id
      ORDER BY invoices.date DESC
    `);

    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Get All Invoices Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};



/**
 * @description Get a single invoice by ID
 * @route GET /api/invoices/:id
 * @access Private
 */
exports.getInvoiceById = async (req, res, next) => {
  try {
    const pool = req.pool;
    const [invoice_rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [req.params.id]);

    if (invoice_rows.length === 0) {
      return next(new ErrorHandler('Invoice not found', 404));
    }

    const [item_rows] = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id]);
 const [purchase_order_rows] = await pool.query('SELECT * FROM purchase_orders WHERE id = ?', [invoice_rows[0].po_id]);
    const [customer_rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [invoice_rows[0].customer_id]);
    const invoice = { ...invoice_rows[0], items: item_rows, customer: customer_rows[0], purchase_order: purchase_order_rows[0] };

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error('Get Invoice By ID Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

/**
 * @description Update an invoice
 * @route PUT /api/invoices/:id
 * @access Private
 */
exports.updateInvoice = async (req, res, next) => {
  const { customer_id, po_id, invoice_number, date, total_amount, items } = req.body;

  try {
    const pool = req.pool;

    // Step 1: Update the invoice header
    const [result] = await pool.query(
      'UPDATE invoices SET customer_id = ?, po_id = ?, invoice_number = ?, date = ?, total_amount = ? WHERE id = ?',
      [customer_id, po_id, invoice_number, date, total_amount, req.params.id]
    );

    if (result.affectedRows === 0) {
      return next(new ErrorHandler('Invoice not found', 404));
    }

    // Step 2: Delete removed invoice items
    const passedItemIds = items.map(item => item.id).filter(Boolean);

    if (passedItemIds.length > 0) {
      await pool.query(
        `DELETE FROM invoice_items WHERE invoice_id = ? AND id NOT IN (${passedItemIds.map(() => '?').join(',')})`,
        [req.params.id, ...passedItemIds]
      );
    } else {
      // If no item IDs provided, delete all items for this invoice
      await pool.query('DELETE FROM invoice_items WHERE invoice_id = ?', [req.params.id]);
    }

    // Step 3: Insert or update each item
    const itemPromises = items.map(item => {
      const item_id = item.id || uuidv4();
      return pool.query(
        `INSERT INTO invoice_items (
          id, invoice_id, item_name, gross_weight, tare_weight, net_weight, weighing_loss, clean_weight, container, price,
          labor_charges, deduction, air_loss, net_deduction, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          item_name = VALUES(item_name),
          gross_weight = VALUES(gross_weight),
          tare_weight = VALUES(tare_weight),
          net_weight = VALUES(net_weight),
          weighing_loss = VALUES(weighing_loss),
          clean_weight = VALUES(clean_weight),
          container = VALUES(container),
          price = VALUES(price),
          labor_charges = VALUES(labor_charges),
          deduction = VALUES(deduction),
          air_loss = VALUES(air_loss),
          net_deduction = VALUES(net_deduction),
          total_amount = VALUES(total_amount)`,
        [
          item_id, req.params.id, item.item_name, item.gross_weight, item.tare_weight, item.net_weight,
          item.weighing_loss, item.clean_weight, item.container, item.price, item.labor_charges,
          item.deduction, item.air_loss, item.net_deduction, item.total_amount
        ]
      );
    });

    await Promise.all(itemPromises);

    // Step 4: Respond to client
    res.status(200).json({ success: true, message: 'Invoice updated successfully' });

  } catch (error) {
    console.error('Update Invoice Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

/**
 * @description Delete an invoice
 * @route DELETE /api/invoices/:id
 * @access Private
 */
exports.deleteInvoice = async (req, res, next) => {
  try {
    const pool = req.pool;
    const [result] = await pool.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return next(new ErrorHandler('Invoice not found', 404));
    }

    res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete Invoice Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

/**
 * @description Download an invoice as PDF
 * @route GET /api/invoices/:id/download
 * @access Private
 */

exports.downloadInvoicePDF = async (req, res, next) => {
    try {
        const pool = req.pool;
        const [invoice_rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
        if (invoice_rows.length === 0) {
            return next(new ErrorHandler('Invoice not found', 404));
        }
        const [item_rows] = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id]);
        const [customer_rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [invoice_rows[0].customer_id]);
        const invoiceData = {
            ...invoice_rows[0],
            items: item_rows,
            customer: customer_rows[0]
        };
        const pdfBuffer = await generateInvoicePDF(invoiceData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoiceData.invoice_number}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer); // ✅ use end() for binary data
        
    } catch (error) {
        console.error('Download Invoice PDF Error:', error);
        return next(new ErrorHandler('Server Error', 500));
    }
};
