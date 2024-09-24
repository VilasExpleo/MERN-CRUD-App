import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateXmlComponent } from './validate-xml.component';

describe('ValidateXmlComponent', () => {
    let component: ValidateXmlComponent;
    let fixture: ComponentFixture<ValidateXmlComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ValidateXmlComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ValidateXmlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
