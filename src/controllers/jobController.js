const Job=require('../models/jobmodel');
const chronos=require('../jobFunctionality/node-cron');
const startBackgroundTask=require('../jobFunctionality/startBackgroundTask')
const ScheduledTaskManager = require('../jobFunctionality/scheduled-task');
const taskManager = new ScheduledTaskManager();

exports.submitJob = async (req, res) => {
  try {
      // Extract user_id from the token using verifyToken middleware
      const user_id = req.user._id; // Assuming the user id is stored in _id field
      console.log("user_id",user_id)
      // Get job details from the request body
      const { cron_expression, isRecurring, max_attempts } = req.body;

      // Create a new job instance
      const job = new Job({
          user_id,
          cron_expression,
          isRecurring,
          max_attempts
      });

      // Save the job details to the database
      await job.save();

      startBackgroundTask(cron_expression, job._id.toString())

      // Send success response
      res.status(201).json({ message: 'Job submitted successfully', job });
  } catch (error) {
      console.error('Error submitting job:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getJobById=async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user._id; // Assuming the user ID is extracted from the token

  try {
      const job = await Job.findOne({ _id: jobId, user_id: userId });

      if (!job) {
          return res.status(404).json({ message: 'Job not found' });
      }

      return res.status(200).json({ job });
  } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

exports.getAllJobs=async (req, res) => {
  const userId = req.user._id; // Assuming the user ID is extracted from the token

  try {
      const jobs = await Job.find({ user_id: userId });

      if (jobs.length === 0) {
          return res.status(404).json({ message: 'No jobs found for this user' });
      }

      return res.status(200).json({ jobs });
  } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

exports.updateJob=async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user._id; // Assuming the user ID is extracted from the token
  const { cron_expression, isRecurring, max_attempts } = req.body;

  // Validate input parameters and user permissions
  // ...

  try {
      const job = await Job.findOneAndUpdate(
          { _id: jobId, user_id: userId },
          { cron_expression, isRecurring, max_attempts },
          { new: true }
      );

      if (!job) {
          return res.status(404).json({ message: 'Job not found' });
      }

      return res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

exports.deleteJob=async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user._id; // Assuming the user ID is extracted from the token

  // Validate input parameter and user permissions
  // ...

  try {
      const job = await Job.findOneAndDelete({ _id: jobId, user_id: userId });

      if (!job) {
          return res.status(404).json({ message: 'Job not found' });
      }

      return res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

exports.stopJob=async (req, res) => {
  const jobId = req.params.id;
  //const userId = req.user._id; // Assuming the user ID is extracted from the token

  // Validate input parameter and user permissions
  // ...

  try {
        const task = taskManager.getTaskById(jobId);
      if ((Object.keys(task)).length){
          task.stop()
          return res.status(200).json({ message: 'Task stopped successfully' });
      } else {
          return res.status(400).json({ message: 'No task found' });
      }

      //return res.status(200).json({ message: 'Task stopped successfully' });
  } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

exports.test=async(req, res)=>{
  try {
    const job = await Job.find({ scheduled:false });

    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({ job });
  } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}


// exports.createTask=async (req, res) => {
//     const { name, cronExpression, taskPath, func, options, type } = req.body;
//     console.log("func---->",func)
  
//     let funcToExecute;
//     if (type === 'scheduled') {
//       // Convert string to function or require the module
//       funcToExecute = new Function('return ' + func)();
//     } else {
//       funcToExecute = taskPath; // Background task uses path
//     }
  
//     // Using the provided schedule function
//     const task =chronos.schedule(cronExpression, funcToExecute, { ...options, name });
  
//     // Save the job details in MongoDB
//     const job = new Job({
//       name,
//       cronExpression,
//       taskPath,
//       func, // Consider storing a path or identifier if the function is large
//       options,
//       type
//     });
  
//     try {
//       await job.save();
//       res.status(201).json({ message: 'Job scheduled successfully', jobId: job._id });
//     } catch (error) {
//       res.status(500).json({ message: 'Failed to schedule job', error: error.toString() });
//     }
//   }

// Job.watch().on('change', (change) => {
//   console.log('Change event received:', change);
// });