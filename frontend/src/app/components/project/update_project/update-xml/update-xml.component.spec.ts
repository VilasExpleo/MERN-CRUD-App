import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateXmlComponent } from './update-xml.component';

describe('UpdateXmlComponent', () => {
    let component: UpdateXmlComponent;
    let fixture: ComponentFixture<UpdateXmlComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UpdateXmlComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UpdateXmlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
