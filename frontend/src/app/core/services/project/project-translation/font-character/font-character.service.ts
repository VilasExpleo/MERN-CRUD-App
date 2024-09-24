import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../api.service';
import { FontCharacterModel } from 'src/app/components/project/project-traslation-new/font-characters/font-character.model';
@Injectable({
    providedIn: 'root',
})
export class FontCharacterService {
    constructor(private apiService: ApiService) {}

    getFontFile(fontUrl: string): Observable<Blob> {
        return this.apiService.downloadRequestFromOtherServer(fontUrl);
    }

    loadCharacters(
        existingCharacters: FontCharacterModel[],
        startIndex: number,
        endIndex: number
    ): FontCharacterModel[] {
        const characters: FontCharacterModel[] = [
            ...existingCharacters,
            ...Array.from({ length: endIndex - startIndex }, (_, index) => {
                const charCode = startIndex + index;
                if (charCode >= 65536) {
                    return null;
                }
                const char = String.fromCharCode(charCode);
                return {
                    character: char,
                    characterHexCode: `0x${this.charCodeToHex(char)}`,
                };
            }).filter((charInfo) => charInfo !== null),
        ];
        return characters;
    }

    private charCodeToHex(char: string): string {
        const hex = char.charCodeAt(0).toString(16).toUpperCase();
        return '0000'.slice(0, 4 - hex.length) + hex;
    }
}
