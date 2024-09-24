import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCreateRawProjectComponent } from './confirm-create-raw-project.component';

describe('ConfirmCreateRawProjectComponent', () => {
    let component: ConfirmCreateRawProjectComponent;
    let fixture: ComponentFixture<ConfirmCreateRawProjectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfirmCreateRawProjectComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmCreateRawProjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
