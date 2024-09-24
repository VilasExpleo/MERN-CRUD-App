import { Component, OnInit } from '@angular/core';
import { Message } from 'primeng/api';
import { Observable } from 'rxjs';
import { TranslationCheckService } from 'src/app/core/services/check/translation-check.service';
import { TranslationCheckModel } from 'src/app/shared/models/check/translation-check.model';
@Component({
    selector: 'app-error-logs',
    templateUrl: './error-logs.component.html',
})
export class ErrorLogsComponent implements OnInit {
    error = '';
    errors$: Observable<TranslationCheckModel[]>;
    messages: Message[];

    constructor(private translationCheckService: TranslationCheckService) {}

    ngOnInit() {
        this.errors$ = this.translationCheckService.getTranslationCheckState();
    }

    getErrors(errors: TranslationCheckModel[]): Message[] {
        return errors.map((error: TranslationCheckModel) => {
            return {
                severity: error.logLevel,
                summary: error.type,
                detail: error.message,
            };
        });
    }
}
