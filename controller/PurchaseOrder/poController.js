const { v4: uuidv4 } = require("uuid");
const ErrorHandler = require("../../utils/default/errorHandler");

exports.Create = async (req, res, next) => {
  const { dDate, nPrice, nQty, sCustGUID, sItemName, sRef } = req.body;
  const pool = req.pool;
  let results;
  let rows;
  genUUID = uuidv4();
  let createdpo;
  try {
    [results] = await pool.query(
      `INSERT INTO po(sPOGUID, nQty, sCustGUID, nPrice, sRef, sItemName, dDate) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [genUUID, nQty, sCustGUID, nPrice, sRef, sItemName, dDate]
    );
    // Retrieve the newly created po
    [rows] = await pool.query(`SELECT * FROM po WHERE sPOGUID = ?`, [genUUID]);
    createdpo = rows[0];
  } catch (err) {
    const error = new ErrorHandler("Error while Inserting po record!", 500);
    return next(error);
  }
  res.status(201);
  res.json({ Status: "201", Message: "Success", data: createdpo });
};

exports.Delete = async (req, res, next) => {
  const { sPOGUID } = req.params;
  const pool = req.pool;
  try {
    await pool.query(`DELETE FROM po  WHERE sPOGUID = ? `, [sPOGUID]);
  } catch (err) {
    const error = new ErrorHandler("Error while Deleting po record!", 200);
    return next(error);
  }
  res.status(200);
  res.json({ Status: "20", Message: "Success" });
};

exports.Get = async (req, res, next) => {
  const { sPOGUID } = req.query;
  const pool = req.pool;
  let conditions = [];
  let values = [];
  let filters = {
    "po.sPOGUID": { operator: "=", value: sPOGUID, AND_OR: " " },
  };

  let query =
    "SELECT po.dDate, po.dtCreatedOn, po.nPrice, po.nQty, po.sCreatedBy, po.sCustGUID, po.sItemName, po.sPOGUID, po.sRef From po ";
  Object.entries(filters).forEach(([key, { operator, value, AND_OR }]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "undefined"
    ) {
      conditions.push(`${AND_OR} ${key} ${operator} ?`);
      values.push(value);
    }
  });

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" ");
  }

  let selectedpo;
  try {
    const [rows] = await pool.query(query, values);
    selectedpo = rows[0];
  } catch (err) {
    const error = new ErrorHandler("Error while Selecting po record!", 500);
    return next(error);
  }
  res.status(201);
  res.json({ Status: "201", Message: "Success", data: selectedpo });
};

exports.Update = async (req, res, next) => {
  const { dDate, nPrice, nQty, sCustGUID, sItemName, sRef } = req.body;
  const { sPOGUID } = req.params;
  let results;
  let rows;
  const pool = req.pool;
  let updatedpo;
  try {
    await pool.query(
      `UPDATE po SET nQty = ?, sRef = ?, nPrice = ?, sCustGUID = ?, sItemName = ?, dDate = ? WHERE sPOGUID = ? `,
      [nQty, sRef, nPrice, sCustGUID, sItemName, dDate, sPOGUID]
    );
    const [rows] = await pool.query(`SELECT * FROM po WHERE sPOGUID = ? `, [
      sPOGUID,
    ]);
    updatedpo = rows[0];
  } catch (err) {
    const error = new ErrorHandler("Error while Updating po record!", 500);
    return next(error);
  }
  res.status(201);
  res.json({ Status: "201", Message: "Success", data: updatedpo });
};
