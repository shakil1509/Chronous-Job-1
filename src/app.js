const express=require('express');
const app=express();
const mongodbcon=require('../src/connections/mongoDbCon');
const userRoutes=require('../src/routes/userRoutes');
const jobRoutes=require('../src/routes/jobRoutes');
const config=require('../src/configs/config');
const cron=require('./jobFunctionality/node-cron');
const daemon=require('../src/jobFunctionality/background-scheduled-task/daemon');
const PORT_NUMBER=config.PORT_NUMBER;


app.use(express.json());

global.runningJobs = {};

app.get('/',(req,res)=>{
    return res.status(200).send("Hello World!")
})

app.use('/users',userRoutes);
app.use('/jobs',jobRoutes);

// cron.schedule('* * * * * *',()=>{
//     console.log("Running after every second")
// })
app.listen(PORT_NUMBER, () => {
    console.log(`server is listening to PORT no ${PORT_NUMBER}`);
});



module.exports=app;