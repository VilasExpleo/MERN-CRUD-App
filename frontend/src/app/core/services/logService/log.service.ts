/* eslint-disable sonarjs/no-identical-functions */
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { LogPublisher } from './log-publishers';

export enum LogLevel {
    All = 0,
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
    Fatal = 5,
    Off = 6,
}

@Injectable({
    providedIn: 'root',
})
export class LogService {
    level: LogLevel = LogLevel.All;
    logWithDate = true;
    publishers!: LogPublisher[];
    location = 'logging';

    constructor(private apiService: ApiService) {}

    debug(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Debug, optionalParams);
    }

    info(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Info, optionalParams);
    }

    warn(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Warn, optionalParams);
    }

    error(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Error, optionalParams);
    }
    fatal(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Fatal, optionalParams);
    }

    log(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.All, optionalParams);
    }

    private writeToLog(msg: string, level: LogLevel, params: any[]) {
        if (this.shouldLog(level)) {
            let value = '';
            // Build log string
            if (this.logWithDate) {
                value = new Date() + ' - ';
            }
            value += 'Type: ' + LogLevel[this.level];
            value += ' - Message: ' + msg;
            if (params.length) {
                value += ' - Extra Info: ' + this.formatParams(params);
            }
            const entry: LogEntry = new LogEntry();

            entry.message = msg;
            entry.level = level;
            entry.extraInfo = params;
            entry.logWithDate = this.logWithDate;
            const data = {
                extra_info: value,
                message: msg,
                log_level: level,
            };
            this.logLocalStorage(data);
            this.setLogOnServer(data);
        }
    }
    setLogOnServer(data: any) {
        this.apiService.postTypeRequest('log-service', data).subscribe();
    }

    logLocalStorage(LogData: any): any {
        let values: LogEntry[];

        try {
            // Get previous values from local storage
            const data: any = localStorage.getItem(this.location);
            values = JSON.parse(data) || [];
            // Add new log entry to array
            values.push(LogData);

            // Store array into local storage
            localStorage.setItem(this.location, JSON.stringify(values));

            // Set return value
        } catch (ex) {
            // Display error in console
            console.warn(ex);
        }
    }

    clear(): any {
        localStorage.removeItem(this.location);
    }
    private formatParams(params: any[]): string {
        let ret: string = params.join(',');

        // Is there at least one object in the array?
        if (params.some((p) => typeof p == 'object')) {
            ret = '';

            // Build comma-delimited string
            for (const item of params) {
                ret += JSON.stringify(item) + ',';
            }
        }
        return ret;
    }

    private shouldLog(level: LogLevel): boolean {
        let ret = false;
        if ((level >= this.level && level !== LogLevel.Off) || this.level === LogLevel.All) {
            ret = true;
        }
        return ret;
    }
}

export class LogEntry {
    // Public Properties
    entryDate: Date = new Date();
    message = '';
    level: LogLevel = LogLevel.Debug;
    extraInfo: any[] = [];
    logWithDate = true;

    buildLogString(): string {
        let ret = '';

        if (this.logWithDate) {
            ret = new Date() + ' - ';
        }

        ret += 'Type: ' + LogLevel[this.level];
        ret += ' - Message: ' + this.message;
        if (this.extraInfo.length) {
            ret += ' - Extra Info: ' + this.formatParams(this.extraInfo);
        }

        return ret;
    }

    private formatParams(params: any[]): string {
        let ret: string = params.join(',');

        // Is there at least one object in the array?
        if (params.some((p) => typeof p == 'object')) {
            ret = '';

            // Build comma-delimited string
            for (const item of params) {
                ret += JSON.stringify(item) + ',';
            }
        }

        return ret;
    }
}
