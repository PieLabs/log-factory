import * as _ from 'lodash';
import * as dateFormat from 'dateformat';
import * as fs from 'fs';
import * as path from 'path';
import * as stackTrace from 'stack-trace';
import * as winston from 'winston';

//levels: error > warn > info > verbose > debug > silly

type LogFactoryOpts = {
  console: boolean,
  file?: string,
  log?: any
};

const moduleOpts = {
  console: true,
  file: null,
  log: 'info'
};

let config = {
  'default': 'info'
};

const timestamp = () => {
  var now = new Date();
  return dateFormat(now, 'HH:MM:ss.l');
};

const consoleTransport = (label: string): winston.TransportInstance => {
  return new (winston.transports.Console)({
    colorize: true,
    label: label,
    timestamp
  });
};

const fileTransport = (label: string): winston.TransportInstance => {
  return new winston.transports.File({
    colorize: false,
    json: false,
    filename: moduleOpts.file,
    label,
    timestamp
  });
};

const mkLogConfig = (label: string, level: string) => {

  const addConsole = !moduleOpts.file && moduleOpts.console;

  const transports: winston.TransportInstance[] = [
    addConsole ? consoleTransport(label) : null,
    moduleOpts.file ? fileTransport(label) : null
  ].filter(t => t !== null);


  return { level, transports };
};


const setConfig = (cfg) => {
  config = _.merge({}, config, cfg);
  _.forIn(cfg, (value, key) => {
    addLogger(key, value);
  });
};

const isLogLevel = (l): Boolean => _.includes(['error', 'warn', 'info', 'verbose', 'debug', 'silly'], l);

export const setDefaultLevel = (l) => {
  config = _.merge(config, { 'default': l });
  _.forEach(winston.loggers.loggers, (value, key) => {
    let logger = winston.loggers.get(key);
    let cfg = mkLogConfig(key, config['default']);
    logger.configure(cfg);
  });
};

export const init = (opts: LogFactoryOpts): void => {

  moduleOpts.console = opts.console;
  moduleOpts.file = opts.file;
  moduleOpts.log = opts.log || moduleOpts.log;

  const { log } = moduleOpts;

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
      setConfig(config);
    } catch (e) {
      if (fs.existsSync(log)) {
        var cfg = JSON.parse(fs.readFileSync(log, 'utf8'));
        setConfig(cfg);
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

/** get a logger and give it a name */
export const getLogger = (id: string): winston.LoggerInstance => {
  var existing = winston.loggers.has(id);

  if (existing) {
    return winston.loggers.get(id);
  } else {
    return addLogger(id, config[id] || config['default']);
  }
};

/** get a logger and name it by it's file name. */
export const fileLogger = (filename): winston.LoggerInstance => {
  var label;
  var parsed = path.parse(filename);

  if (parsed.name === 'index') {
    label = path.basename(parsed.dir);
  } else {
    label = parsed.name;
  }
  return getLogger(label);
};

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
