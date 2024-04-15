var express = require('express');
var router = express.Router();
const userController=require('../controllers/userController');
const authValidator=require('../middlewares/authValidator');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/signup',userController.signUp);

router.post('/login',userController.login);
// ,userController.extractUserDetails
router.get('/me',authValidator.verifyToken );

router.put('/update',authValidator.verifyToken,userController.updateUserDetails)

module.exports=router;