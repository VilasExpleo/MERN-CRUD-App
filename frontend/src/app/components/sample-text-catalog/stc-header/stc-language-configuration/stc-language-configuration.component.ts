import { Component, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { STCLanguage } from 'src/app/shared/models/sample-text-catalog/stc-language';
import { SampleTextCatalogService } from 'src/app/core/services/sample-text-catalog-service/sample-text-catalog.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
    selector: 'app-stc-language-configuration',
    templateUrl: './stc-language-configuration.component.html',
    styleUrls: ['./stc-language-configuration.component.scss'],
})
export class StcLanguageConfigurationComponent implements OnInit {
    sourceLanguage: STCLanguage[] = [];
    targetLanguage: STCLanguage[] = [];
    isSaveEnabled = true;
    //TODO
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    state: any;
    subscription: Subscription;

    constructor(
        private sampleTextCatalogService: SampleTextCatalogService,
        private userService: UserService,
        private ref: DynamicDialogRef,
        private eventBus: NgEventBus
    ) {}

    ngOnInit(): void {
        this.onLoad();
    }

    onLoad() {
        this.subscription = this.sampleTextCatalogService.getSTCState().subscribe((res) => {
            this.state = res;
            this.sourceLanguage = res?.sourceLanguage ?? (res?.data?.sourceLanguage || []);
            this.targetLanguage = res?.targetLanguage ?? (res?.data?.targetLanguage || []);
        });
        if (this.targetLanguage?.length > 0) {
            this.isSaveEnabled = false;
        } else {
            this.isSaveEnabled = true;
        }
    }
    getMovedLanguagesToSource() {
        if (this.targetLanguage.length != 0) {
            this.isSaveEnabled = false;
        } else {
            this.isSaveEnabled = true;
        }
    }

    getTargetLanguages() {
        if (this.targetLanguage.length != 0) {
            this.isSaveEnabled = false;
        }
    }

    hideLanguageConfigDialog() {
        this.ref.close();
    }
    saveLanguageConfiguration() {
        const url = `stclanguages/create`;
        this.state.targetLanguage = [...this.targetLanguage];
        this.sampleTextCatalogService.saveLanguageConfig(url).subscribe((res) => {
            if (res['status'] == 'OK') {
                this.ref.close();
                this.state.isGroupAction = 1;
                this.state.isLanguageChange = 1;
                this.state.targetLanguage = [...this.targetLanguage];
                const unselectedSourceLanguage = this.sourceLanguage.filter(
                    ({ language_culture_name: sl }) =>
                        !this.targetLanguage.some(({ language_culture_name: tl }) => sl === tl)
                );
                this.state.sourceLanguage = unselectedSourceLanguage;
                this.sampleTextCatalogService.setSTCState(this.state);
            }
        });
    }
}
