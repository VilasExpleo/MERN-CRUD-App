import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockUnlockViewComponent } from './lock-unlock-view.component';

describe('LockUnlockViewComponent', () => {
    let component: LockUnlockViewComponent;
    let fixture: ComponentFixture<LockUnlockViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LockUnlockViewComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LockUnlockViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
