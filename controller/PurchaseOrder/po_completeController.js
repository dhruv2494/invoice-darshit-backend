const { v4: uuidv4 } = require("uuid");
const ErrorHandler = require('../../utils/default/errorHandler');


exports.Create = async(req, res, next) => {
const {nPayment, nWeight, sPOGUID, sStatus} = req.body;
const pool = req.pool;
let results
let rows
genUUID = uuidv4();
let createdpo_complete;
try {
[results] = await pool.query(
`INSERT INTO po_complete(sPOGUID, nPayment, sStatus, sPO_CompleteGUID, nWeight) VALUES (?, ?, ?, ?, ?)`,
[sPOGUID, nPayment, sStatus, genUUID, nWeight],
);
// Retrieve the newly created po_complete
[rows] = await pool.query(
`SELECT * FROM po_complete WHERE sPO_CompleteGUID = ?`,
[genUUID]
);
createdpo_complete = rows[0];

} catch (err) {
const error = new ErrorHandler(
'Error while Inserting po_complete record!',
500
);
return next(error);
}
res.status(201);
res.json({'Status': '201','Message': 'Success','data': createdpo_complete});




}

exports.Delete = async(req, res, next) => {
const {sPO_CompleteGUID} = req.params;
const pool = req.pool;
try {

await pool.query(
`DELETE FROM po_complete  WHERE sPO_CompleteGUID = ? `, 
[sPO_CompleteGUID],
);
} catch (err) {
const error = new ErrorHandler(
'Error while Deleting po_complete record!',
200
);
return next(error);
}
res.status(200);
res.json({'Status': '20','Message': 'Success'});




}

exports.Get = async(req, res, next) => {
const {sPO_CompleteGUID} = req.query;
const pool = req.pool;
let conditions = [];
    let values = [];
    let filters = {
    "po_complete.sPO_CompleteGUID":{ operator: '=' , value: sPO_CompleteGUID , AND_OR:  ' ' }
};

let query = 'SELECT po_complete.dtCreatedOn, po_complete.nPayment, po_complete.nWeight, po_complete.sCreatedByGUID, po_complete.sPO_CompleteGUID, po_complete.sPOGUID, po_complete.sStatus From po_complete '
Object.entries(filters).forEach(([key, { operator, value, AND_OR }]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'undefined') {
            conditions.push(`${AND_OR} ${key} ${operator} ?`);
            values.push(value);
        }
    });

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' ');
    }
    
let selectedpo_complete;
try {

const [rows] = await pool.query(query, values);
        selectedpo_complete = rows[0];

    } catch (err) {
        const error = new ErrorHandler(
            'Error while Selecting po_complete record!',
            500
        );
        return next(error);
    }
    res.status(201);
res.json({'Status': '201','Message': 'Success','data': selectedpo_complete});




}

exports.Update = async(req, res, next) => {
const {nPayment, nWeight, sPOGUID, sStatus} = req.body;
const {sPO_CompleteGUID} = req.params;
let results
let rows
const pool = req.pool;
let updatedpo_complete;
try {

await pool.query(
`UPDATE po_complete SET nWeight = ?, nPayment = ?, sStatus = ?, sPOGUID = ? WHERE sPO_CompleteGUID = ? `, 
[nWeight, nPayment, sStatus, sPOGUID, sPO_CompleteGUID],
);
const [rows] = await pool.query(
`SELECT * FROM po_complete WHERE sPO_CompleteGUID = ? `,
[sPO_CompleteGUID]
);
updatedpo_complete = rows[0];
} catch (err) {
const error = new ErrorHandler(
'Error while Updating po_complete record!',
500
);
return next(error);
}
res.status(201);
res.json({'Status': '201','Message': 'Success','data': updatedpo_complete});




}




