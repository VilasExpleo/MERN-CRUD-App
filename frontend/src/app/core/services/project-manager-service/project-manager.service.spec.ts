import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { NgEventBus } from 'ng-event-bus';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { ResponseStatusEnum, TranslationRequestsStatusEnum } from 'src/Enumerations';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { RejectOrderRequestModel } from 'src/app/shared/models/reject-order/reject-order.request.model';
import { ApiService } from '../api.service';
import { ProjectManagerService } from './project-manager.service';

describe('ProjectManagerService', () => {
    let service: ProjectManagerService;
    let mockApiService: Spy<ApiService>;
    let mockEventBus: Spy<NgEventBus>;
    let mockMessageService: Spy<MessageService>;
    beforeEach(() => {
        mockApiService = createSpyFromClass(ApiService);
        mockEventBus = createSpyFromClass(NgEventBus);
        mockMessageService = createSpyFromClass(MessageService);
        service = new ProjectManagerService(mockApiService, mockMessageService, mockEventBus);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should rejected order successfully', () => {
        const payload: RejectOrderRequestModel = {
            translationRequestId: 1,
            projectId: 1,
            status: TranslationRequestsStatusEnum.Rejected,
            reason: 'reject order test',
        };

        const mockProject = {
            id: 1,
            projectId: 1,
        };

        const mockResult: ApiBaseResponseModel = {
            status: ResponseStatusEnum.OK,
            message: 'order rejected successfully',
        };

        mockApiService.postTypeRequest.mockReturnValue(of(mockResult));
        service.rejectOrder(mockProject, 'reject order test');

        expect(mockApiService.postTypeRequest).toHaveBeenCalledWith(`project-manager-dashboard/reject-order`, payload);
    });
});
