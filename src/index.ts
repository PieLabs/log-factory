import * as winston from 'winston';
import * as path from 'path';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as stackTrace from 'stack-trace';
//levels: error > warn > info > verbose > debug > silly

let config = {
  'default': 'info'
};

let mkLogConfig = (label: string, level: string) => {
  return {
    level: level,
    transports: [
      new (winston.transports.Console)({ colorize: true, label: label })
    ]
  }
}

const logger = addLogger('LOG_FACTORY');

export let init = (log): void => {

  logger.debug('init: ', log);

  if (!log) {
    return;
  }

  if (_.isObject(log)) {
    setConfig(log);
  } else if (isLogLevel(log)) {
    setDefaultLevel(log);
  } else {
    try {
      let config = JSON.parse(log);
      logger.debug('parsed log: ', log);
      setConfig(config);
    } catch (e) {
      if (fs.existsSync(log)) {
        setConfigFromFile(log);
      } else {
        console.error('can not configure logging using cli param value: ' + log);
      }
    }
  }
};


function addLogger(label, level?: string): winston.LoggerInstance {

  level = level ? level : config['default'] || 'info';
  let cfg = mkLogConfig(label, level);
  let logger;
  if (winston.loggers.has(label)) {
    logger = winston.loggers.get(label);
  } else {
    logger = winston.loggers.add(label, {});
  }

  logger.configure(cfg);
  return logger;
}


let isLogLevel = (l): Boolean => _.includes(['error', 'warn', 'info', 'verbose', 'debug', 'silly'], l);


export let setDefaultLevel = (l) => {
  config = _.merge(config, { 'default': l });
  logger.debug('default level now: ', config['default']);
  _.forEach(winston.loggers.loggers, (value, key) => {
    let logger = winston.loggers.get(key);
    let cfg = mkLogConfig(key, config['default']);
    logger.configure(cfg);
  });
};

let setConfigFromFile = (configPath) => {
  var cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  logger.debug(cfg);
  setConfig(cfg);
};

let setConfig = (cfg) => {
  config = _.merge({}, config, cfg);
  _.forIn(cfg, (value, key) => {
    addLogger(key, value);
  });
};

/** get a logger and give it a name */
export let getLogger = (id: string): winston.LoggerInstance => {
  var existing = winston.loggers.has(id);

  if (existing) {
    return winston.loggers.get(id);
  } else {
    return addLogger(id, config[id] || config['default']);
  }
};

/** get a logger and name it by it's file name. */
export let fileLogger = (filename): winston.LoggerInstance => {
  var label;
  var parsed = path.parse(filename);

  if (parsed.name === 'index') {
    label = path.basename(parsed.dir);
  } else {
    label = parsed.name;
  }
  return getLogger(label);
}

/**
 * Create a logger and automatically name it by using the filename of the call site.
 * Eg: 
 * ```
 * //my-file.js
 * import {buildLogger} from 'log-factory';
 * let logger = buildLogger();
 * logger.info('hi') //=> emits [INFO] [my-file] hi 
 * ```
 */
export function buildLogger(): winston.LoggerInstance {
  let trace = stackTrace.get();
  let name = trace[1].getFileName();
  return fileLogger(name);
}


