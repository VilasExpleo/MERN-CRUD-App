import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { of, take } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { TasksComponent } from './tasks.component';
import { EditableTextModel } from 'src/app/shared/components/editable-list/editable-list.model';

describe('TasksComponent', () => {
    let component: TasksComponent;
    let fixture: ComponentFixture<TasksComponent>;
    let mockTranslationRequestService: Spy<TranslationRequestService>;
    let mockApiService: Spy<ApiService>;

    const mockExistingChecklist = [{ text: 'check 1' }, { text: 'check 2' }];

    beforeEach(async () => {
        mockTranslationRequestService = createSpyFromClass(TranslationRequestService);

        await TestBed.configureTestingModule({
            declarations: [TasksComponent],
            providers: [
                { provide: mockTranslationRequestService, useValue: mockTranslationRequestService },
                { provide: ApiService, useValue: mockApiService },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(TasksComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('On ngOnInit', () => {
        it('should get checklist on ngOnInit', () => {
            let mockFinalResult: EditableTextModel[];
            mockTranslationRequestService.getChecklistState.mockReturnValue(of(mockExistingChecklist));

            fixture.detectChanges();
            component.checklist$ = mockTranslationRequestService.getChecklistState();
            component.checklist$.subscribe((receivedChecklist) => {
                mockFinalResult = [...receivedChecklist];
            });
            expect(mockFinalResult).toStrictEqual(mockExistingChecklist);
        });
    });

    describe('On Add text', () => {
        it('should add a checklist item', () => {
            const newCheck = 'New check';

            let updatedChecklist: EditableTextModel[];
            const mockFinalResult: EditableTextModel[] = [
                { text: 'check 1' },
                { text: 'check 2' },
                { text: 'New check' },
            ];

            mockTranslationRequestService.getChecklistState.mockReturnValue(of(mockExistingChecklist));
            component.checklist$ = mockTranslationRequestService.getChecklistState();
            component.add(newCheck);
            component.checklist$.pipe(take(1)).subscribe((receivedChecklist) => {
                updatedChecklist = [...receivedChecklist];
            });
            expect(updatedChecklist).toStrictEqual(mockFinalResult);
        });
    });

    describe('On Edit text', () => {
        it('should edit a checklist item', () => {
            const editTextModel = {
                oldText: 'check 1',
                newText: 'Updated check 1',
            };
            let mockFinalResult: EditableTextModel[];
            const expectedUpdatedChecklist = [{ text: 'Updated check 1', isEditable: false }, { text: 'check 2' }];

            mockTranslationRequestService.getChecklistState.mockReturnValue(of(mockExistingChecklist));
            component.checklist$ = mockTranslationRequestService.getChecklistState();

            component.edit(editTextModel);

            component.checklist$.subscribe((receivedChecklist) => {
                mockFinalResult = [...receivedChecklist];
            });

            expect(mockFinalResult).toStrictEqual(expectedUpdatedChecklist);
        });

        it('should not edit any checklist item', () => {
            const editTextModel = {
                oldText: 'check 3',
                newText: 'Updated check 1',
            };
            let mockFinalResult: EditableTextModel[];
            const expectedUpdatedChecklist = [{ text: 'check 1' }, { text: 'check 2' }];

            mockTranslationRequestService.getChecklistState.mockReturnValue(of(mockExistingChecklist));
            component.checklist$ = mockTranslationRequestService.getChecklistState();

            component.edit(editTextModel);

            component.checklist$.subscribe((receivedChecklist) => {
                mockFinalResult = [...receivedChecklist];
            });

            expect(mockFinalResult).toStrictEqual(expectedUpdatedChecklist);
        });
    });

    describe('On delete text', () => {
        it('should match and delete a checklist item', () => {
            const textToDelete = 'check 1';
            let mockFinalResult: EditableTextModel[];
            const expectedUpdatedChecklist = [{ text: 'check 2' }];

            mockTranslationRequestService.getChecklistState.mockReturnValue(of(mockExistingChecklist));
            component.checklist$ = mockTranslationRequestService.getChecklistState();
            component.deleteList(textToDelete);

            component.checklist$.subscribe((receivedChecklist) => {
                mockFinalResult = [...receivedChecklist];
            });

            expect(mockFinalResult).toStrictEqual(expectedUpdatedChecklist);
        });
        it('should not match and not delete a checklist item', () => {
            const textToDelete = 'check 3';
            let mockFinalResult: EditableTextModel[];
            const expectedUpdatedChecklist = [{ text: 'check 1' }, { text: 'check 2' }];

            mockTranslationRequestService.getChecklistState.mockReturnValue(of(mockExistingChecklist));
            component.checklist$ = mockTranslationRequestService.getChecklistState();
            component.deleteList(textToDelete);

            component.checklist$.subscribe((receivedChecklist) => {
                mockFinalResult = [...receivedChecklist];
            });

            expect(mockFinalResult).toStrictEqual(expectedUpdatedChecklist);
        });
    });
});
