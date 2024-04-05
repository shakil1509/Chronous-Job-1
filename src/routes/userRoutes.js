var express = require('express');
var router = express.Router();
const userController=require('../controllers/userController');
const verifyToken=require('../middlewares/authValidator')

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/signup',userController.signUp);

router.post('/login',userController.login);

module.exports=router;