import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createSpyFromClass } from 'jest-auto-spies';
import { ProjectService } from '../../../../core/services/project/project.service';

import { DoughnutChartComponent } from './doughnut-chart.component';

describe('DoughnutChartComponent', () => {
    let component: DoughnutChartComponent;
    let fixture: ComponentFixture<DoughnutChartComponent>;
    let mockProjectService: ProjectService;

    beforeEach(async () => {
        mockProjectService = createSpyFromClass(ProjectService);

        await TestBed.configureTestingModule({
            declarations: [DoughnutChartComponent],
            providers: [{ provide: ProjectService, useValue: mockProjectService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DoughnutChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should call projectOverview with necessary parameters', () => {
        const xlsxDownloadId = 1;
        const editorLanguage = 'de';
        jest.spyOn(mockProjectService, 'projectOverview');
        component.xlsxdownloadId = xlsxDownloadId;
        component.editorLanguage = editorLanguage;
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(mockProjectService.projectOverview).toHaveBeenCalledWith({
                project_id: xlsxDownloadId,
                editor_language: editorLanguage,
            });
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
