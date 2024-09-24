import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofreaderDashboardComponent } from './proofreader-dashboard.component';

describe('ProofreaderDashboardComponent', () => {
    let component: ProofreaderDashboardComponent;
    let fixture: ComponentFixture<ProofreaderDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProofreaderDashboardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ProofreaderDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
