import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmProjectPropertiesComponent } from './confirm-project-properties.component';

describe('ConfirmProjectPropertiesComponent', () => {
    let component: ConfirmProjectPropertiesComponent;
    let fixture: ComponentFixture<ConfirmProjectPropertiesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfirmProjectPropertiesComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmProjectPropertiesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
