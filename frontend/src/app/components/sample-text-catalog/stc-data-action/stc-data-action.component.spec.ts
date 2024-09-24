import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StcDataActionComponent } from './stc-data-action.component';

describe('StcDataActionComponent', () => {
    let component: StcDataActionComponent;
    let fixture: ComponentFixture<StcDataActionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StcDataActionComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StcDataActionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
