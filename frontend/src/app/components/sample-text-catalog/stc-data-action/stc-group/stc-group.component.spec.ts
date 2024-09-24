import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StcGroupComponent } from './stc-group.component';

describe('StcGroupComponent', () => {
    let component: StcGroupComponent;
    let fixture: ComponentFixture<StcGroupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StcGroupComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StcGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
