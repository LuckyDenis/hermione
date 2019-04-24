'use strict';

const Workers = require('./workers');

module.exports = class WorkersRegistry {
    static create() {
        return new WorkersRegistry();
    }

    constructor() {
        this._registry = [];
    }

    register(params, workerFilepath, exportedMethods) {
        const workers = Workers.create(params, workerFilepath, exportedMethods);
        this._registry.push(workers);
        return workers;
    }

    endAll() {
        this._registry.forEach(workers => {
            if (!workers.isEnded()) {
                workers.end();
            }
        });
    }
};
