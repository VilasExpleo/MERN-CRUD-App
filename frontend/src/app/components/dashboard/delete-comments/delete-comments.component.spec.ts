import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCommentsComponent } from './delete-comments.component';

describe('DeleteCommentsComponent', () => {
    let component: DeleteCommentsComponent;
    let fixture: ComponentFixture<DeleteCommentsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DeleteCommentsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DeleteCommentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
