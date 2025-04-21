const ErrorHandler = require('../../utils/default/errorHandler');
const { v4: uuidv4 } = require("uuid");


exports.customer_data = async(req, res, next) => {
const pool = req.pool;
let conditions = [];
    let values = [];
    let filters = {
 
};

let query = 'SELECT customer.sCustGUID, customer.sCustName, customer.sCustEmail From customer '
Object.entries(filters).forEach(([key, { operator, value, AND_OR }]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'undefined') {
            conditions.push(`${AND_OR} ${key} ${operator} ?`);
            values.push(value);
        }
    });

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' ');
    }
    
let var_customer_list;
try {

const [rows] = await pool.query(query, values);
        var_customer_list = rows;

    } catch (err) {
        const error = new ErrorHandler(
            'Error While Fetching Record !',
            500
        );
        return next(error);
    }
    res.status(200);
res.json({'message': 'Record Fetched !','data': var_customer_list});




}




