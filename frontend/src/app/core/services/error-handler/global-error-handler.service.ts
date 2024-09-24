import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, isDevMode } from '@angular/core';
import { MessageService } from 'primeng/api';
import { LogService } from '../logService/log.service';
import { HttpErrorHandler } from './http-error-handler.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    showOnce = true;

    constructor(
        private messageService: MessageService,
        private logService: LogService,
        private httpErrorHandler: HttpErrorHandler
    ) {}

    handleError(error: unknown): void {
        if (error instanceof HttpErrorResponse) {
            this.httpErrorHandler.handleErrors(error);
        } else {
            this.handleUnknownErrors(error);
        }
        this.handleServerLogs(error);
        this.handleConsoleLogs(error);
    }

    private handleServerLogs(error: unknown) {
        this.shouldLogError(error) && this.logService.log((error as Error).message, { ...(error as Error) });
    }

    private shouldLogError(error) {
        return error instanceof HttpErrorResponse && error.message.indexOf('log-service') < 0;
    }

    private handleConsoleLogs(error: unknown) {
        if (isDevMode()) {
            console.error(error);
        } else {
            console.warn(this.getConsoleErrorMessage(error));
        }
    }

    private handleUnknownErrors(error: unknown) {
        if (isDevMode()) {
            this.messageService.add({
                severity: 'error',
                closable: true,
                summary: `Error Code - ${(error as Error)?.name} `,
                detail: (error as Error)?.message,
            });
        } else {
            this.showOnce &&
                this.messageService.add({
                    severity: 'error',
                    closable: true,
                    summary: `Runtime Errors`,
                    detail: 'Runtime error toast is disabled until the runtime errors are fixed',
                });

            this.showOnce = false;
        }
    }

    private getConsoleErrorMessage(error: unknown, isDev?: boolean) {
        return {
            errorCode: (error as Error).name,
            message: (error as Error).message,
            stackTrace: isDev ? (error as Error).stack : '',
        };
    }
}
