import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { of } from 'rxjs';
import { FinishDialogTransformer } from '../../../../app/components/dashboard/project-manager-dashboard/components/dialogs/complete-translation-request/complete-translation-request.transformer';
import { TranslationRequestViewTransformer } from '../../../../app/components/dashboard/translation-request/translation-request-view/translation-request-view.transformer';
import { ApiService } from '../api.service';
import { TranslationRequestService } from './translation-request.service';

describe('TranslationRequestService', () => {
    let service: TranslationRequestService;
    let mockApiService: Spy<ApiService>;
    let mockFinishDialogTransformer: Spy<FinishDialogTransformer>;
    let mockTranslationRequestViewTransformer: Spy<TranslationRequestViewTransformer>;

    beforeEach(() => {
        mockApiService = createSpyFromClass(ApiService);
        mockFinishDialogTransformer = createSpyFromClass(FinishDialogTransformer);
        mockTranslationRequestViewTransformer = createSpyFromClass(TranslationRequestViewTransformer);

        service = new TranslationRequestService(
            mockApiService,
            mockFinishDialogTransformer,
            mockTranslationRequestViewTransformer
        );
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get statistics data', () => {
        const result = {
            status: 'ok',
        };

        const request = 'mock-request';

        mockApiService.postTypeRequest.mockReturnValue(of(result));
        mockTranslationRequestViewTransformer.transform.mockReturnValue(of('mock-return-data'));

        service.getData(request).subscribe((response) => expect(response).toBe('mock-return-data'));
    });
});
