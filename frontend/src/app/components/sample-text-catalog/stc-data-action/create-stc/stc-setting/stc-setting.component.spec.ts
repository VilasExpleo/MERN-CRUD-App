import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StcSettingComponent } from './stc-setting.component';

describe('StcSettingComponent', () => {
    let component: StcSettingComponent;
    let fixture: ComponentFixture<StcSettingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StcSettingComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StcSettingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
