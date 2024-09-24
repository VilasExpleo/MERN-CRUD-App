import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StcHistoryComponent } from './stc-history.component';

describe('StcHistoryComponent', () => {
    let component: StcHistoryComponent;
    let fixture: ComponentFixture<StcHistoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StcHistoryComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StcHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
