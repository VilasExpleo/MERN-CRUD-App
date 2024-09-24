import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrammarParserComponent } from './grammar-parser.component';

describe('GrammmarParserComponent', () => {
    let component: GrammarParserComponent;
    let fixture: ComponentFixture<GrammarParserComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GrammarParserComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GrammarParserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
