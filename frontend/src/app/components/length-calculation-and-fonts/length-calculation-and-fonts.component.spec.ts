import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LengthCalculationAndFontsComponent } from './length-calculation-and-fonts.component';

describe('LengthCalculationAndFontsComponent', () => {
    let component: LengthCalculationAndFontsComponent;
    let fixture: ComponentFixture<LengthCalculationAndFontsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LengthCalculationAndFontsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(LengthCalculationAndFontsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
