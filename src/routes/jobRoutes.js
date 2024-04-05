var express = require('express');
var router = express.Router();
const jobController=require('../controllers/jobController');
const verifyToken=require('../middlewares/authValidator');



router.post('/submitJob',jobController.createTask);

module.exports=router;