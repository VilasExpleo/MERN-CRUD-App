import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { of } from 'rxjs';
import { ProjectHelpService } from 'src/app/core/services/project/project-help/project-help.service';
import { ProjectHelpSearchComponent } from './project-help-search.component';

describe('ProjectHelpSearchComponent', () => {
    let component: ProjectHelpSearchComponent;
    let fixture: ComponentFixture<ProjectHelpSearchComponent>;
    let mockProjectHelpService: Spy<ProjectHelpService>;

    const filteredPage = {
        pageId: 1,
        pageTitle: 'Test page',
    };
    const filteredPages = [filteredPage];

    beforeEach(async () => {
        mockProjectHelpService = createSpyFromClass(ProjectHelpService);

        mockProjectHelpService.getFilteredPage.mockReturnValue(of(filteredPages));
        mockProjectHelpService.getSelectedTab.mockReturnValue(of(2));

        await TestBed.configureTestingModule({
            declarations: [ProjectHelpSearchComponent],
            providers: [
                {
                    provide: ProjectHelpService,
                    useValue: mockProjectHelpService,
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ProjectHelpSearchComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call get pages on init', () => {
        fixture.detectChanges();
        expect(component.searchedPages.length).toBe(1);
    });

    it('should set selection state when tab is selected', () => {
        component.onSelection(filteredPage);
        const mockPayload = {
            data: { ...filteredPage, id: 0, parentPageId: 0 },
        };
        expect(mockProjectHelpService.setPageState).toHaveBeenCalledWith(mockPayload);
    });

    it('should set search text on search', () => {
        component.onSearch('mock-text');
        expect(mockProjectHelpService.setSearchText).toHaveBeenCalledWith('mock-text');
    });
});
