import { Injectable } from '@angular/core';
import { EmailNotificationModel, NotificationModel } from './notification.model';

@Injectable({
    providedIn: 'root',
})
export class NotificationTransformer {
    transform(response: EmailNotificationModel): EmailNotificationModel {
        return {
            emailNotification: response?.emailNotification.map((response: NotificationModel) => ({
                eventName: this.getEventName(response.eventName),
                status: response.status,
            })),
        };
    }

    private getEventName(eventName: string): string {
        return eventName
            .split('_')
            .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
            .join(' ');
    }
}
