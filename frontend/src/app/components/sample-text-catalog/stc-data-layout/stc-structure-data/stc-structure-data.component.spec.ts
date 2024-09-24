import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StcTreeDataComponent } from './stc-structure-data.component';

describe('StcTreeDataComponent', () => {
    let component: StcTreeDataComponent;
    let fixture: ComponentFixture<StcTreeDataComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StcTreeDataComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StcTreeDataComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
