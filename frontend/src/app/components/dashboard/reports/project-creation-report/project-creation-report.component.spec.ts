import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCreationReportComponent } from './project-creation-report.component';

describe('ProjectCreationReportComponent', () => {
    let component: ProjectCreationReportComponent;
    let fixture: ComponentFixture<ProjectCreationReportComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectCreationReportComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectCreationReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
