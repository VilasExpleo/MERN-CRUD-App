import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectHelpListComponent } from './project-help-list.component';
import { ActivatedRoute } from '@angular/router';
import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { ProjectHelpService } from 'src/app/core/services/project/project-help/project-help.service';
import { of } from 'rxjs';

describe('ProjectHelpListComponent', () => {
    let component: ProjectHelpListComponent;
    let fixture: ComponentFixture<ProjectHelpListComponent>;

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

        mockProjectHelpService.getSelectedTab.mockReturnValue(of(0));
        await TestBed.configureTestingModule({
            declarations: [ProjectHelpListComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { data: { pageContext: 0 } } },
                },
                {
                    provide: ProjectHelpService,
                    useValue: mockProjectHelpService,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ProjectHelpListComponent);
        component = fixture.componentInstance;
        component.pages = [mockRow];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should check if tab is selected', () => {
        component.selectedRow = mockRow;
        component.selectionChange();
        expect(mockProjectHelpService.setPageState).toHaveBeenCalledWith(mockRow);
    });
});
