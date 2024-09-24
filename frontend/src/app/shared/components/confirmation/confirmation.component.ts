import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmEventType, ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
})
export class ConfirmationComponent implements OnInit {
    @Input()
    confirmationMessage = 'Are you sure you want to cancel?';

    @Input()
    confirmationHeader = 'Cancel Properties';

    @Input()
    confirmationIcon = `pi pi-exclamation-triangle`;

    @Input()
    acceptProperties = {
        icon: 'pi pi-check',
        label: 'Yes',
        class: 'p-button-danger',
    };

    @Input()
    rejectProperties = {
        icon: 'pi pi-times',
        label: 'No',
        class: 'p-button-outlined',
    };

    @Output()
    acceptCallback = new EventEmitter();

    @Output()
    rejectCallback = new EventEmitter<ConfirmEventType>();

    constructor(private confirmationService: ConfirmationService) {}

    ngOnInit() {
        this.confirmationService.confirm({
            message: this.confirmationMessage,
            header: this.confirmationHeader,
            icon: this.confirmationIcon,
            accept: () => {
                this.acceptCallback.emit();
            },
            reject: (type: ConfirmEventType) => {
                this.rejectCallback.emit(type);
            },
        });
    }
}
