import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationComponent } from './notification.component';
import { EmailNotificationService } from 'src/app/core/services/email-notification/email-notification.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('NotificationComponent', () => {
    let component: NotificationComponent;
    let fixture: ComponentFixture<NotificationComponent>;
    let emailNotificationServiceMock: Spy<EmailNotificationService>;
    let userServiceMock: Spy<UserService>;
    let messageServiceMock: Spy<MessageService>;

    beforeEach(async () => {
        const mockApiResponse = {
            emailNotification: [],
        };

        emailNotificationServiceMock = createSpyFromClass(EmailNotificationService);
        userServiceMock = createSpyFromClass(UserService);
        messageServiceMock = createSpyFromClass(MessageService);

        emailNotificationServiceMock.getEmailNotification.mockReturnValue(of(mockApiResponse)),
            emailNotificationServiceMock.sendNotification.mockReturnValue(of(mockApiResponse)),
            userServiceMock.getUser.mockReturnValue({ id: 1 }),
            await TestBed.configureTestingModule({
                declarations: [NotificationComponent],
                providers: [
                    { provide: EmailNotificationService, useValue: emailNotificationServiceMock },
                    { provide: UserService, useValue: userServiceMock },
                    { provide: MessageService, useValue: messageServiceMock },
                ],
                schemas: [CUSTOM_ELEMENTS_SCHEMA],
            }).compileComponents();

        fixture = TestBed.createComponent(NotificationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch email notification on init', () => {
        const getEmailNotificationSpy = jest.spyOn(emailNotificationServiceMock, 'getEmailNotification');

        fixture.detectChanges();

        expect(getEmailNotificationSpy).toHaveBeenCalledWith(1);
    });

    it('should send notification and show success message', () => {
        const successResponse = { status: 'OK', message: 'Notification sent successfully' };
        emailNotificationServiceMock.sendNotification.mockReturnValue(of(successResponse));

        component.sendNotification();

        expect(emailNotificationServiceMock.sendNotification).toHaveBeenCalledWith(1, component.notifications);
        expect(messageServiceMock.add).toHaveBeenCalledWith({
            severity: 'success',
            summary: 'Success',
            detail: 'Notification sent successfully',
        });
    });

    it('should send notification and show error message', () => {
        const errorResponse = { status: 'ERROR', message: 'Failed to send notification' };
        emailNotificationServiceMock.sendNotification.mockReturnValue(of(errorResponse));

        component.sendNotification();

        expect(emailNotificationServiceMock.sendNotification).toHaveBeenCalledWith(1, component.notifications);
        expect(messageServiceMock.add).toHaveBeenCalledWith({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to send notification',
        });
    });
});
