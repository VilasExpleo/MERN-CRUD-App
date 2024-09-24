import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignEditorComponent } from './assign-editor.component';

describe('AssignEditorComponent', () => {
    let component: AssignEditorComponent;
    let fixture: ComponentFixture<AssignEditorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignEditorComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AssignEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
