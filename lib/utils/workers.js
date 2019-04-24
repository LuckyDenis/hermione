'use strict';

const Promise = require('bluebird');
const workerFarm = require('@gemini-testing/worker-farm');

const RuntimeConfig = require('../config/runtime-config');

module.exports = class Workers {
    static create(...args) {
        return new Workers(...args);
    }

    constructor(params, workerFilepath, exportedMethods) {
        this._ended = false;

        this._workers = workerFarm({...params, ...this._inspectParams()}, workerFilepath, exportedMethods);

        for (const methodName of exportedMethods) {
            this[methodName] = Promise.promisify(this._workers[methodName]);
        }
    }

    end() {
        this._ended = true;
        workerFarm.end(this._workers);
    }

    isEnded() {
        return this._ended;
    }

    _inspectParams() {
        const runtimeConfig = RuntimeConfig.getInstance();

        if (!runtimeConfig || !runtimeConfig.inspectMode) {
            return;
        }

        const {inspect, inspectBrk} = runtimeConfig.inspectMode;

        const inspectName = inspectBrk ? 'inspect-brk' : 'inspect';
        let inspectValue = inspectBrk ? inspectBrk : inspect;

        inspectValue = typeof inspectValue === 'string' ? `=${inspectValue}` : '';

        return {
            workerOptions: {execArgv: [`--${inspectName}${inspectValue}`]},
            maxConcurrentWorkers: 1,
            maxCallsPerWorker: Infinity
        };
    }
};
