import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignProjectManagerComponent } from './assign-project-manager.component';

describe('AssignProjectManagerComponent', () => {
    let component: AssignProjectManagerComponent;
    let fixture: ComponentFixture<AssignProjectManagerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignProjectManagerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AssignProjectManagerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
