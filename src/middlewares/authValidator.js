const bcrypt=require('bcrypt');
var jwt = require("jsonwebtoken");
const User=require('../models/userModel');
const config=require('../configs/config');
const JWT_SECRET_KEY=config.JWT_SECRET_KEY;


exports.verifyToken = (req, res, next) => {
    if(req.headers && req.headers.authorization) {
        jwt.verify(req.headers.authorization, JWT_SECRET_KEY, function(err, decode) {
            if(err) {
                req.user = undefined;
                req.message = "Header verification failed";
                // res.send({err})

                next();
            } else {
                User.findOne({
                    _id: decode.id
                }).select('-password').then(user => {
                    req.user = user;
                    // res.send({user})
                    req.message = "Found the user successfully";
                    console.log("Found the user successfully")
                    next();
                }).catch(err => {
                    req.user = undefined;
                    // res.send({err})
                    req.message = "Some error while finding the user";
                    next();
                });
            }
        });
    } else {
        req.user = undefined;
        req.message = "Authorization header not found";
        next();
        // res.send({err})
    }
};

exports.extractUserDetails = (req, res, next) => {
    if(req.headers && req.headers.authorization) {
        jwt.verify(req.headers.authorization, JWT_SECRET_KEY, function(err, decode) {
            if(err) {
                req.user = undefined;
                req.message = "Header verification failed";
                res.send({err})

                // next();
            } else {
                User.findOne({
                    _id: decode.id
                }).select('-password').then(user => {
                    req.user = user;
                    res.send({user})
                    // req.message = "Found the user successfully";
                    // next();
                }).catch(err => {
                    req.user = undefined;
                    res.send({err})
                    // req.message = "Some error while finding the user";
                    // next();
                });
            }
        });
    } else {
        req.user = undefined;
        req.message = "Authorization header not found";
        // next();
        res.send({err})
    }
};

exports.extractUserDetailsMiddleware= (req, res, next) => {
    var result={}
    const token = req.headers.authorization && req.headers.authorization.split(' ')[0];
    if(!token){
        console.log("inside extractUserDetails middleware !token")
        result.status = false;
        result.statusCode = 401;
        result.message = "Unauthorized: Token not provided";
        res.send(result);
    }

    jwt.verify(token, 'MySecretKey', (err, decoded) => {
      if (err) {
        console.log("inside extractUserDetails middleware")
        result.status = false;
        result.statusCode = 401;
        result.message = "Invalid: Token";
        res.send(result);
      }
  
      req.userDetails = decoded;
      console.log("decoded",decoded)
      // decoded {
      //   userId: 2,
      //   username: 'adib',
      //   is_admin: 0,
      //   iat: 1703776923,
      //   exp: 1703780523
      // }
      next();
    });
}