const Job=require('../models/jobmodel');
const chronos=require('../jobFunctionality/node-cron');


exports.createTask=async (req, res) => {
    const { name, cronExpression, taskPath, func, options, type } = req.body;
    console.log("func---->",func)
  
    let funcToExecute;
    if (type === 'scheduled') {
      // Convert string to function or require the module
      funcToExecute = new Function('return ' + func)();
    } else {
      funcToExecute = taskPath; // Background task uses path
    }
  
    // Using the provided schedule function
    const task =chronos.schedule(cronExpression, funcToExecute, { ...options, name });
  
    // Save the job details in MongoDB
    const job = new Job({
      name,
      cronExpression,
      taskPath,
      func, // Consider storing a path or identifier if the function is large
      options,
      type
    });
  
    try {
      await job.save();
      res.status(201).json({ message: 'Job scheduled successfully', jobId: job._id });
    } catch (error) {
      res.status(500).json({ message: 'Failed to schedule job', error: error.toString() });
    }
  }