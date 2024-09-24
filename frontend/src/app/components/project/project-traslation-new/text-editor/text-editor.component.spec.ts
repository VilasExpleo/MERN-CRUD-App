import { DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ResponseStatusEnum, TranslationStatus } from 'src/Enumerations';
import { TranslationCheckService } from 'src/app/core/services/check/translation-check.service';
import { MappingService } from 'src/app/core/services/mapping/mapping.service';
import { PlaceholderService } from 'src/app/core/services/project/project-translation/placeholder.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { ProofreaderTranslationService } from 'src/app/core/services/project/project-translation/proofreader-translation.service';
import { ReviewerTranslationService } from 'src/app/core/services/project/project-translation/reviewer-translation.service';
import { StcDetailsService } from 'src/app/core/services/project/project-translation/stc-details.service';
import { TextNodeService } from 'src/app/core/services/project/project-translation/text-node.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { LocalStorageService } from 'src/app/core/services/storage/local-storage.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { TextEditorComponent } from './text-editor.component';

describe('TextEditorComponent', () => {
    let component: TextEditorComponent;
    let fixture: ComponentFixture<TextEditorComponent>;
    let mockEventBus: Spy<NgEventBus>;
    let mockProjectTranslationService: Spy<ProjectTranslationService>;
    let mockDatePipe: Spy<DatePipe>;
    let mockMappingService: Spy<MappingService>;
    let mockStcDetailsService: Spy<StcDetailsService>;
    let mockTranslationCheckService: Spy<TranslationCheckService>;
    let mockPlaceholderService: Spy<PlaceholderService>;
    let mockProofreaderTranslationService: Spy<ProofreaderTranslationService>;
    let mockReviewerTranslationService: Spy<ReviewerTranslationService>;
    let mockTextNodeService: Spy<TextNodeService>;
    let mockProjectService: Spy<ProjectService>;
    let mockLocalStorageService: Spy<LocalStorageService>;
    let mockUserService: Spy<UserService>;
    let mockDialogService: Spy<DialogService>;
    let mockMessageService: Spy<MessageService>;
    let mockConfirmationService: Spy<ConfirmationService>;

    const mockSelectedRow = {
        project_id: 5669,
        version_id: 5669.01,
        role: 'editor',
        user_id: 11,
        data: [
            {
                node_id: '1002',
                language_code: 'en-GB',
                array_item_index: null,
                variant_id: '5',
                translation_text: 'hello DE',
                translation_status: 'Work in progress',
                unresolvedChars: [],
                width: 0,
                lines: 1,
                exception: false,
            },
        ],
    };

    beforeEach(async () => {
        mockEventBus = createSpyFromClass(NgEventBus);
        mockProjectTranslationService = createSpyFromClass(ProjectTranslationService);
        mockPlaceholderService = createSpyFromClass(PlaceholderService);
        mockUserService = createSpyFromClass(UserService);
        mockTranslationCheckService = createSpyFromClass(TranslationCheckService);
        mockMappingService = createSpyFromClass(MappingService);
        mockStcDetailsService = createSpyFromClass(StcDetailsService);
        mockConfirmationService = createSpyFromClass(ConfirmationService);
        mockProjectTranslationService.getProjectParameters.mockReturnValue({ role: 1 });
        mockPlaceholderService.getPlaceholderRegex.mockReturnValue('');
        mockUserService.getUser.mockReturnValue({ role: 1 });
        const setEditorOptions = { readonly: false };
        mockProjectTranslationService.activeEditorOptions = setEditorOptions;
        mockTranslationCheckService.getProgressBarValue.mockReturnValue(of(''));
        mockMappingService.isUnmappedEnabled = false;
        mockStcDetailsService.lockStatus = '';
        mockConfirmationService.confirm;

        mockEventBus.on.mockReturnValue(of({ data: 1 }));

        await TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [TextEditorComponent],
            providers: [
                {
                    provide: ProjectTranslationService,
                    useValue: mockProjectTranslationService,
                },
                {
                    provide: NgEventBus,
                    useValue: mockEventBus,
                },
                {
                    provide: DatePipe,
                    useValue: mockDatePipe,
                },
                {
                    provide: MappingService,
                    useValue: mockMappingService,
                },
                {
                    provide: StcDetailsService,
                    useValue: mockStcDetailsService,
                },
                {
                    provide: TranslationCheckService,
                    useValue: mockTranslationCheckService,
                },
                {
                    provide: PlaceholderService,
                    useValue: mockPlaceholderService,
                },
                {
                    provide: ProofreaderTranslationService,
                    useValue: mockProofreaderTranslationService,
                },
                {
                    provide: ReviewerTranslationService,
                    useValue: mockReviewerTranslationService,
                },
                {
                    provide: TextNodeService,
                    useValue: mockTextNodeService,
                },
                {
                    provide: ProjectService,
                    useValue: mockProjectService,
                },
                {
                    provide: LocalStorageService,
                    useValue: mockLocalStorageService,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: DialogService,
                    useValue: mockDialogService,
                },
                {
                    provide: MessageService,
                    useValue: mockMessageService,
                },
                {
                    provide: ConfirmationService,
                    useValue: mockConfirmationService,
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(TextEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update exception status', () => {
        mockProjectTranslationService.changeTextnodeStatus.mockReturnValue(of({ status: 'OK' }));
        mockProjectTranslationService
            .changeTextnodeStatus(mockSelectedRow, TranslationStatus.WorkInProgress, 'Translation text')
            .subscribe({
                next: (response: ApiBaseResponseModel) => {
                    expect(response.status).toBe(ResponseStatusEnum.OK);
                },
            });
    });
});
