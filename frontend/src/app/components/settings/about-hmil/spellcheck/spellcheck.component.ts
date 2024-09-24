import { Component, OnInit } from '@angular/core';
import { SpellcheckService } from 'src/app/core/services/about-hmil/spellcheck/spellcheck.service';
import { SpellcheckModel } from './spellcheck.model';

@Component({
    selector: 'app-spellcheck',
    templateUrl: './spellcheck.component.html',
})
export class SpellcheckComponent implements OnInit {
    spellcheck: SpellcheckModel;
    currentVersionText = 'Currently used version:';
    latestVersionText = 'Latest available version:';
    spellcheckTabText = 'Spellcheck';

    constructor(private spellcheckService: SpellcheckService) {}

    ngOnInit(): void {
        this.getSpellcheckVersion();
    }

    private getSpellcheckVersion() {
        this.spellcheckService.getSpellcheckVersion().subscribe((response: SpellcheckModel) => {
            this.spellcheck = response;
        });
    }

    private versionUpdateText(): string {
        return `A new ${this.spellcheck?.spellchecker} update is available! Please contact your system operator.`;
    }

    displayMessage(spellcheck: SpellcheckModel): string {
        const latestVersion = parseInt(spellcheck?.latestVersion);
        const currentVersion = parseInt(spellcheck?.currentVersion);
        if (latestVersion > currentVersion) {
            return this.versionUpdateText();
        } else {
            return '';
        }
    }
}
