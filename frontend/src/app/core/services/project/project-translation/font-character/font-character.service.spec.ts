import { Spy, createSpyFromClass } from 'jest-auto-spies';
import { FontCharacterService } from './font-character.service';
import { ApiService } from '../../../api.service';

describe('FontCharacterService', () => {
    let mockFontCharacterService: FontCharacterService;
    let mockApiService: Spy<ApiService>;

    const mockCharacters = [
        { character: 'A', characterHexCode: '0x0041' },
        { character: 'B', characterHexCode: '0x0042' },
    ];

    beforeEach(() => {
        mockApiService = createSpyFromClass(ApiService);
        mockFontCharacterService = new FontCharacterService(mockApiService);
    });

    it('should be created', () => {
        expect(FontCharacterService).toBeTruthy();
    });

    describe('loadCharacters', () => {
        it('should load characters correctly within the specified range', () => {
            const generatedCharacters = [
                { character: 'C', characterHexCode: '0x0043' },
                { character: 'D', characterHexCode: '0x0044' },
            ];
            const startIndex = 67;
            const endIndex = 69;

            const result = mockFontCharacterService.loadCharacters(mockCharacters, startIndex, endIndex);

            expect(result).toEqual([...mockCharacters, ...generatedCharacters]);
        });

        it('should handle the startIndex and endIndex outside of the valid ASCII range', () => {
            const startIndex = 123456;
            const endIndex = 123458;

            const result = mockFontCharacterService.loadCharacters(mockCharacters, startIndex, endIndex);

            expect(result).toEqual(mockCharacters); // No characters should be added
        });
    });
});
