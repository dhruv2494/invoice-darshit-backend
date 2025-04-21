const ErrorHandler = require('../utils/default/errorHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')


exports.login = async(req, res, next) => {
const {sUserName, sPassword} = req.body;
const pool = req.pool;
let conditions = [];
    let values = [];
    let filters = {
    "user.sUserName":{ operator: '=' , value: sUserName , AND_OR:  ' ' }
};

let query = 'SELECT user.sUserName, user.sPassword, user.sUserGUID From user '
Object.entries(filters).forEach(([key, { operator, value, AND_OR }]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'undefined') {
            conditions.push(`${AND_OR} ${key} ${operator} ?`);
            values.push(value);
        }
    });

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' ');
    }
    
let var_MUser_List;
try {

const [rows] = await pool.query(query, values);
        var_MUser_List = rows[0];

    } catch (err) {
        const error = new ErrorHandler(
            'Error While Finding Record !',
            500
        );
        return next(error);
    }
    if
 (!var_MUser_List  ){
const error = new ErrorHandler(
'User With this Username is not exists !',
400
);
return next(error);

}
else{
let validated_password = false;
try {
validated_password = await bcrypt.compare(sPassword, var_MUser_List.sPassword);
} catch (err) {
const error = new ErrorHandler(
'Error While Compare the Password !',
500
);
return next(error);
}
if
 (!validated_password  ){
const error = new ErrorHandler(
'Invalid Credentials !',
400
);
return next(error);

}
else{
let token_payload= { 
sUserGUID: '',
sUserName: ''
};
token_payload.sUserName = var_MUser_List.sUserName;
token_payload.sUserGUID = var_MUser_List.sUserGUID;
let token;
try {
token =  jwt.sign(token_payload, process.env.SECRET_KEY , { expiresIn: '1d' } );
} catch (err) {
const error = new ErrorHandler(
'Error While Generating Token !',
500
);
return next(error);
}
let cookieOptions = {
    expires: new Date(
      Date.now() + 1 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

res.status(200);
res.cookie('token', token, cookieOptions);
res.json({'token': token,'message': 'User Logged in !'});


}

}




}




