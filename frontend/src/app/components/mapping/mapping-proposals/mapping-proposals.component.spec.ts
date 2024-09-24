import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingProposalsComponent } from './mapping-proposals.component';

describe('MappingProposalsComponent', () => {
    let component: MappingProposalsComponent;
    let fixture: ComponentFixture<MappingProposalsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MappingProposalsComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MappingProposalsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
