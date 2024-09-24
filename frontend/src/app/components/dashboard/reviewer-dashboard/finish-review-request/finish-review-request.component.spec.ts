import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishReviewRequestComponent } from './finish-review-request.component';

describe('FinishReviewRequestComponent', () => {
    let component: FinishReviewRequestComponent;
    let fixture: ComponentFixture<FinishReviewRequestComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FinishReviewRequestComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FinishReviewRequestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
