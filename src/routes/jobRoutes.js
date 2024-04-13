var express = require('express');
var router = express.Router();
const jobController=require('../controllers/jobController');
const authValidator=require('../middlewares/authValidator');



router.post('/submitJob',authValidator.verifyToken,jobController.submitJob);
router.get('/fetchJob/:id',authValidator.verifyToken,jobController.getJobById);
router.get('/fetchJobs',authValidator.verifyToken,jobController.getAllJobs);
router.put('/update/:id',authValidator.verifyToken,jobController.updateJob);
router.delete('/delete/:id',authValidator.verifyToken,jobController.deleteJob);
router.post('/stop/:id',authValidator.verifyToken,jobController.stopJob);
router.get('/test',jobController.test);


module.exports=router;