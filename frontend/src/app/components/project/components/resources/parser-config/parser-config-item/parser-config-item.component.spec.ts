import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParserConfigItemComponent } from './parser-config-item.component';

describe('ParserConfigItemComponent', () => {
    let component: ParserConfigItemComponent;
    let fixture: ComponentFixture<ParserConfigItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParserConfigItemComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ParserConfigItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
