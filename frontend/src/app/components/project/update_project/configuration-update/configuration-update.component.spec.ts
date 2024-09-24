import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationUpdateComponent } from './configuration-update.component';

describe('ConfigurationUpdateComponent', () => {
    let component: ConfigurationUpdateComponent;
    let fixture: ComponentFixture<ConfigurationUpdateComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigurationUpdateComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigurationUpdateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
