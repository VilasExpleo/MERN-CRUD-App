import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdealTextComponent } from './ideal-text.component';

describe('IdealTextComponent', () => {
    let component: IdealTextComponent;
    let fixture: ComponentFixture<IdealTextComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [IdealTextComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IdealTextComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
