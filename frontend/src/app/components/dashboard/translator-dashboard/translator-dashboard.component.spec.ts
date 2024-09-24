import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslatorDashboardComponent } from './translator-dashboard.component';

describe('TranslatorDashboardComponent', () => {
    let component: TranslatorDashboardComponent;
    let fixture: ComponentFixture<TranslatorDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TranslatorDashboardComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TranslatorDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
