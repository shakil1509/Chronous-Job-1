const ScheduledTask = require('../scheduled-task');
const JobModel = require('../../models/jobmodel'); // Import your Mongoose Job model
const path=require('path');
const { exec } = require('child_process');
    // Assuming the taskPath is static and known
    const taskPath = path.join(__dirname, '../../', 'taskFile.js'); // Ensure this is the correct relative path from where the process is started


// Map to store references to spawned processes
const runningTasks = new Map();

// Function to execute a task file by jobId
function executeTaskFile(jobId) {
    return function() {
        if (runningTasks.size) {
            Promise.all(runningTasks.values()).then(() => {
                console.log('All processes completed');
            }).catch(error => {
                console.error('Error executing tasks:', error);
            });
        }
        console.log('runningTasks:', runningTasks);
    };
}

// Function to terminate a task by jobId
function terminateTask(jobId) {
    const taskProcess = runningTasks.get(jobId);
    if (taskProcess) {
        taskProcess.kill(); // Terminate the task
        runningTasks.delete(jobId); // Remove the reference from the map
    } else {
        console.error(`Task with jobId ${jobId} not found.`);
    }
}

// Function to schedule jobs from the database
function scheduleJobsFromDatabase() {
    // Retrieve unscheduled jobs from the database
    JobModel.find({ status :'running' }).maxTimeMS(30000).then(jobs => {
        if (jobs.length === 0) {
            console.log('No eligible jobs to schedule.');
            return;
        }
        console.log("jobs =============> ", jobs);
        jobs.forEach(job => {
            try {
                job.attempts += 1;
                job.scheduled = true; // Mark as scheduled
                if (job.attempts >= job.max_attempts) {
                    // Stop the task if max attempts reached
                    job.scheduled = false; // Stop scheduling further
                    job.status = 'successful';
                } else {
                    const taskProcess = exec(`node ${taskPath}`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`exec error: ${error}`);
                            return;
                        }
                        console.log(`stdout: ${job._id + ' =============== ' + stdout}`);

                        if (stderr) {
                            console.error(`stderr: ${stderr}`);
                        }
                    });
                    // Store the reference to the spawned process
                    runningTasks.set(job._id, taskProcess);
                }
                job.save().then(() => {
                    console.log(`Job ${job._id} scheduled and marked as such in the database. Attempts: ${job.attempts}/${job.max_attempts}`);
                    if (job.attempts == job.max_attempts) terminateTask(job._id);
                }).catch(err => {
                    console.error(`Failed to update job ${job._id} as scheduled in the database:`, err);
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
