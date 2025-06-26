const { v4: uuidv4 } = require('uuid');
const ErrorHandler = require('../utils/default/errorHandler');

const mapPoData = (po, items, customerRows) => ({
  id: po.id,
  poNumber: po.po_number,
  orderDate: po.order_date,
  expectedDeliveryDate: po.expected_delivery_date,
  supplierId: po.supplier_id,
  status: po.status,
  notes: po.notes,
  terms: po.terms,
  subtotal: po.subtotal,
  tax: po.tax,
  total: po.total,
  createdAt: po.created_at,
  items: items || [],
  supplier: customerRows || [],
});

exports.createPurchaseOrder = async (req, res, next) => {
  const {
    poNumber, orderDate, expectedDeliveryDate, supplierId, status, notes, terms, items
  } = req.body;

  if (!poNumber || !orderDate || !expectedDeliveryDate || !supplierId || !items || !items.length) {
    return next(new ErrorHandler('Missing required fields', 400));
  }

  const connection = await req.pool.getConnection();
  try {
    await connection.beginTransaction();

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const tax = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
    const total = subtotal + tax;
    const poId = uuidv4();

    const poData = {
      id: poId, po_number: poNumber, order_date: orderDate, expected_delivery_date: expectedDeliveryDate,
      supplier_id: supplierId, status, notes, terms, subtotal, tax, total
    };

    await connection.query('INSERT INTO purchase_orders SET ?', poData);

    const itemPromises = items.map(item => {
      const { productName,description, quantity, unitPrice, taxRate } = item;
      return connection.query('INSERT INTO po_items SET ?', {
        id: uuidv4(), po_id: poId, productName,description, quantity, unit_price: unitPrice, tax_rate: taxRate
      });
    });

    await Promise.all(itemPromises);
    await connection.commit();

    const newPo = { ...poData, items };
    res.status(201).json({ success: true, data: mapPoData(newPo, items) });

  } catch (error) {
    await connection.rollback();
    console.error('Create PO Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  } finally {
    connection.release();
  }
};

exports.getAllPurchaseOrders = async (req, res, next) => {
  try {
    const pool = req.pool;
    const [pos] = await pool.query(`
      SELECT po.*, c.name as supplier_name 
      FROM purchase_orders po
      JOIN customers c ON po.supplier_id = c.id
      ORDER BY po.order_date DESC
    `);
    res.status(200).json({ success: true, count: pos.length, data: pos });
  } catch (error) {
    console.error('Get All POs Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

exports.getPurchaseOrderById = async (req, res, next) => {
  try {
    const pool = req.pool;
    const { id } = req.params;

    const [poRows] = await pool.query('SELECT * FROM purchase_orders WHERE id = ?', [id]);
    if (poRows.length === 0) {
      return next(new ErrorHandler('Purchase order not found', 404));
    }

    const [itemRows] = await pool.query('SELECT * FROM po_items WHERE po_id = ?', [id]);
    const [customerRows] = await pool.query('SELECT * FROM customers WHERE id = ?', [poRows[0].supplier_id]);

    res.status(200).json({ success: true, data: mapPoData(poRows[0], itemRows, customerRows) });
  } catch (error) {
    console.error('Get PO By ID Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

exports.updatePurchaseOrder = async (req, res, next) => {
  const { id } = req.params;
  const { poNumber, orderDate, expectedDeliveryDate, supplierId, status, notes, terms, items } = req.body;

  const connection = await req.pool.getConnection();
  try {
    await connection.beginTransaction();

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const tax = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
    const total = subtotal + tax;

    await connection.query(
      'UPDATE purchase_orders SET ? WHERE id = ?',
      [{ po_number: poNumber, order_date: orderDate, expected_delivery_date: expectedDeliveryDate, supplier_id: supplierId, status, notes, terms, subtotal, tax, total }, id]
    );

    await connection.query('DELETE FROM po_items WHERE po_id = ?', [id]);

    const itemPromises = items.map(item => {
      const { productName,description, quantity, unitPrice, taxRate } = item;
      return connection.query('INSERT INTO po_items SET ?', {
        id: uuidv4(), po_id: id, productName,description, quantity, unit_price: unitPrice, tax_rate: taxRate
      });
    });

    await Promise.all(itemPromises);
    await connection.commit();

    res.status(200).json({ success: true, message: 'Purchase order updated successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Update PO Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  } finally {
    connection.release();
  }
};

exports.deletePurchaseOrder = async (req, res, next) => {
  const connection = await req.pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM po_items WHERE po_id = ?', [req.params.id]);
    const [result] = await connection.query('DELETE FROM purchase_orders WHERE id = ?', [req.params.id]);
    await connection.commit();

    if (result.affectedRows === 0) {
      return next(new ErrorHandler('Purchase order not found', 404));
    }

    res.status(200).json({ success: true, message: 'Purchase order deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete PO Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  } finally {
    connection.release();
  }
};
