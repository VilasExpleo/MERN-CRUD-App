import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createSpyFromClass } from 'jest-auto-spies';
import { DialogService } from 'primeng/dynamicdialog';
import { tmdata } from 'src/app/shared/models/tmdata';
import { TranslationRequestService } from '../../../../../core/services/translation-request/translation-request.service';
import { UserService } from '../../../../../core/services/user/user.service';
import { ViewDocumentsComponent } from './view-documents.component';

describe('ViewDocumentsComponent', () => {
    let component: ViewDocumentsComponent;
    let fixture: ComponentFixture<ViewDocumentsComponent>;
    let mockUserService: UserService;
    let mockTranslationRequestService: TranslationRequestService;
    let mockDialogService: DialogService;

    beforeEach(async () => {
        mockUserService = createSpyFromClass(UserService);
        mockTranslationRequestService = createSpyFromClass(TranslationRequestService);
        mockDialogService = createSpyFromClass(DialogService);

        await TestBed.configureTestingModule({
            declarations: [ViewDocumentsComponent],
            providers: [
                { provide: UserService, useValue: mockUserService },
                { provide: TranslationRequestService, useValue: mockTranslationRequestService },
                { provide: DialogService, useValue: mockDialogService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ViewDocumentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should call getAllDocuments with necessary parameters', () => {
        const project: tmdata = {
            project_id: 1,
            version_id: 1,
            translation_request_id: 0,
            version_id_show: '',
            pm_due_data: undefined,
            proofread: false,
            document: '',
            status: 0,
            project_title: '',
            brand: '',
            language_prop: [],
        };
        const translationRequestId = 1;

        component.selectedProject = project;
        component.translation_request_id = translationRequestId;
        jest.spyOn(mockTranslationRequestService, 'getAllDocuments');

        fixture.whenStable().then(() => {
            expect(mockTranslationRequestService.getAllDocuments).toHaveBeenCalledWith({
                project_id: project.project_id,
                version_id: project.version_id,
                translationRequestId,
            });
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
