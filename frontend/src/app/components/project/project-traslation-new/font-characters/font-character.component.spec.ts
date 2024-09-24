import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontCharacterComponent } from './font-character.component';
import { FontCharacterService } from 'src/app/core/services/project/project-translation/font-character/font-character.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChunkPipe } from 'src/app/shared/pipes/chunk.pipe';
import { TableModule } from 'primeng/table';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('FontCharactersComponent', () => {
    let component: FontCharacterComponent;
    let fixture: ComponentFixture<FontCharacterComponent>;
    let fontCharacterService: FontCharacterService;
    let dynamicDialogRef: DynamicDialogRef;

    const mockFontUrl = 'files/zen.ttf';
    const mockCharacters = [
        { character: 'A', characterHexCode: '0x0041' },
        { character: 'B', characterHexCode: '0x0042' },
    ];
    const mockBlob = new Blob(['testing'], { type: 'application/x-font-ttf' });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FontCharacterComponent, ChunkPipe],
            providers: [FontCharacterService, DynamicDialogRef, DynamicDialogConfig],
            imports: [HttpClientModule, HttpClientTestingModule, TableModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(FontCharacterComponent);
        component = fixture.componentInstance;
        fontCharacterService = TestBed.inject(FontCharacterService);
        dynamicDialogRef = TestBed.inject(DynamicDialogRef);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('loadFontAndDisplayCharacters', () => {
        it('should call getFontFile for font', () => {
            jest.spyOn(fontCharacterService, 'getFontFile').mockReturnValue(of(mockBlob));
            component.loadFontAndDisplayCharacters();
            fontCharacterService.getFontFile(mockFontUrl).subscribe((res: Blob) => {
                expect(res).toBe(mockBlob);
            });
        });
    });

    it('should unsubscribe from destroyed$ on ngOnDestroy', () => {
        jest.spyOn(component.destroyed$, 'next');
        fixture.destroy();
        expect(component.destroyed$.next).toHaveBeenCalledWith(true);
    });

    it('should complete for destroyed$ on ngOnDestroy', () => {
        jest.spyOn(component.destroyed$, 'complete');
        fixture.destroy();
        expect(component.destroyed$.complete).toHaveBeenCalled();
    });

    it('should close the dialog on insertSymbol', () => {
        component.selectedCharacter = mockCharacters[0];
        jest.spyOn(dynamicDialogRef, 'close');
        component.insertSymbol();
        expect(dynamicDialogRef.close).toHaveBeenCalledWith(component.selectedCharacter.character);
    });
});
