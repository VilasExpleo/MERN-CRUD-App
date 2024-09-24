import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParserConfigComponent } from './parser-config.component';

describe('ParserConfigComponent', () => {
    let component: ParserConfigComponent;
    let fixture: ComponentFixture<ParserConfigComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParserConfigComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ParserConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
