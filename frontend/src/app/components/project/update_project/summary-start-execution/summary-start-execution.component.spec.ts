import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryStartExecutionComponent } from './summary-start-execution.component';

describe('SummaryStartExecutionComponent', () => {
    let component: SummaryStartExecutionComponent;
    let fixture: ComponentFixture<SummaryStartExecutionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SummaryStartExecutionComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SummaryStartExecutionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
