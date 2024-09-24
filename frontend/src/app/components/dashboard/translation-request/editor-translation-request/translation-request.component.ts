import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-translation-request',
    templateUrl: './translation-request.component.html',
    providers: [MessageService],
})
export class TranslationRequestComponent implements OnInit {
    requestSteps: MenuItem[] = [];
    activeIndex = 0;

    constructor(private dynamicDialogRef: DynamicDialogRef) {}

    ngOnInit(): void {
        this.requestSteps = this.getTranslationRequestSteps();
    }

    navigate(index: number) {
        this.activeIndex = index;
    }
    private getTranslationRequestSteps() {
        return [
            {
                label: 'Language Selection',
                command: () => {
                    this.activeIndex = 0;
                },
            },
            {
                label: 'Checklist',
                command: () => {
                    this.activeIndex = 1;
                },
            },
            {
                label: 'Job Details',
                command: () => {
                    this.activeIndex = 2;
                },
            },

            {
                label: 'Documents',
                command: () => {
                    this.activeIndex = 3;
                },
            },
            {
                label: 'Filtering',
                command: () => {
                    this.activeIndex = 4;
                },
            },
            {
                label: 'Statistics',
                command: () => {
                    this.activeIndex = 5;
                },
            },
            {
                label: 'Reference Language',
                command: () => {
                    this.activeIndex = 6;
                },
            },
            {
                label: 'Confirmation',
                command: () => {
                    this.activeIndex = 7;
                },
            },
        ];
    }

    closeDialog(status: boolean) {
        this.dynamicDialogRef.close(status);
    }
}
