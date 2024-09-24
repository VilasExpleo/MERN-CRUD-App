import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
@Component({
    selector: 'app-order-review',
    templateUrl: './order-review.component.html',
    providers: [MessageService],
})
export class OrderReviewComponent implements OnInit {
    reviewSteps: MenuItem[] = [];
    activeIndex = 0;

    constructor(private dynamicDialogRef: DynamicDialogRef) {}

    ngOnInit(): void {
        this.reviewSteps = this.getOrderReviewSteps();
    }

    navigate(index: number) {
        this.activeIndex = index;
    }

    private getOrderReviewSteps() {
        return [
            {
                label: 'Language Selection',
                command: () => {
                    this.activeIndex = 0;
                },
            },
            {
                label: 'Assignment',
                command: () => {
                    this.activeIndex = 1;
                },
            },
            {
                label: 'Documents',
                command: () => {
                    this.activeIndex = 2;
                },
            },
            {
                label: 'Statistics',
                command: () => {
                    this.activeIndex = 3;
                },
            },
        ];
    }

    closeDialog(status: boolean) {
        this.dynamicDialogRef.close(status);
    }
}
