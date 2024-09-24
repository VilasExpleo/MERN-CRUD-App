import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslationStatisticsComponent } from './translation-statistics.component';

describe('StatisticsComponent', () => {
    let component: TranslationStatisticsComponent;
    let fixture: ComponentFixture<TranslationStatisticsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TranslationStatisticsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TranslationStatisticsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
