import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassignProofreaderComponent } from './reassign-proofreader.component';

describe('ReassignProofreaderComponent', () => {
    let component: ReassignProofreaderComponent;
    let fixture: ComponentFixture<ReassignProofreaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReassignProofreaderComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ReassignProofreaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
