import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingProposalComponent } from './mapping-proposal.component';

describe('MappingProposalComponent', () => {
    let component: MappingProposalComponent;
    let fixture: ComponentFixture<MappingProposalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MappingProposalComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(MappingProposalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
