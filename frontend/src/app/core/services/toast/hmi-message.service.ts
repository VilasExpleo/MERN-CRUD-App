import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root',
})
export class HmiMessageService {
    constructor(private messageService: MessageService) {}

    handleResponseOnDialogClose(success: boolean, summary: string, successDetail: string, errorDetail: string) {
        if (success) {
            this.showSuccess({
                summary: summary,
                detail: successDetail,
            });
        } else {
            this.showError({
                summary: summary,
                detail: errorDetail,
            });
        }
    }

    showSuccess(model: { summary?: string; detail: string }) {
        this.messageService.add({
            severity: 'success',
            summary: model.summary ?? 'Success',
            detail: model.detail,
        });
    }

    showError(model: { summary?: string; detail: string }) {
        this.messageService.add({
            severity: 'error',
            summary: model.summary ?? 'Failed',
            detail: model.detail,
        });
    }
}
