import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateViewComponent } from './translate-view.component';

describe('TranslateViewComponent', () => {
    let component: TranslateViewComponent;
    let fixture: ComponentFixture<TranslateViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TranslateViewComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TranslateViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
