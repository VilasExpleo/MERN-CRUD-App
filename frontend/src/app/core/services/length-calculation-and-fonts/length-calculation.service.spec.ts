import { LengthCalculationService } from './length-calculation.service';
import { FormBuilder } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { ApiService } from '../api.service';
import { ApiLengthCalculationService } from '../apiLengthCalculation.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { TestBedTransformer } from 'src/app/components/length-calculation-and-fonts/test-bed/test-bed.transformer';
import { of } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';

describe('LengthCalculationService', () => {
    let service: LengthCalculationService;
    let mockDialogService: Spy<DialogService>;
    let mockApiService: Spy<ApiService>;
    let mockFb: Spy<FormBuilder>;
    let mockMessageService: Spy<MessageService>;
    let mockConfirmationService: Spy<ConfirmationService>;
    let mockApiLengthCalculationService: Spy<ApiLengthCalculationService>;
    let mockTestBedTransformer: Spy<TestBedTransformer>;

    beforeEach(() => {
        mockTestBedTransformer = createSpyFromClass(TestBedTransformer);
        mockApiService = createSpyFromClass(ApiService);
        mockFb = createSpyFromClass(FormBuilder);
        mockMessageService = createSpyFromClass(MessageService);
        mockConfirmationService = createSpyFromClass(ConfirmationService);
        mockApiLengthCalculationService = createSpyFromClass(ApiLengthCalculationService);
        mockTestBedTransformer = createSpyFromClass(TestBedTransformer);

        service = new LengthCalculationService(
            mockDialogService,
            mockApiService,
            mockFb,
            mockMessageService,
            mockConfirmationService,
            mockApiLengthCalculationService,
            mockTestBedTransformer
        );
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should return testBedConfiguration', () => {
        const mockResult = {
            status: ResponseStatusEnum.OK,
            message: 'ok',
            data: 'mock-data',
        };

        mockApiService.getRequest.mockReturnValue(of(mockResult));
        mockTestBedTransformer.transform.mockReturnValue(of('mock-return-message'));

        service.getTestBedConfiguration().subscribe((response) => expect(response).toBe('mock-return-message'));
    });

    it('should return calculated message response', () => {
        const mockMessage = {
            type: 'calculateWidthForTestbed-server',
            content: [
                {
                    lcName: 'Example-Vx.y.z',
                    text: 'Automatic Emergency Braking ⚠',
                    width: 0,
                    error: ['⚠'],
                    errorType: 'Unresolved chars',
                },
            ],
        };

        service.setCalculatedMessage(mockMessage);
        service.getCalculatedMessage().subscribe((response) => {
            expect(response).toBe(mockMessage);
        });
    });
});
