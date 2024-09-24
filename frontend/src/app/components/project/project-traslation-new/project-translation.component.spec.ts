import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTranslationComponent } from './project-translation.component';

describe('ProjectTranslationComponent', () => {
    let component: ProjectTranslationComponent;
    let fixture: ComponentFixture<ProjectTranslationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectTranslationComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTranslationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
