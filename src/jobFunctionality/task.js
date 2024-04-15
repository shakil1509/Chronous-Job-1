// task.js
'use strict';

const EventEmitter = require('events');

class Task extends EventEmitter {
    constructor(taskId, execution) {
        super();
        if (typeof execution !== 'function') {
            throw 'execution must be a function';
        }
        this.taskId = taskId;
        this._execution = execution;
        this._running = false;
        this._stopRequested = false;
    }

    execute(now) {
        if (!this._stopRequested && !this._running) {
            this._running = true;
            let exec;
            try {
                exec = this._execution(now, () => {
                    this._running = false;
                    //console.log(`Task ${this.taskId} stopped by request.`);
                });
            } catch (error) {
                this._running = false;
                console.error(`Task ${this.taskId} encountered an error:`, error);
                return this.emit('task-failed', error);
            }

            if (exec instanceof Promise) {
                return exec
                    .then(() => {
                        this._running = false;
                        //console.log(`Then Task ${this.taskId} finished.`);
                        this.emit(this.taskId+'taskFinished');
                    })
                    .catch((error) => {
                        this._running = false;
                        console.error(`Task ${this.taskId} encountered an error:`, error);
                        this.emit('task-failed', error);
                    });
            } else {
                this._running = false;
                //console.log(`Else Task ${this.taskId} finished.`);
                this.emit(this.taskId+'taskFinished');
                //this.stop()
                return exec;
            }
        } else {
            this._running = false;
            //console.log(`Task ${this.taskId} not executed as stop requested.`);
            return Promise.resolve();
        }
    }

    stop() {
        this._stopRequested = true;
        //console.log(`Stop requested for task ${this.taskId}`);
    }
}

module.exports = Task;
