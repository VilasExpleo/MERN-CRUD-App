import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageDocumentsComponent } from './manage-documents.component';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslationRequestService } from '../../../../../core/services/translation-request/translation-request.service';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { HttpClientModule } from '@angular/common/http';
import { FileUpload } from 'primeng/fileupload';

describe('ManageDocumentsComponent', () => {
    let component: ManageDocumentsComponent;
    let fixture: ComponentFixture<ManageDocumentsComponent>;
    let mockRouter: Spy<Router>;
    let mockTranslationRequestService: Spy<TranslationRequestService>;
    let mockConfig: Spy<DynamicDialogConfig>;
    let mockRef: Spy<DynamicDialogRef>;
    let mockMessageService: Spy<MessageService>;
    let mockConfirmationService: Spy<ConfirmationService>;
    let mockFileUpload: Spy<FileUpload>;

    beforeEach(async () => {
        mockRouter = createSpyFromClass(Router);
        mockTranslationRequestService = createSpyFromClass(TranslationRequestService);
        mockConfig = createSpyFromClass(DynamicDialogConfig);
        mockRef = createSpyFromClass(DynamicDialogRef);
        mockMessageService = createSpyFromClass(MessageService);
        mockConfirmationService = createSpyFromClass(ConfirmationService);
        mockFileUpload = createSpyFromClass(FileUpload);

        await TestBed.configureTestingModule({
            declarations: [ManageDocumentsComponent],
            imports: [HttpClientModule],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: TranslationRequestService, useValue: mockTranslationRequestService },
                { provide: DynamicDialogConfig, useValue: mockConfig },
                { provide: DynamicDialogRef, useValue: mockRef },
                { provide: MessageService, useValue: mockMessageService },
                { provide: ConfirmationService, useValue: mockConfirmationService },
                { provide: FileUpload, useValue: mockFileUpload },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ManageDocumentsComponent);
        component = fixture.componentInstance;
        mockConfig.data = { existingDocs: ['document1.docx', 'document2.docx'] };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
