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
    let taskPath = path.join(__dirname, '../../', 'taskFile.js'); // Ensure this is the correct relative path from where the process is started

// function executeTaskFile() {
//     exec(`node ${taskPath}`, (error, stdout, stderr) => {
//         if (error) {
//             console.error(`exec error: ${error}`);
//             return;
//         }
//         if(stderr){
//         console.error(`stderr: ${stderr}`);
//         }
//         console.log(`stdout: ${stdout}`);

//     });
// }

function executeTaskFile(jobId) {
    return function() {
        const taskPath = path.join(__dirname, '../../', 'taskFile.js'); // Ensure correct path
        exec(`node ${taskPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            if(stderr){
                console.error(`stderr: ${stderr}`);
            }
            // Handle task completion by updating attempts and checking for max_attempts
            // JobModel.findById(jobId).then(job => {
            //     if (job.attempts + 1 >= job.max_attempts) {
            //         // Stop the task if max attempts reached
            //         job.status = 'successful'; // Stop scheduling further
            //     }
            //     job.attempts += 1; // Increment attempt count
            //     job.save(); // Save changes
            }).catch(err => {
                console.error('Error executing jobs', err);
            });
    }
}


function scheduleJobsFromDatabase() {
    // Retrieve unscheduled jobs from the database
    JobModel.find({ status :'running' }).then(jobs => {
        if (jobs.length === 0) {
            console.log('No eligible jobs to schedule.');
            return;
        }
        console.log("jobs", jobs);
        jobs.forEach(job => {
            const scheduledTask = new ScheduledTask(job.cron_expression, executeTaskFile(job._id), job.options);
            job.attempts += 1;
            job.scheduled = true; // Mark as scheduled
            if (job.attempts>= job.max_attempts) {
                // Stop the task if max attempts reached
                job.scheduled = false; // Stop scheduling further
                job.status='successful'
            }
            job.save().then(() => {
                console.log(`Job ${job._id} scheduled and marked as such in the database.`);
            }).catch(err => {
                console.error(`Failed to update job ${job._id} as scheduled in the database:`, err);
            });

            scheduledTask.on('task-done', (result) => {
                // console.log('Job execution result:', result);
            });
        });
    }).catch(err => {
        console.error('Error retrieving unscheduled jobs from the database:', err);
    });
}


//2:40pm
// function executeTaskFile(jobId) {
//     return function() {
//         const taskPath = path.join(__dirname, '../../', 'taskFile.js'); // Ensure the path is correct
//         exec(`node ${taskPath}`, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`exec error: ${error}`);
//                 return;
//             }
//             console.log(`stdout: ${stdout}`);
//             if (stderr) {
//                 console.error(`stderr: ${stderr}`);
//             }

//             // Update the job's attempts count after execution
//             JobModel.findById(jobId).then(job => {
//                 console.log(`atempt no ${job.attempts} of job id: ${job._id}`);
//                 job.attempts += 1; // Increment attempt count
//                 if (job.attempts >= job.max_attempts) {
//                     job.scheduled = false; // Stop scheduling if max attempts reached
//                 }
//                 job.save() // Save the updated job back to the database
//                     .then(() => {
//                         console.log(`Job id ${job._id} attempt count updated to ${job.attempts}`);
//                         if (!job.scheduled) {
//                             console.log(`Job ${job._id} has reached maximum attempt limit and will no longer be scheduled.`);
//                         }
//                     })
//                     .catch(err => {
//                         console.error('Error saving job attempts:', err);
//                     });
//             }).catch(err => {
//                 console.error('Error retrieving job to update attempts:', err);
//             });
//         });
//     }
// }

// function scheduleJobsFromDatabase() {
//     JobModel.find({
//         "status": "running",
//         "$expr": {
//           "$lt": ["$attempts", "$max_attempts"]
//         }
//       }).then(jobs => {
//         jobs.forEach(job => {
            // if (jobs.length === 0) {
            //     console.log('No eligible jobs to schedule.');
            //     return;
            // }
//             const scheduledTask = new ScheduledTask(job.cron_expression, executeTaskFile(job._id), job.options);
//             job.scheduled = true; // Mark as scheduled
//             job.save().then(() => {
//                 console.log(`Job ${job._id} scheduled and marked as such in the database.`);
//             }).catch(err => {
//                 console.error(`Failed to update job ${job._id} as scheduled in the database:`, err);
//             });

//             scheduledTask.on('task-done', (result) => {
//                 console.log('Job execution result:', result);
//             });
//         });
//     }).catch(err => {
//         console.error('Error retrieving unscheduled jobs from the database:', err);
//     });
// }


// function scheduleJobsFromDatabase() {
//     // Retrieve unscheduled jobs from the database
//     JobModel.find({ scheduled: false }).then(jobs=>{
//         // Schedule each unscheduled job
//         console.log("jobs",jobs)
//         jobs.forEach(job => {
//         console.log("Type of each cron expression", typeof(job.cron_expression))
//             const scheduledTask = new ScheduledTask(job.cron_expression, executeTaskFile, job.options);
//             console.log("scheduledTask---->",scheduledTask)
//             scheduledTask.on('task-done', (result) => {
//                 // process.send({ type: 'task-done', result});
//                 console.log('Job execution result:', result);
//             });
//             // process.send({ type: 'registred' });
//             // Optionally mark the job as scheduled in the database
//         });
//     }).catch(err=>{
//         console.error('Error retrieving unscheduled jobs from the database:', err);
//         return;
//     })
// }




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
// JobModel.watch().on('change', change => {
//     console.log("Change event received inside daemon:", change);
//     if (change.operationType === 'insert' || change.operationType === 'update') {
//         console.log("even on insert hit---->")
//         scheduleJobsFromDatabase();
//     }
//     // Handle other types of changes (update, delete) if necessary
// });
