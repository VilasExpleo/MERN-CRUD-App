import { of, catchError, map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { ApiService } from '../api.service';
import { NotificationTransformer } from 'src/app/components/settings/notification/notification.transformer';
import { EmailNotificationModel } from 'src/app/components/settings/notification/notification.model';

@Injectable({
    providedIn: 'root',
})
export class EmailNotificationService {
    constructor(private apiService: ApiService, private notificationTransformer: NotificationTransformer) {}

    getEmailNotification(userId: number): Observable<EmailNotificationModel> {
        return this.apiService.getRequest(`user-setting/${userId}`).pipe(
            catchError(() => of({ emailNotification: [] })),
            map((response: ApiBaseResponseModel) => this.notificationTransformer.transform(response?.data))
        );
    }

    sendNotification(userId: number, notification: EmailNotificationModel) {
        return this.apiService.postTypeRequest(`user-setting/${userId}`, notification);
    }
}
