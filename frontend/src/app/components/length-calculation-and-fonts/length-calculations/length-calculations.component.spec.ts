import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LengthCalculationsComponent } from './length-calculations.component';

describe('LengthCalculationsComponent', () => {
    let component: LengthCalculationsComponent;
    let fixture: ComponentFixture<LengthCalculationsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LengthCalculationsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(LengthCalculationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
