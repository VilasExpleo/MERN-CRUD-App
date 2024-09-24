import { of, throwError } from 'rxjs';
import { SpellcheckService } from './spellcheck.service';
import { ApiService } from '../api.service';
import { SpellcheckTransformer } from 'src/app/components/settings/about-hmil/spellcheck/spellcheck.transformer';
import { createSpyFromClass, Spy } from 'jest-auto-spies';

describe('SpellcheckService', () => {
    let service: SpellcheckService;
    let mockApiService: Spy<ApiService>;
    let mockSpellcheckTransformer: Spy<SpellcheckTransformer>;

    beforeEach(() => {
        mockApiService = createSpyFromClass(ApiService);
        mockSpellcheckTransformer = createSpyFromClass(SpellcheckTransformer);

        service = new SpellcheckService(mockApiService, mockSpellcheckTransformer);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get spellcheck version', () => {
        const mockResponse = { data: 'mockedData' };
        mockApiService.getRequest.mockReturnValue(of(mockResponse));

        const transformedData = 'transformedData';
        mockSpellcheckTransformer.transform.mockReturnValue(of(transformedData));
        service.getSpellcheckVersion();

        service.getSpellcheckVersion().subscribe((result) => {
            expect(result).toEqual(transformedData);
        });
    });

    it('should handle error when getting spellcheck version', () => {
        jest.spyOn(mockApiService, 'getRequest').mockReturnValue(of(throwError('Error')));

        service.getSpellcheckVersion().subscribe((result) => {
            expect(result).toBeUndefined();
        });
    });
});
