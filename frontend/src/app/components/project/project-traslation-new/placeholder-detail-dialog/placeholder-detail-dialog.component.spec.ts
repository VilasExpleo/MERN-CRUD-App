import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderDetailDialogComponent } from './placeholder-detail-dialog.component';

describe('PlaceholderDetailDialogComponent', () => {
    let component: PlaceholderDetailDialogComponent;
    let fixture: ComponentFixture<PlaceholderDetailDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlaceholderDetailDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PlaceholderDetailDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
