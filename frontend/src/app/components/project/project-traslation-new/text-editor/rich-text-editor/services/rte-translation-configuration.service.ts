import { Injectable } from '@angular/core';
import { RTETextTransformationConfigurationEnum } from '../enum/rich-text-editor.enum';
import { ConfigurationModel, RTETranslationConfigurationModel } from '../models/rte-translation-configuration.model';

@Injectable({
    providedIn: 'root',
})
export class RTETranslationConfigurationService {
    configuration(): RTETranslationConfigurationModel {
        return {
            space: this.spaceConfiguration(),
            par: this.paragraphConfiguration(),
            newlineA: this.newLineAConfiguration(),
            newlineB: this.newLineBConfiguration(),
            placeholder: this.placeholderConfiguration(),
        };
    }

    spaceConfiguration(): ConfigurationModel {
        return {
            name: RTETextTransformationConfigurationEnum.SPACE,
            unnamedRegex: / /g,
            namedRegex: /(?<space> )/g,
            replacementString: '•',
            colorBlue: true,
            advanceCursor: false,
        };
    }

    paragraphConfiguration(): ConfigurationModel {
        return {
            name: RTETextTransformationConfigurationEnum.PARAGRAPH,
            unnamedRegex: /[¶⏎](?!\n)/g,
            namedRegex: /(?<par>[¶⏎])(?!\n)/g,
            replacementString: '',
            colorBlue: false,
            advanceCursor: false,
        };
    }

    newLineAConfiguration(): ConfigurationModel {
        return {
            name: RTETextTransformationConfigurationEnum.NEWLINEA,
            unnamedRegex: /(?<![¶⏎])\n(?!$)/g,
            namedRegex: /(?<![¶⏎])(?<newlineA>\n)(?!$)/g,
            replacementString: '¶\n',
            colorBlue: true,
            advanceCursor: true,
        };
    }

    newLineBConfiguration(): ConfigurationModel {
        return {
            name: RTETextTransformationConfigurationEnum.NEWLINEB,
            unnamedRegex: /(?<![¶⏎])\n(?=$)/g,
            namedRegex: /(?<![¶⏎])(?<newlineB>\n)(?=$)/g,
            replacementString: '¶',
            colorBlue: true,
            advanceCursor: false,
        };
    }

    placeholderConfiguration(): ConfigurationModel {
        return {
            name: RTETextTransformationConfigurationEnum.PLACEHOLDER,
            unnamedRegex: /%n/g,
            namedRegex: /(?<placeholder>%n)/g,
            replacementString: null,
            colorBlue: false,
            advanceCursor: false,
        };
    }
}
