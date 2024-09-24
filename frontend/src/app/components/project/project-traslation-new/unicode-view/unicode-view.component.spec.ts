import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnicodeViewComponent } from './unicode-view.component';

describe('UnicodeViewComponent', () => {
    let component: UnicodeViewComponent;
    let fixture: ComponentFixture<UnicodeViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UnicodeViewComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UnicodeViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
