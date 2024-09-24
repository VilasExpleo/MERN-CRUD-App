import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseFileComponent } from './base-file.component';

describe('BaseFileComponent', () => {
    let component: BaseFileComponent;
    let fixture: ComponentFixture<BaseFileComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BaseFileComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BaseFileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
