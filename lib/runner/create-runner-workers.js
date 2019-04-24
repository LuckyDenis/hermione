'use strict';

const RuntimeConfig = require('../config/runtime-config');

module.exports = (workersRegistry, config) => {
    const workerFilepath = require.resolve('../worker');

    const params = {
        maxConcurrentWorkers: config.system.workers,
        maxCallsPerWorker: config.system.testsPerWorker,
        maxConcurrentCallsPerWorker: Infinity,
        autoStart: true,
        maxRetries: 0,
        onChild: (child) => initChild(child, config)
    };

    return workersRegistry.register(params, workerFilepath, ['runTest']);
};

function initChild(child, config) {
    child.on('message', ({event} = {}) => {
        switch (event) {
            case 'worker.init':
                child.send({
                    event: 'master.init',
                    configPath: config.configPath,
                    runtimeConfig: RuntimeConfig.getInstance()
                });
                break;
            case 'worker.syncConfig':
                child.send({
                    event: 'master.syncConfig',
                    config: config.serialize()
                });
                break;
        }
    });
}
