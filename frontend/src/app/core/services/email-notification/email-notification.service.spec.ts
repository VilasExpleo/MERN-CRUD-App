import { of } from 'rxjs';
import { EmailNotificationService } from './email-notification.service';
import { ApiService } from '../api.service';
import { NotificationTransformer } from 'src/app/components/settings/notification/notification.transformer';
import { EmailNotificationModel } from 'src/app/components/settings/notification/notification.model';

describe('EmailNotificationService', () => {
    let emailNotificationService: EmailNotificationService;
    let apiServiceMock: jest.Mocked<ApiService>;
    let notificationTransformerMock: jest.Mocked<NotificationTransformer>;

    beforeEach(() => {
        apiServiceMock = {
            getRequest: jest.fn(),
            postTypeRequest: jest.fn(),
        } as unknown as jest.Mocked<ApiService>;

        notificationTransformerMock = {
            transform: jest.fn(),
        } as unknown as jest.Mocked<NotificationTransformer>;

        emailNotificationService = new EmailNotificationService(apiServiceMock, notificationTransformerMock);
    });

    it('should be created', () => {
        expect(emailNotificationService).toBeTruthy();
    });

    it('should retrieve email notification', () => {
        const userId = 1;
        const mockResponse: EmailNotificationModel = {
            emailNotification: [],
        };

        apiServiceMock.getRequest.mockReturnValue(of({ data: mockResponse }));
        notificationTransformerMock.transform.mockReturnValue(mockResponse);

        emailNotificationService.getEmailNotification(userId).subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });

        expect(apiServiceMock.getRequest).toHaveBeenCalledWith(`user-setting/${userId}`);
        expect(notificationTransformerMock.transform).toHaveBeenCalledWith(mockResponse);
    });

    it('should send email notification', () => {
        const userId = 1;
        const notification: EmailNotificationModel = {
            emailNotification: [],
        };

        const mockApiResponse = {
            emailNotification: [],
        };

        apiServiceMock.postTypeRequest.mockReturnValue(of(mockApiResponse));

        emailNotificationService.sendNotification(userId, notification).subscribe((response) => {
            expect(response).toEqual(mockApiResponse);
        });

        expect(apiServiceMock.postTypeRequest).toHaveBeenCalledWith(`user-setting/${userId}`, notification);
    });
});
