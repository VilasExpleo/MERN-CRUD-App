import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassignWorkerComponent } from './reassign-translator.component';

describe('ReassignWorkerComponent', () => {
    let component: ReassignWorkerComponent;
    let fixture: ComponentFixture<ReassignWorkerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReassignWorkerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ReassignWorkerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
