"use strict";
const winston = require("winston");
const path = require("path");
const _ = require("lodash");
const fs = require("fs-extra");
const stackTrace = require("stack-trace");
let config = {
    'default': 'info'
};
let mkLogConfig = (label, level) => {
    return {
        level: level,
        transports: [
            new (winston.transports.Console)({ colorize: true, label: label })
        ]
    };
};
const logger = addLogger('LOG_FACTORY');
exports.init = (log) => {
    logger.debug('init: ', log);
    console.log('init: ', log);
    if (!log) {
        return;
    }
    if (_.isObject(log)) {
        exports.setConfig(log);
    }
    else if (exports.isLogLevel(log)) {
        exports.setDefaultLevel(log);
    }
    else {
        try {
            let config = JSON.parse(log);
            logger.debug('parsed log: ', log);
            exports.setConfig(config);
        }
        catch (e) {
            if (fs.existsSync(log)) {
                exports.setConfigFromFile(log);
            }
            else {
                console.error('can not configure logging using cli param value: ' + log);
            }
        }
    }
};
function addLogger(label, level) {
    level = level ? level : config['default'] || 'info';
    let cfg = mkLogConfig(label, level);
    let logger;
    if (winston.loggers.has(label)) {
        logger = winston.loggers.get(label);
    }
    else {
        logger = winston.loggers.add(label, {});
    }
    logger.configure(cfg);
    return logger;
}
exports.isLogLevel = (l) => _.includes(['error', 'warn', 'info', 'verbose', 'debug', 'silly'], l);
exports.setDefaultLevel = (l) => {
    config = _.merge(config, { 'default': l });
    logger.debug('default level now: ', config['default']);
    _.forEach(winston.loggers.loggers, (value, key) => {
        let logger = winston.loggers.get(key);
        let cfg = mkLogConfig(key, config['default']);
        logger.configure(cfg);
    });
};
exports.setConfigFromFile = (configPath) => {
    var cfg = fs.readJsonSync(configPath);
    logger.debug(cfg);
    exports.setConfig(cfg);
};
exports.setConfig = (cfg) => {
    config = _.merge({}, config, cfg);
    _.forIn(cfg, (value, key) => {
        addLogger(key, value);
    });
};
exports.getLogger = (id) => {
    var existing = winston.loggers.has(id);
    if (existing) {
        return winston.loggers.get(id);
    }
    else {
        return addLogger(id, config[id] || config['default']);
    }
};
exports.fileLogger = (filename) => {
    var label;
    var parsed = path.parse(filename);
    if (parsed.name === 'index') {
        label = path.basename(parsed.dir);
    }
    else {
        label = parsed.name;
    }
    return exports.getLogger(label);
};
function buildLogger() {
    let trace = stackTrace.get();
    let name = trace[1].getFileName();
    return exports.fileLogger(name);
}
exports.buildLogger = buildLogger;
