import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StcTableDataComponent } from './stc-table-data.component';

describe('StcTableDataComponent', () => {
    let component: StcTableDataComponent;
    let fixture: ComponentFixture<StcTableDataComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StcTableDataComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StcTableDataComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
