// scheduled-task-manager.js
'use strict';

const EventEmitter = require('events');
const Task = require('./task');
const Scheduler = require('./scheduler');

class ScheduledTaskManager {
    constructor() {
        this.tasks = {};
    }

    scheduleTask(taskId, cronExpression, taskFunction, options) {
        const task = new Task(taskId, taskFunction);
        const scheduler = new Scheduler(cronExpression, options.timezone, options.recoverMissedExecutions,taskId);

        scheduler.on(taskId+'schedule', () => {
            task.execute('scheduled')
        });

        task.on(taskId+'taskFinished', () => {
            task.stop();
        });

        if (options.scheduled) {
            scheduler.start();
        }

        if (options.runOnInit === true) {
            task.execute('init');
        }

        this.tasks[taskId] = { task, scheduler };
        return taskId;
    }

    getAllTasks() {
        return this.tasks;
    }

    getTaskById(taskId) {
        if (this.tasks.length && this.tasks[taskId].hasOwnProperty('task')) {
            return this.tasks[taskId].task;
        } else {
            return {};
        }
    }

    stopTask(taskId) {
        const taskObj = this.tasks[taskId];
        if (taskObj) {
            taskObj.task.stop(); // Call stop method of the task
            taskObj.scheduler.stop();
            delete this.tasks[taskId];
            return true;
        }
        return false;
    }

    stopAllTasks() {
        Object.values(this.tasks).forEach(({ task,scheduler }) => {
            task.stop();
            scheduler.stop();
        });
    }
}

module.exports = ScheduledTaskManager;
