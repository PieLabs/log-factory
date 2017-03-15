/// <reference types="winston" />
import * as winston from 'winston';
export declare const setDefaultLevel: (l: any) => void;
export declare const init: (log: any) => void;
export declare const getLogger: (id: string) => winston.LoggerInstance;
export declare const fileLogger: (filename: any) => winston.LoggerInstance;
export declare function buildLogger(): winston.LoggerInstance;
