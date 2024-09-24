import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { of } from 'rxjs';
import { TranslationRequestModel } from 'src/app/components/dashboard/translation-request/editor-translation-request/components/reference-language/reference-language.model';
import { TranslationRequestTransformer } from 'src/app/components/dashboard/translation-request/editor-translation-request/components/reference-language/reference-language.transformer';
import { TranslationRequestService } from '../translation-request/translation-request.service';
import { ReferenceLanguageService } from './reference-language.service';

describe('ReferenceLanguageService', () => {
    let service: ReferenceLanguageService;
    let mockTranslationRequestService: Spy<TranslationRequestService>;
    let mockTranslationRequestTransformer: Spy<TranslationRequestTransformer>;

    beforeEach(() => {
        mockTranslationRequestService = createSpyFromClass(TranslationRequestService);
        mockTranslationRequestTransformer = createSpyFromClass(TranslationRequestTransformer);
        service = new ReferenceLanguageService(mockTranslationRequestService, mockTranslationRequestTransformer);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return an observable of TranslationRequestModel', () => {
        const mockLanguageStateResponse = [
            {
                name: 'zh-CN',
                id: 27,
            },
        ];
        const mockStatisticsStateResponse = [
            {
                language_code: 'ja-JP',
                language_id: 80,
                word_count: 0,
            },
        ];
        const mockReferenceStateResponse = [
            {
                language_code: 'ja-JP',
                language_id: 80,
                word_count: 0,
                additional_languages: [
                    {
                        language_code: 'zh-CN',
                        language_id: 27,
                        is_done: false,
                    },
                ],
                isDone: false,
            },
            {
                language_code: 'en-GB',
                language_id: 51,
                word_count: 0,
                additional_languages: [],
                isDone: false,
            },
            {
                language_code: 'de-DE',
                language_id: 67,
                word_count: 0,
                additional_languages: [
                    {
                        language_code: 'ar-AE',
                        language_id: 17,
                        is_done: false,
                    },
                    {
                        language_code: 'zh-CN',
                        language_id: 27,
                        is_done: false,
                    },
                ],
                isDone: true,
            },
        ];
        const mockExpectedModel: TranslationRequestModel = {
            cols: [
                {
                    header: 'Selected Languages',
                },
                {
                    header: 'Reference Languages',
                },
                {
                    header: 'Include only texts in status "Done"',
                },
            ],
            description: 'Select the language for which you want to be a reference language',
            selectedLanguages: [
                {
                    language_code: 'ja-JP',
                    language_id: 80,
                    word_count: 0,
                    additional_languages: [
                        {
                            language_code: 'zh-CN',
                            language_id: 27,
                            is_done: false,
                        },
                    ],
                    isDone: false,
                },
                {
                    language_code: 'en-GB',
                    language_id: 51,
                    word_count: 0,
                    additional_languages: [],
                    isDone: false,
                },
                {
                    language_code: 'de-DE',
                    language_id: 67,
                    word_count: 0,
                    additional_languages: [
                        {
                            language_code: 'ar-AE',
                            language_id: 17,
                            is_done: false,
                        },
                    ],
                    isDone: true,
                },
            ],
            availableLanguages: [
                {
                    language_code: 'zh-CN',
                    language_id: 27,
                    is_done: false,
                },
            ],
        };

        mockTranslationRequestService.getLangSelectionState.mockReturnValue(of(mockLanguageStateResponse));
        mockTranslationRequestService.getStatisticsState.mockReturnValue(of(mockStatisticsStateResponse));
        mockTranslationRequestService.getReferenceLanguageState.mockReturnValue(of(mockReferenceStateResponse));

        mockTranslationRequestTransformer.transform.mockReturnValue(mockExpectedModel);

        service.getModel().subscribe((response) => {
            expect(response).toEqual(mockExpectedModel);
        });
    });
});
