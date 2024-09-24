import { SpellcheckModel } from './spellcheck.model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SpellcheckTransformer {
    transform(spellcheck: SpellcheckModel): SpellcheckModel {
        return {
            currentVersion: spellcheck?.currentVersion,
            latestVersion: spellcheck?.latestVersion,
            spellchecker: spellcheck?.spellchecker,
        };
    }
}
