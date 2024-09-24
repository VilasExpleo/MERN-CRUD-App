import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StcDetailsComponent } from './stc-details.component';

describe('StcDetailsComponent', () => {
    let component: StcDetailsComponent;
    let fixture: ComponentFixture<StcDetailsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StcDetailsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StcDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
