import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { SpellCheckService } from 'src/app/core/services/spellCheck/spell-check.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { AutomaticSpellcheckComponent } from './automatic-spellcheck.component';
import { SpellCheckDictionaryModel } from './spell-check-dictionary.model';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { SpellCheckDictionariesRequestModel } from 'src/app/shared/models/spell-check/update-spell-check-dictionaries.request.model';

describe('AutomaticSpellcheckComponent', () => {
    let component: AutomaticSpellcheckComponent;
    let fixture: ComponentFixture<AutomaticSpellcheckComponent>;
    let mockSpellCheckService: Spy<SpellCheckService>;
    let mockUserService: Spy<UserService>;
    let mockMessageService: Spy<MessageService>;

    const mockUser = { id: 1 };

    const mockDictionaries: SpellCheckDictionaryModel[] = [
        {
            languageId: 1,
            isDictionaryAvailable: true,
            country: '',
            languageCode: 'In-Mar',
            languageName: 'test',
            spellCheck: true,
        },
    ];

    beforeEach(async () => {
        mockSpellCheckService = createSpyFromClass(SpellCheckService);
        mockUserService = createSpyFromClass(UserService);
        mockMessageService = createSpyFromClass(MessageService);

        mockUserService.getUser.mockReturnValue(mockUser);

        await TestBed.configureTestingModule({
            declarations: [AutomaticSpellcheckComponent],
            providers: [
                { provide: MessageService, useValue: mockMessageService },
                { provide: UserService, useValue: mockUserService },
                { provide: SpellCheckService, useValue: mockSpellCheckService },
            ],
            imports: [HttpClientModule, HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(AutomaticSpellcheckComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInIt lifecycle method', () => {
        it('should load dictionaries', () => {
            mockSpellCheckService.getSpellCheckDictionaries.mockReturnValue(of('mock-dictionaries'));
            fixture.detectChanges();

            const actual = component.dictionary$.getValue();
            expect(actual).toBe('mock-dictionaries');
        });

        it('should call service with the current user', () => {
            mockSpellCheckService.getSpellCheckDictionaries.mockReturnValue(of([]));
            fixture.detectChanges();
            expect(mockSpellCheckService.getSpellCheckDictionaries).toHaveBeenCalledWith(1);
        });
    });

    describe('should call apply', () => {
        it('should call apply with dictionaries', () => {
            const mockApiResponse: ApiBaseResponseModel = {
                status: ResponseStatusEnum.OK,
                message: 'This is OK',
                data: [],
            };
            mockSpellCheckService.updateSpellCheckDictionaries.mockReturnValue(of(mockApiResponse));

            const mockDictionary: SpellCheckDictionariesRequestModel = { dictionaries: [{ languageId: 1 }] };
            component.apply(mockDictionaries);
            mockUserService.setCurrentUser({});

            mockSpellCheckService
                .updateSpellCheckDictionaries(mockDictionary, mockUserService.getUser().id)
                .subscribe();
            expect(mockMessageService.add).toHaveBeenCalledWith({
                severity: 'success',
                summary: 'Success',
                detail: mockApiResponse.message,
            });
        });
    });
});
