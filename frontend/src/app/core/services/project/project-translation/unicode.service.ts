/* eslint-disable no-prototype-builtins */
import { ElementRef, EventEmitter, Injectable, Output } from '@angular/core';
import { MetaData, NgEventBus } from 'ng-event-bus';
import { MenuItem } from 'primeng/api';

@Injectable({
    providedIn: 'root',
})
export class UnicodeService {
    @Output() directionChangeEvent = new EventEmitter<string>();
    public unicodeActionItems: MenuItem[];
    public myIdentifier: ElementRef;
    public finalTranslationTextInEditor = [];
    public translationText: string;
    public translationTextInEditor = [];
    public tabledata = [];
    public unicode = ['061C', '200E', '200F', '202A', '202B', '202C', '202E', '202D', '2066', '2067', '2068', '2069'];
    constructor(private eventBus: NgEventBus) {}

    getTranslationData() {
        this.eventBus.on('translateData:translateObj').subscribe({
            next: (res: MetaData) => {
                if (
                    res?.data?.treeNode.data.hasOwnProperty('TextNodeId') ||
                    res?.data?.treeNode.data.hasOwnProperty('ID')
                ) {
                    this.translationText = res?.data?.translateObj?.translation;
                    this.onValueChange();
                }
            },
            error: (err) => {
                throw new Error(`Response is not ok ${err.message}`);
            },
        });
        this.onLoad();
    }
    onLoad() {
        this.unicodeActionItems = [
            {
                label: 'Insert Control Character',
                items: [
                    {
                        label: 'U+061C Arabic letter mark',
                        command: () => this.insertControlCharacter('061C'),
                    },
                    {
                        label: 'U+200E Left-to-right mark',
                        command: () => this.insertControlCharacter('200E'),
                    },
                    {
                        label: 'U+200F Right-to-left mark',
                        command: () => this.insertControlCharacter('200F'),
                    },
                    {
                        label: 'U+202A Left-to-right embedding',
                        command: () => this.insertControlCharacter('202A'),
                    },
                    {
                        label: 'U+202B Right-to-left embedding',
                        command: () => this.insertControlCharacter('202B'),
                    },
                    {
                        label: 'U+202C Pop directional formatting',
                        command: () => this.insertControlCharacter('202C'),
                    },
                    {
                        label: 'U+202D Left-to-right override',
                        command: () => this.insertControlCharacter('202D'),
                    },
                    {
                        label: 'U+202E Right-to-left override',
                        command: () => this.insertControlCharacter('202E'),
                    },
                    {
                        label: 'U+2066 Left-to-right isolate',
                        command: () => this.insertControlCharacter('2066'),
                    },
                    {
                        label: 'U+2067 Right-to-left isolate',
                        command: () => this.insertControlCharacter('2067'),
                    },
                    {
                        label: 'U+2068 First strong isolate',
                        command: () => this.insertControlCharacter('2068'),
                    },
                    {
                        label: 'U+2069 Pop directional isolate',
                        command: () => this.insertControlCharacter('2069'),
                    },
                ],
            },
            {
                label: 'Undo',
                icon: '',
                disabled: true,
            },
            {
                label: 'Redo',
                icon: '',
                disabled: true,
            },
            {
                label: 'Cut',
                icon: '',
                disabled: true,
            },
            {
                label: 'Copy',
                icon: '',
                disabled: true,
            },
            {
                label: 'Paste',
                icon: '',
                disabled: true,
            },
        ];
    }
    insertControlCharacter(controlchar) {
        const charMap = {
            character: '',
            unicode: controlchar,
            htmlchar: '&#x' + controlchar + ';',
        };
        this.translationTextInEditor.push(charMap);
        if (controlchar === '202D' || controlchar === '202E') {
            this.directionChangeEvent.emit(controlchar === '202D' ? 'ltr' : 'rtl');
        } // else{
        //   this.directionChangeEvent.emit('auto');
        // }
    }
    onValueChange() {
        this.finalTranslationTextInEditor = [];
        const tempTranslationTextInEditor = [...this.translationTextInEditor];
        this.translationTextInEditor = [];
        const unicodeArray = this.characterToUtf16(this.translationText);
        const value = this.translationText.split('');
        const charMap = {
            character: '',
            unicode: '',
            htmlchar: '',
        };
        if (tempTranslationTextInEditor.length === 0) {
            for (let i = 0; i < value.length; i++) {
                charMap.character = value[i];
                charMap.unicode = unicodeArray[i];
                charMap.htmlchar = '&#x' + unicodeArray[i] + ';';
                this.translationTextInEditor.push({ ...charMap });
            }
            this.tabledata[0] = this.translationTextInEditor;
        } else {
            let tindex = 0;
            for (const element of tempTranslationTextInEditor) {
                if (value[tindex] === element.character) {
                    charMap.character = value[tindex];
                    charMap.unicode = unicodeArray[tindex];
                    charMap.htmlchar = '&#x' + unicodeArray[tindex] + ';';
                    this.finalTranslationTextInEditor.push({ ...charMap });
                    tindex++;
                } else {
                    if (this.unicode.some((item) => item === element.unicode)) {
                        this.finalTranslationTextInEditor.push({
                            ...element,
                        });

                        continue;
                    } else {
                        if (value[tindex] !== undefined) {
                            charMap.character = value[tindex];
                            charMap.unicode = unicodeArray[tindex];
                            charMap.htmlchar = '&#x' + unicodeArray[tindex] + ';';
                            this.finalTranslationTextInEditor.push({ ...charMap });
                            tindex++;
                        }
                    }
                }
            }
            if (
                // tindex <= this.translationText.length &&
                value[tindex] !== undefined
            ) {
                charMap.character = value[tindex];
                charMap.unicode = unicodeArray[tindex];
                charMap.htmlchar = '&#x' + unicodeArray[tindex] + ';';
                this.finalTranslationTextInEditor.push({ ...charMap });
            }
            this.translationTextInEditor = [...this.finalTranslationTextInEditor];
            this.tabledata[0] = this.translationTextInEditor;
        }
    }

    dec2hex(dec, padding) {
        return parseInt(dec, 10).toString(16).padStart(padding, '0');
    }

    characterToUtf16(str) {
        const utf16 = [];
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            utf16.push(this.dec2hex(str.charCodeAt(i), 4));
        }
        return utf16;
    }

    saveUnicodeStatus() {
        // eslint-disable-next-line sonarjs/no-unused-collection
        const unicodeArray = [];
        this.translationTextInEditor.forEach((node) => {
            const unicodeObj = {
                char: node.character,
                unicode: node.unicode,
            };
            unicodeArray.push(unicodeObj);
        });
    }
}
