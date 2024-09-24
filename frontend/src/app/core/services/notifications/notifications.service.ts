import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
    providedIn: 'root',
})
export class NotificationsService {
    constructor(private apiService: ApiService) {}

    getNotifications(userId) {
        const url = `notification-module/user_id`;
        return this.apiService.postTypeRequest(url, userId);
    }
    removeReadNotification(url, id) {
        return this.apiService.postTypeRequest(url, id);
    }
}
