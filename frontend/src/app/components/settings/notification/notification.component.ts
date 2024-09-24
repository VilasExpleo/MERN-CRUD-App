import { MessageService } from 'primeng/api';
import { ResponseStatusEnum } from './../../../../Enumerations';
import { ApiBaseResponseModel } from './../../../shared/models/api-base-response.model';
import { catchError, of } from 'rxjs';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { EmailNotificationService } from 'src/app/core/services/email-notification/email-notification.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { EmailNotificationModel, NotificationModel } from './notification.model';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
})
export class NotificationComponent implements OnInit {
    notifications: EmailNotificationModel;
    selectedEvent: NotificationModel[];
    userId: number;
    @Output() closeSetting: EventEmitter<any> = new EventEmitter();
    notificationHeaderMessage = `Enable or disable notification for notification settings. Contact your system operator to provide additional
  selection.`;

    constructor(
        private emailNotificationService: EmailNotificationService,
        private userService: UserService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.getEmailNotification();
    }

    private getEmailNotification() {
        this.userId = this.userService.getUser().id;
        this.emailNotificationService
            .getEmailNotification(this.userId)
            .subscribe((response: EmailNotificationModel) => {
                this.notifications = response;
            });
    }

    sendNotification() {
        this.emailNotificationService
            .sendNotification(this.userId, this.notifications)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (response: ApiBaseResponseModel) => {
                    if (response.status === ResponseStatusEnum.OK) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Successfully updated email settings',
                        });
                        this.closeSetting.emit();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: response.message,
                        });
                    }
                },
            });
    }
}
