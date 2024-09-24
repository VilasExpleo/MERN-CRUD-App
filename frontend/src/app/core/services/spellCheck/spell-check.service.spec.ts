import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { of } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { AutomaticSpellcheckTransformer } from 'src/app/components/settings/spell-check/spell-check/automatic-spellcheck/automatic-spellcheck.transformer';
import { SpellCheckTransformer } from 'src/app/components/settings/spell-check/spell-check/spell-check.transformer';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { AddWordRequestModel } from 'src/app/shared/models/spell-check/add-word.request.model';
import { EditWordRequestModel } from 'src/app/shared/models/spell-check/edit-word.request.model';
import { SpellCheckDictionariesRequestModel } from 'src/app/shared/models/spell-check/update-spell-check-dictionaries.request.model';
import { ApiService } from '../api.service';
import { SpellCheckService } from './spell-check.service';

describe('SpellCheckService', () => {
    let service: SpellCheckService;
    let mockApiService: Spy<ApiService>;
    let mockAutomaticSpellcheckTransformer: Spy<AutomaticSpellcheckTransformer>;
    let mockSpellCheckTransformer: Spy<SpellCheckTransformer>;
    const mockUserId = 1;
    beforeEach(() => {
        mockApiService = createSpyFromClass(ApiService);
        mockAutomaticSpellcheckTransformer = createSpyFromClass(AutomaticSpellcheckTransformer);
        mockSpellCheckTransformer = createSpyFromClass(SpellCheckTransformer);

        service = new SpellCheckService(mockApiService, mockAutomaticSpellcheckTransformer, mockSpellCheckTransformer);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get Words', () => {
        const mockResult: ApiBaseResponseModel = {
            status: ResponseStatusEnum.OK,
            message: 'ok',
            data: ['test', 'testing'],
        };

        mockApiService.getRequest.mockReturnValue(of(mockResult));
        mockAutomaticSpellcheckTransformer.transform.mockReturnValue(of(['test', 'testing']));
        service.getWords(mockUserId).subscribe((response) => expect(response).toBe(`['test', 'testing']`));
    });

    it('should add a word successfully', () => {
        const payload: AddWordRequestModel = { word: 'test' };
        const mockResult: ApiBaseResponseModel = {
            status: ResponseStatusEnum.OK,
            message: 'Word added successfully',
        };

        mockApiService.postTypeRequest.mockReturnValue(of(mockResult));
        service.add(payload, mockUserId).subscribe((response) => expect(response).toBe('Word added successfully'));
    });

    it('should edit a word successfully', () => {
        const payload: EditWordRequestModel = { newWord: 'test', oldWord: 'testing' };
        const mockResult: ApiBaseResponseModel = {
            status: ResponseStatusEnum.OK,
            message: 'Successfully updated word to custom dictionary',
        };

        mockApiService.putTypeRequest.mockReturnValue(of(mockResult));
        service
            .edit(payload, mockUserId)
            .subscribe((response) => expect(response).toBe('Successfully updated word to custom dictionary'));
    });

    it('should delete a dictionary successfully', () => {
        const mockResult: ApiBaseResponseModel = {
            status: ResponseStatusEnum.OK,
            message: 'Successfully deleted word from custom dictionary',
        };
        mockApiService.deleteRequest.mockReturnValue(of(mockResult));
        service
            .deleteDictionary(mockUserId)
            .subscribe((response) => expect(response).toBe('Successfully deleted word from custom dictionary'));
    });

    it('should delete a word successfully', () => {
        const payload = 'test';
        const mockResult: ApiBaseResponseModel = {
            status: ResponseStatusEnum.OK,
            message: 'Successfully deleted word from custom dictionary',
        };
        mockApiService.deleteRequest.mockReturnValue(of(mockResult));
        service
            .deleteWord(mockUserId, payload)
            .subscribe((response) => expect(response).toBe('Successfully deleted word from custom dictionary'));
    });

    it('should get spell check dictionaries successfully', () => {
        const mockResultSpellCheckDictionary = [
            {
                languageId: 1,
                languageName: 'India - Maharashtra',
                languageCode: 'IN-MH',
                country: '',
                spellCheck: true,
                isDictionaryAvailable: true,
            },
        ];
        const mockApiResponse = {
            status: ResponseStatusEnum.OK,
            data: 'mock-response',
        };
        mockApiService.getRequest.mockReturnValue(of(mockApiResponse));
        mockApiService.postTypeRequest.mockReturnValue(of(mockResultSpellCheckDictionary));
        mockAutomaticSpellcheckTransformer.transform.mockReturnValue(of(mockResultSpellCheckDictionary));
        service
            .getSpellCheckDictionaries(mockUserId)
            .subscribe((response) => expect(response).toEqual(mockResultSpellCheckDictionary));
    });

    it('should update a language preference successfully', () => {
        const payload: SpellCheckDictionariesRequestModel = {
            dictionaries: [{ languageId: 1 }],
        };
        const mockResult: ApiBaseResponseModel = {
            status: ResponseStatusEnum.OK,
            message: 'Successfully saved spellCheck preference',
        };

        mockApiService.postTypeRequest.mockReturnValue(of(mockResult));
        service
            .updateSpellCheckDictionaries(payload, mockUserId)
            .subscribe((response) => expect(response).toBe('Successfully saved spellCheck preference'));
    });
});
