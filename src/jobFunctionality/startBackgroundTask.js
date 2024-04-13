const BackgroundScheduledTask = require('./background-scheduled-task'); // Adjust path as necessary
const path=require('path');
// console.log("taskPath", taskPath);
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


/**
 * Starts a background task based on the given parameters and tracks it.
 * 
 * @param {string} cronExpression The cron expression for scheduling the task.
 * @param {string} taskPath The path to the task file to be executed.
 * @param {string} jobId The unique identifier for the job.
 */
function startBackgroundTask(cronExpression, jobId) {


    // Create a new instance of the task with the provided cron expression and task path
    const backgroundTask = new BackgroundScheduledTask(cronExpression, executeTaskFile, { scheduled: true });
    // console.log("backgroundtask---->",backgroundTask)

    // Track the task using its jobId
    global.runningJobs[jobId] = backgroundTask;

    // Optionally, listen for task completion or errors to handle those cases
    backgroundTask.on('task-done', (result) => {
        console.log(`Task ${jobId} completed with result:`, result);
        // Handle task completion as necessary
    });

    backgroundTask.on('error', (error) => {
        console.error(`Task ${jobId} encountered an error:`, error);
        // Handle errors as necessary
    });

    // The task will automatically start running based on the cron schedule
}

module.exports = startBackgroundTask;
