import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiffrenceElementComponent } from './diffrence-element.component';

describe('DiffrenceElementComponent', () => {
    let component: DiffrenceElementComponent;
    let fixture: ComponentFixture<DiffrenceElementComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DiffrenceElementComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DiffrenceElementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
