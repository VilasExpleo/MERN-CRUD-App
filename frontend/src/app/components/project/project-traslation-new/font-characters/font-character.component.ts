import { Component, OnInit, OnDestroy } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { Observable, Subject, catchError, of } from 'rxjs';
import { FontCharacterService } from 'src/app/core/services/project/project-translation/font-character/font-character.service';
import { FontCharacterModel } from './font-character.model';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-font-character',
    templateUrl: './font-character.component.html',
})
export class FontCharacterComponent implements OnInit, OnDestroy {
    readonly batchSize = 1000; // Number of characters to load at a time
    readonly noOfColumns = 10;

    characters: FontCharacterModel[] = [];
    characters$: Observable<FontCharacterModel[]>;
    destroyed$ = new Subject<boolean>();

    rowIndex = 0;
    selectedCharacter: FontCharacterModel | null = null;
    readonly totalRecords = 65536;

    constructor(
        private fontCharacterService: FontCharacterService,
        private ref: DynamicDialogRef,
        private dialogConfig: DynamicDialogConfig
    ) {}

    ngOnInit(): void {
        this.loadFontAndDisplayCharacters();
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    loadFontAndDisplayCharacters() {
        const fontUrl = this.dialogConfig?.data?.fontUrl;
        this.fontCharacterService
            .getFontFile(fontUrl)
            .pipe(catchError(() => of(undefined)))
            .subscribe((fontBlob: Blob) => {
                if (fontBlob) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const loadedFontUrl = reader.result as string;
                        this.createFontFaceForDocument(loadedFontUrl);
                    };
                    reader.readAsDataURL(fontBlob);
                }
            });
    }

    loadCharactersLazy(event: LazyLoadEvent) {
        const startIndex = event.first || 0;
        const endIndex = Math.min(startIndex + event.rows!, this.totalRecords);
        if (this.characters.length < this.totalRecords && endIndex + 40 >= this.characters.length / this.noOfColumns) {
            this.characters = this.fontCharacterService.loadCharacters(
                this.characters,
                this.characters.length,
                Math.min(this.totalRecords, this.characters.length + this.batchSize)
            );
        }
    }

    handleClick(character: FontCharacterModel) {
        this.selectedCharacter = this.selectedCharacter === character ? null : character;
    }

    private createFontFaceForDocument(fontUrl: string) {
        // Create a <style> element to apply the font
        const style = document.createElement('style');
        style.textContent = `
                                @font-face {
                                  font-family: 'CustomFont';
                                  src: url(${fontUrl}) format('truetype');
                                }
                              `;
        document.head.appendChild(style);
    }

    insertSymbol() {
        this.ref.close(this.selectedCharacter.character);
    }
}
