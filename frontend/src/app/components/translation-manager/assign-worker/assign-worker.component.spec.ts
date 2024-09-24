import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignWorkerComponent } from './assign-worker.component';

describe('AssignWorkerComponent', () => {
    let component: AssignWorkerComponent;
    let fixture: ComponentFixture<AssignWorkerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignWorkerComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignWorkerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
