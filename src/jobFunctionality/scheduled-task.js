'use strict';

const EventEmitter = require('events');
const Task = require('./task');
const Scheduler = require('./scheduler');
const uuid = require('uuid');

class ScheduledTask extends EventEmitter {
    constructor(cronExpression, func, options) {
        super();
        if(!options){
            options = {
                scheduled: true,
                recoverMissedExecutions: false
            };
        }
      
        this.options = options;
        this.options.name = this.options.name || uuid.v4();

        this._task = new Task(func);
    // console.log("inside scheduled-task type of pattern--->",typeof(cronExpression))
    // console.log("inside scheduled-task type of pattern--->",cronExpression)


        this._scheduler = new Scheduler(cronExpression, options.timezone, options.recoverMissedExecutions);

        this._scheduler.on('scheduled-time-matched', (now) => {
            // console.log("Scheduled time matched:---->",now)
            this.now(now);
        });

        if(options.scheduled){
            this._scheduler.start();
        }

        if(!options.scheduled){
            this._scheduler.stop();
        }
        
        if(options.runOnInit === true){
            this.now('init');
        }
    }
    
    now(now = 'manual') {
        // console.log("now---->",now)
        let result = this._task.execute(now);
        // console.log("result---->",result);
        this.emit('task-done', result);
    }
    
    start() {
        this._scheduler.start();  
    }
    
    stop() {
        this._scheduler.stop();
    }
}

module.exports = ScheduledTask;