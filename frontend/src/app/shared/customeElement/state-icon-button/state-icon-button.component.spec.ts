import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateIconButtonComponent } from './state-icon-button.component';

describe('StateIconButtonComponent', () => {
    let component: StateIconButtonComponent;
    let fixture: ComponentFixture<StateIconButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StateIconButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StateIconButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
