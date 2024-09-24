import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { MessageService } from 'primeng/api';
import { HttpErrorCodesEnum } from '../../interceptors/error-codes.enum';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root',
})
export class HttpErrorHandler {
    showOnce = false;
    constructor(private messageService: MessageService, private userService: UserService, private injector: Injector) {}
    handleErrors(error: HttpErrorResponse) {
        switch (error.status) {
            case HttpErrorCodesEnum.Unauthorized:
            case HttpErrorCodesEnum.Forbidden:
            case HttpErrorCodesEnum.TooManyRequest: {
                this.showHttpErrorMessage(error);
                this.userService.logout();
                this.showOnce = true;
                break;
            }
            case HttpErrorCodesEnum.RequestTimeOut:
            case HttpErrorCodesEnum.BadRequest:
            case HttpErrorCodesEnum.NotFound: {
                this.showHttpErrorMessage(error);
                break;
            }

            case HttpErrorCodesEnum.InternalServerError:
            case HttpErrorCodesEnum.BadGateway: {
                const errorMessage = `Please clear your cache and delete cookies in 
                    your browser and restart the browser in safe mode.`;
                this.showHttpErrorMessage(error, errorMessage);
                break;
            }

            case HttpErrorCodesEnum.GatewayTimeout:
            case HttpErrorCodesEnum.TemporarilyUnavailable: {
                const errorMessage = `Please restart your browser or the site might be under maintenance, 
                Please contact the administrator or connect later.`;
                this.showHttpErrorMessage(error, errorMessage);
                break;
            }

            default:
                this.showHttpErrorMessage(error, 'Some unknown error occurs. Please contact Administrator');
        }
    }

    private showHttpErrorMessage(error: HttpErrorResponse, customErrorMessage?: string) {
        !this.showOnce &&
            this.messageService.add({
                severity: 'error',
                closable: true,
                summary: `Error Code - ${error.status} `,
                detail: customErrorMessage || error.message,
            });
    }
}
