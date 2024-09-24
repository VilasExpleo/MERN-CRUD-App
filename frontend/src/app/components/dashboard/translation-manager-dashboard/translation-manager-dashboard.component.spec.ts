import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslationManagerDashboardComponent } from './translation-manager-dashboard.component';

describe('TranslationManagerDashboardComponent', () => {
    let component: TranslationManagerDashboardComponent;
    let fixture: ComponentFixture<TranslationManagerDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TranslationManagerDashboardComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TranslationManagerDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
