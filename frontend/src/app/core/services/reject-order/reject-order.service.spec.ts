import { RejectOrderService } from './reject-order.service';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { ApiService } from '../api.service';
import { NgEventBus } from 'ng-event-bus';
import { MessageService } from 'primeng/api';
import { RejectOrderRequestModel } from 'src/app/shared/models/reject-order/reject-order.request.model';
import { ResponseStatusEnum, TranslationRequestsStatusEnum } from 'src/Enumerations';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { of } from 'rxjs';
import { IUserModel } from '../user/user.model';

describe('RejectOrderService', () => {
    let service: RejectOrderService;
    let mockApiService: Spy<ApiService>;
    let mockEventBus: Spy<NgEventBus>;
    let mockMessageService: Spy<MessageService>;

    beforeEach(() => {
        mockApiService = createSpyFromClass(ApiService);
        mockMessageService = createSpyFromClass(MessageService);
        mockEventBus = createSpyFromClass(NgEventBus);

        service = new RejectOrderService(mockApiService, mockMessageService, mockEventBus);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should rejected order successfully', () => {
        const mockPayload: RejectOrderRequestModel = {
            translationRequestId: 1,
            projectId: 1,
            status: TranslationRequestsStatusEnum.Rejected,
            reason: 'reject order test',
            userId: 1,
            userRole: 'translator',
            languageId: 51,
        };

        const mockProject = {
            project_id: 1,
            translation_request_id: 1,
            language_id: 51,
        };

        const mockUser: IUserModel = {
            accessToken: 'abc123',
            brandId: 1,
            brandName: 1,
            email: 'abc@abc.com',
            id: 1,
            name: 'Prashant',
            role: 2,
        };

        const mockResult: ApiBaseResponseModel = {
            status: ResponseStatusEnum.OK,
            message: 'order rejected successfully',
        };

        mockApiService.postTypeRequest.mockReturnValue(of(mockResult));
        service.rejectOrder(mockProject, 'reject order test', mockUser);

        expect(mockApiService.postTypeRequest).toHaveBeenCalledWith(`translation-request/reject-order`, mockPayload);
    });
});
