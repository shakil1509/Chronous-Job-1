const ScheduledTaskManager = require('../scheduled-task');
const JobModel = require('../../models/jobmodel'); // Import your Mongoose Job model
const path=require('path');
const taskManager = new ScheduledTaskManager();
const { exec } = require('child_process');
// Assuming the taskPath is static and known
const taskPath = path.join(__dirname, '../../', 'taskFile.js'); // Ensure this is the correct relative path from where the process is started


const executeTaskFile = (jobId) => {
    return function() {
        exec(`node ${taskPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }

            console.log(`stdout: ${jobId + ' =============== ' +stdout}`);

            if(stderr){
                console.error(`stderr: ${stderr}`);
            }

            //cb(stdout);
        });
    }
}


function scheduleJobsFromDatabase() {
    // Retrieve unscheduled jobs from the database
    JobModel.find({ status :'running' }).maxTimeMS(30000).then(jobs => {
        if (jobs.length === 0) {
            console.log('No eligible jobs to schedule.');
            taskManager.stopAllTasks();
            return;
        }
        console.log("jobs =============> ", jobs);
        jobs.forEach(job => {

            try {
                const jobId = job._id;
                job.attempts += 1;
                job.scheduled = true; // Mark as scheduled
                const taskId = taskManager.scheduleTask(jobId, job.cron_expression, executeTaskFile(jobId), { scheduled: job.scheduled });

                if (job.attempts >= job.max_attempts) {
                    // Stop the task if max attempts reached
                    job.scheduled = false; // Stop scheduling further
                    job.status='successful';
                    //job.attempts = 0;
                }
                //taskManager.scheduleTask(taskId, job.cron_expression, executeTaskFile(taskId), { scheduled: job.scheduled });
                job.save().then(() => {
                    console.log(`Job ${job._id} scheduled and marked as such in the database.`);
                    if (job.attempts >= job.max_attempts) {
                        setTimeout(() => {
                            const isExecuted = taskManager.stopTask(taskId);
                            if (isExecuted) {
                                console.log('Task '+taskId+' executed.');
                            } else {
                                console.log('Task not found or already finished.');
                            }
                        }, 1000);
                    }
                }).catch(err => {
                    console.error(`Failed to update job ${taskId} as scheduled in the database:`, err);
                });

            } catch (err) {
                console.error('Error creating scheduled task or executing task file:', err);
            }
        });
    }).catch(err => {
        console.error('Error retrieving unscheduled jobs from the database:', err);
    });
}



// Periodically check the database for unscheduled jobs and schedule them
setInterval(scheduleJobsFromDatabase, 60000); // Adjust the interval as needed

// Initial scheduling when the daemon starts
scheduleJobsFromDatabase();
