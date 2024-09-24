import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectHelpIndexComponent } from './project-help-index.component';
import { ProjectHelpService } from 'src/app/core/services/project/project-help/project-help.service';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ProjectHelpTabs } from './project-help.enum';

describe('ProjectHelpIndexComponent', () => {
    let component: ProjectHelpIndexComponent;
    let fixture: ComponentFixture<ProjectHelpIndexComponent>;

    let mockProjectHelpService: Spy<ProjectHelpService>;
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

    beforeEach(async () => {
        mockProjectHelpService = createSpyFromClass(ProjectHelpService);

        mockProjectHelpService.getHelpPages.mockReturnValue(of([mockRow]));
        await TestBed.configureTestingModule({
            declarations: [ProjectHelpIndexComponent],
            providers: [
                {
                    provide: ProjectHelpService,
                    useValue: mockProjectHelpService,
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ProjectHelpIndexComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call api to get available pages', () => {
        fixture.detectChanges();
        expect(component.cols.length).toBe(1);
        expect(component.pages.length).toBe(1);
    });

    it('should set selected tab state when tab is changed', () => {
        component.tabChange(ProjectHelpTabs.Pages);
        expect(mockProjectHelpService.setSelectedTab).toHaveBeenCalledWith(ProjectHelpTabs.Pages);
    });
});
