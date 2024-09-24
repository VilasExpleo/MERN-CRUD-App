import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { HelpCreatorService } from 'src/app/core/services/help-creator/help-creator.service';
import { HelpCreatorDashboardComponent } from './help-creator-dashboard.component';
import { FormGroup, FormControl } from '@angular/forms';
import { ResponseStatusEnum } from 'src/Enumerations';

describe('HelpCreatorDashboardComponent', () => {
    let component: HelpCreatorDashboardComponent;
    let fixture: ComponentFixture<HelpCreatorDashboardComponent>;
    let mockHelpCreatorService: Spy<HelpCreatorService>;
    let mockMessageService: Spy<MessageService>;

    const mockPageProperty = {
        id: 1,
        isChild: false,
        isSaved: true,
        pageId: 57,
        pageTitle: 'structure view',
        parentPageId: 0,
    };

    const mockPage = {
        ...mockPageProperty,
        links: [6],
        formattedContent: '<p>Formatted Content new update version1 </p>',
        tags: ['table view', 'table section', 'new'],
    };

    const mockPagePayload = {
        pageId: 1,
        pageTitle: 'mock page title',
        parentPageId: 0,
        tags: [],
        links: [],
        formattedContent: '',
    };
    const mockPayloadPageProperty = {
        id: 1,
        ...mockPagePayload,
    };

    beforeEach(async () => {
        mockHelpCreatorService = createSpyFromClass(HelpCreatorService);

        mockHelpCreatorService.getPage.mockReturnValue(of(mockPage));
        mockHelpCreatorService.updatePage.mockReturnValue(of({ status: 'OK' }));

        await TestBed.configureTestingModule({
            declarations: [HelpCreatorDashboardComponent],
            providers: [
                {
                    provide: HelpCreatorService,
                    useValue: mockHelpCreatorService,
                },
                {
                    provide: MessageService,
                    useValue: mockMessageService,
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(HelpCreatorDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set page value on pageSelect', () => {
        component.onPageSelect(mockPageProperty);
        mockHelpCreatorService.getPage(mockPageProperty).subscribe((response) => {
            expect(response).toEqual(mockPage);
        });
    });

    it('should set true/false for is page editable', () => {
        component.onEditPage(true);
        expect(component.isPageEditable).toBe(true);
    });

    it('should update page details in update page', () => {
        component.helpPage.helpPageForm = new FormGroup({
            formattedContent: new FormControl(''),
            tags: new FormControl([]),
            links: new FormControl([]),
        });
        component.onUpdatePage(mockPayloadPageProperty);
        expect(component.page).toEqual(mockPagePayload);
    });

    it('should call update page onSavePage', () => {
        const mockOnSavePage = jest.spyOn(component, 'onSavePage');
        component.onSavePage(mockPagePayload);

        expect(mockOnSavePage).toHaveBeenCalledWith(mockPagePayload);

        mockHelpCreatorService.updatePage(mockPagePayload).subscribe((response) => {
            expect(response.status).toBe(ResponseStatusEnum.OK);
            expect(component.helpIndex.properties.isEditMode).toBe(false);
        });
    });
});
