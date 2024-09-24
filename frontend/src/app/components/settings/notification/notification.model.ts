export interface EmailNotificationModel {
    emailNotification: NotificationModel[];
}
export interface NotificationModel {
    eventName: string;
    status: boolean;
}
