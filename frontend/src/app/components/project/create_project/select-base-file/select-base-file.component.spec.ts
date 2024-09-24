import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectBaseFileComponent } from './select-base-file.component';

describe('SelectBaseFileComponent', () => {
    let component: SelectBaseFileComponent;
    let fixture: ComponentFixture<SelectBaseFileComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectBaseFileComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectBaseFileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
