const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Mongoose schema for Jobs
const jobSchema = new mongoose.Schema({
    name: String,
    cronExpression: String,
    taskPath: String, // For BackgroundScheduledTask
    func: String, // Store function as string or path to module for ScheduledTask
    options: Object,
    type: 
        { type: String,
             enum: ['scheduled', 'background'] 
        } // Type of task
  });




// const jobSchema = new Schema({
//     title: { 
//         type: String,
//          required: true 
//     },
//     description: { 
//         type: String, 
//         required: true 
//     },
//     type: { 
//         type: String, 
//         enum: ['one-time', 'recurring'], 
//         required: true 
//     },
//     interval: { 
//         type: String 
//     }, // applicable for recurring jobs only
//     status: { 
//         type: String, 
//         enum: ['pending', 'running', 'completed', 'failed'], 
//         required: true 
//     },
//     scheduledAt: { 
//         type: Date, 
//         required: true 
//     },
//     createdAt: { 
//         type: Date, 
//         default: Date.now 
//     },
//     updatedAt: { 
//         type: Date, 
//         default: Date.now 
//     }
// });

// Define Mongoose schema for JobLogs
const jobLogSchema = new Schema({
    jobId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Job', 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

// Create mongoose models for Jobs and JobLogs
const Job = mongoose.model('Job', jobSchema);
const JobLog = mongoose.model('JobLog', jobLogSchema);

module.exports = { Job, JobLog };