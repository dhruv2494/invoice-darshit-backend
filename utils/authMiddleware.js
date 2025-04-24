const ErrorHandler = require('./../utils/default/errorHandler');
const jwt = require('jsonwebtoken')


exports.authTokenMiddleware = async (req, res, next) => {
try{
  let token;
  //		manual for authorization
  token = req.headers.authorization
  
  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }
  if
    (!token) {
    const error = new ErrorHandler(
      'Token Not Found !',
      500
    );
    return next(error);

  }
  else {
    let validated_token;
    try {
      
      validated_token = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      const error = new ErrorHandler(
        'Error While Validating Token !',
        500
      );
      return next(error);
    }
    req.sUserGUID = validated_token.sUserGUID;
    req.sUserName = validated_token.sUserName;
    
    next();

  }
}catch(error){
  console.log(error);
 return res.send(error)
 
}



}




