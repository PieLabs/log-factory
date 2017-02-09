/// <reference types="winston" />
import * as winston from 'winston';
export declare let init: (log: any) => void;
export declare let setDefaultLevel: (l: any) => void;
export declare let getLogger: (id: string) => winston.LoggerInstance;
export declare let fileLogger: (filename: any) => winston.LoggerInstance;
export declare function buildLogger(): winston.LoggerInstance;
