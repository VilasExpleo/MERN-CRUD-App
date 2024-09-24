import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionTabComponent } from './description.component';

describe('DescriptionTabComponent', () => {
    let component: DescriptionTabComponent;
    let fixture: ComponentFixture<DescriptionTabComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DescriptionTabComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DescriptionTabComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
