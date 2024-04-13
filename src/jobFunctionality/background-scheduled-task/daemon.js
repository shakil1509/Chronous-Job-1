// const ScheduledTask = require('../scheduled-task');

// let scheduledTask;

// function register(message){
//     const script = require(message.path);
//     scheduledTask = new ScheduledTask(message.cron, script.task, message.options);
//     scheduledTask.on('task-done', (result) => {
//         process.send({ type: 'task-done', result});
//     });
//     process.send({ type: 'registred' });
// }

// process.on('message', (message) => {
//     switch(message.type){
//     case 'register':
//         return register(message);
//     }
// });

const ScheduledTask = require('../scheduled-task');
const JobModel = require('../../models/jobmodel'); // Import your Mongoose Job model
const path=require('path');
const { exec } = require('child_process');
    // Assuming the taskPath is static and known
    let taskPath = path.join(__dirname, '..', 'taskFile.js'); // Ensure this is the correct relative path from where the process is started

function executeTaskFile() {
    exec(`node ${taskPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

function scheduleJobsFromDatabase() {
    // Retrieve unscheduled jobs from the database
    JobModel.find({ scheduled: false }).then(jobs=>{
        // Schedule each unscheduled job
        console.log("jobs",jobs)
        jobs.forEach(job => {
        console.log("Type of each cron expression", typeof(job.cron_expression))
            const scheduledTask = new ScheduledTask(job.cron_expression, executeTaskFile, job.options);
            console.log("scheduledTask---->",scheduledTask)
            scheduledTask.on('task-done', (result) => {
                process.send({ type: 'task-done', result});
                console.log('Job execution result:', result);
            });
            process.send({ type: 'registred' });
            // Optionally mark the job as scheduled in the database
        });
    }).catch(err=>{
        console.error('Error retrieving unscheduled jobs from the database:', err);
        return;
    })
}




// const mongoose = require('mongoose');

// const config = require('../../configs/config');

// async function scheduleJobsFromDatabase() {
//     // Connect to the database
//     try {
//         await mongoose.connect(config.MongoDB_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         console.log("Connected to the database inside scheduleJobsFromDatabase");
//     } catch (err) {
//         console.error("Error connecting to the database inside scheduleJobsFromDatabase:", err);
//         return;
//     }

//     try {
//         const jobs = await JobModel.find({ scheduled: false });
//         console.log("Jobs retrieved:", jobs);

//         for (let job of jobs) {
//             // Processing each job
//             const scheduledTask = new ScheduledTask(job.cronExpression, job.taskPath, job.options);
//             scheduledTask.on('task-done', async (result) => {
//                 console.log('Job execution result:', result);
//                 process.send({ type: 'task-done', result });

//                 // Disconnect after job done
//                 await mongoose.disconnect();
//                 console.log("Disconnected from the database after job inside scheduleJobsFromDatabase");

//                 // Reconnect for the next job
//                 await mongoose.connect(config.MongoDB_URI, {
//                     useNewUrlParser: true,
//                     useUnifiedTopology: true,
//                 });
//                 console.log("Reconnected to the database for the next job inside scheduleJobsFromDatabase");
//             });

//             process.send({ type: 'registred' });
//             // Optionally update the job as scheduled in the database here
//             // await JobModel.findByIdAndUpdate(job._id, { scheduled: true });
//         }
//     } catch (err) {
//         console.error("Error processing jobs:", err);
//     } finally {
//         // Ensure the database is disconnected at the end
//         await mongoose.disconnect();
//         console.log("Disconnected from the database");
//     }
// }

// module.exports = scheduleJobsFromDatabase;








// Periodically check the database for unscheduled jobs and schedule them
setInterval(scheduleJobsFromDatabase, 60000); // Adjust the interval as needed

// Initial scheduling when the daemon starts
scheduleJobsFromDatabase();

// Listen for new job submissions in real-time (optional)
JobModel.watch().on('change', change => {
    console.log("Change event received inside daemon:", change);
    if (change.operationType === 'insert' || change.operationType === 'update') {
        console.log("even on insert hit---->")
        scheduleJobsFromDatabase();
    }
    // Handle other types of changes (update, delete) if necessary
});
