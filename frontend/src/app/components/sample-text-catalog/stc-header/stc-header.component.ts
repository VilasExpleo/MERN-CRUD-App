import { Component, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription, catchError, combineLatest, of } from 'rxjs';
import { SampleTextCatalogService } from 'src/app/core/services/sample-text-catalog-service/sample-text-catalog.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { iconBaseUrl } from 'src/app/shared/config/config';
import { STCLanguage } from 'src/app/shared/models/sample-text-catalog/stc-language';
import { StcLanguageConfigurationComponent } from './stc-language-configuration/stc-language-configuration.component';

@Component({
    selector: 'app-stc-header',
    templateUrl: './stc-header.component.html',
    styleUrls: ['./stc-header.component.scss'],
})
export class StcHeaderComponent implements OnInit {
    baseURL: string = iconBaseUrl;
    ref: object;
    sourceLanguage: STCLanguage[] = [];
    targetLanguage: STCLanguage[] = [];
    state;
    subscription: Subscription;
    userInfo: object;
    hideStcHeader = false;
    constructor(
        private dialogService: DialogService,
        private sampleTextCatalogService: SampleTextCatalogService,
        private userService: UserService,
        private eventBus: NgEventBus
    ) {}

    ngOnInit(): void {
        this.userInfo = this.userService.getUser();
        this.subscription = this.sampleTextCatalogService.getSTCState().subscribe((res) => {
            this.state = res;
        });
        this.state.userInfo = this.userInfo;
        this.sampleTextCatalogService.setSTCState(this.state);
        this.onLoad();
        this.eventBus.on('stcDataById:stcData').subscribe(() => {
            this.hideStcHeader = true;
        });
    }

    onLoad() {
        const languagesUrl = 'stclanguages';
        const selectedLangURL = 'stclanguages/editorlanguages';

        combineLatest([
            this.sampleTextCatalogService.getSTCLanguages(languagesUrl).pipe(catchError(() => of(undefined))),
            this.sampleTextCatalogService.getSelectedLanguages(selectedLangURL).pipe(catchError(() => of(undefined))),
        ]).subscribe(([stclanguagesRes, selectedlanguagesRes]) => {
            if (stclanguagesRes && stclanguagesRes['status'] === 'OK') {
                this.sourceLanguage = stclanguagesRes['data'];
            }
            if (selectedlanguagesRes && selectedlanguagesRes['status'] === 'OK') {
                this.targetLanguage = selectedlanguagesRes['data'];
                this.state.targetLanguage = this.targetLanguage;

                const unselectedSourceLanguage = this.sourceLanguage.filter(
                    ({ language_culture_name: sl }) =>
                        !this.targetLanguage.some(({ language_culture_name: tl }) => sl === tl)
                );
                this.state.sourceLanguage = unselectedSourceLanguage;
                this.state.isLanguageChange = 1;
                this.sampleTextCatalogService.setSTCState(this.state);
            }
        });
    }
    displayLanguageConfigDialog() {
        this.ref = this.dialogService.open(StcLanguageConfigurationComponent, {
            header: `Language Selection`,
            footer: ' ',
            autoZIndex: false,
            closeOnEscape: false,
        });
    }
}
