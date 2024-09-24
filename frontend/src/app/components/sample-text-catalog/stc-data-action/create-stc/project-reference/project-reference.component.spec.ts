import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectReferenceComponent } from './project-reference.component';

describe('ProjectReferenceComponent', () => {
    let component: ProjectReferenceComponent;
    let fixture: ComponentFixture<ProjectReferenceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectReferenceComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectReferenceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
