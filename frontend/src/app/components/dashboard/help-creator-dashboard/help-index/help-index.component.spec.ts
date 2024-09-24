import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HelpIndexComponent } from './help-index.component';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { HelpCreatorService } from 'src/app/core/services/help-creator/help-creator.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

describe('HelpIndexComponent', () => {
    let component: HelpIndexComponent;
    let fixture: ComponentFixture<HelpIndexComponent>;
    let mockHelpCreatorService: Spy<HelpCreatorService>;
    let mockMessageService: Spy<MessageService>;

    const mockRowProperties = {
        id: 1,
        pageId: 1,
        parentPageId: 1,
        pageTitle: 'mockpage',
        isChild: false,
        isEditMode: false,
        isSaved: false,
    };

    const mockRow = {
        data: mockRowProperties,
        children: [
            {
                data: mockRowProperties,
            },
        ],
    };

    const mockPages = [mockRow];

    const mockRowNode = {
        level: 0,
        node: mockRow,
        parent: mockRow,
        visible: true,
    };
    beforeEach(async () => {
        mockHelpCreatorService = createSpyFromClass(HelpCreatorService);

        mockHelpCreatorService.getHelpSystemPages.mockReturnValue(of(mockPages));
        mockHelpCreatorService.addPage.mockReturnValue(of({ status: 'OK' }));

        await TestBed.configureTestingModule({
            declarations: [HelpIndexComponent],
            providers: [
                {
                    provide: MessageService,
                    useValue: mockMessageService,
                },
                {
                    provide: HelpCreatorService,
                    useValue: mockHelpCreatorService,
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(HelpIndexComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit life cycle method', () => {
        it('should set page value', () => {
            fixture.detectChanges();
            expect(component.pages.length).toBeGreaterThanOrEqual(1);
        });
    });

    it('should make row expand on start edit', () => {
        component.startEdit(mockRowProperties, mockRowNode);
        expect(mockRowProperties.isEditMode).toBe(true);
    });

    it('should call add page Api to save', () => {
        component.savePage(mockRowProperties);
        expect(mockHelpCreatorService.addPage).toHaveBeenCalledWith(mockRowProperties);
    });
    it('should update edit mode and saved flag after call of add page Api to save', () => {
        component.savePage(mockRowProperties);
        mockHelpCreatorService.addPage(mockRowProperties).subscribe((response) => {
            expect(mockRowProperties.isEditMode).toBe(false);
            expect(mockRowProperties.isSaved).toBe(true);
            expect(mockRowProperties.pageId).toBe(response.data['pageId']);
        });
    });

    it('should update the page after addPage', () => {
        fixture.detectChanges();
        component.addPage();
        expect(component.pages.length).toBe(2);
    });

    it('should update page children', () => {
        component.addPageItem(mockRowNode);
        expect(mockRowNode.node['expanded']).toBe(true);
        expect(mockRowNode.node.children.length).toBe(2);
    });

    it('should revert back from edit mode', () => {
        mockRowProperties.isEditMode = true;
        component.cancelEdit(mockRowNode, mockRowProperties);
        expect(mockRowProperties['isEditMode']).toBe(false);
    });

    it('should emit selected row onSelection of row', () => {
        component.selectedRow = mockRow;
        component.selectionChange();
        const mockEmit = jest.spyOn(component.selectedPageEvent, 'emit');
        component.selectedPageEvent.emit(component.selectedRow.data);
        expect(mockEmit).toHaveBeenCalledWith(mockRow.data);
    });

    it('should delete the pages on deletePage', () => {
        component.deletePage(mockRowNode, mockRowProperties);
        expect(component.deleteConfirmationModel.showConfirmation).toBe(true);
    });
    it('should isParentHasChildren should be true on deletePage', () => {
        component.deletePage(mockRowNode, mockRowProperties);
        expect(component.isParentHasChildren).toBe(true);
    });

    it('should return true if page already exists', () => {
        fixture.detectChanges();
        component.pages.push(mockRow);
        expect(component.isPageExists('mockpage')).toBe(true);
    });
});
