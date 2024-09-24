import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, catchError, of } from 'rxjs';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';

@Component({
    selector: 'app-language-selection',
    templateUrl: './language-selection.component.html',
    styleUrls: ['./language-selection.component.scss'],
})
export class LanguageSelectionComponent implements OnInit, OnDestroy {
    sourseLanguage = [];
    targetLanguage = [];
    selectedTargetLanguages = [];
    ProjectData;
    subscription: Subscription;
    state;
    languagesForm: UntypedFormGroup;
    isLanguageSelected = true;
    dropdownData;
    editorLanhuage: object;
    isNodeTranslated = false;
    doneNodeCount;

    @Output()
    navigationEvent = new EventEmitter<number>();
    constructor(
        private router: Router,
        public translationRequestService: TranslationRequestService,
        private fb: UntypedFormBuilder
    ) {}

    ngOnInit(): void {
        this.subscription = this.translationRequestService.getProjectManager().subscribe((res) => {
            this.sourseLanguage = [];
            this.editorLanhuage = {
                name: res['editor_language_code'],
                id: res['editor_language'],
            };
            this.ProjectData = res;
            this.ProjectData['language_prop'].forEach((item) => {
                this.sourseLanguage.push({
                    name: item.xml_language,
                    id: item.language_id,
                    parentLanguageId: item.parent_language_id,
                });
            });
            this.sourseLanguage.push(this.editorLanhuage);
            this.dropdownData = [...this.sourseLanguage];
            this.sourseLanguage = this.sourseLanguage.filter((item) => item.name != this.editorLanhuage['name']);
        });
        // set previous state if navigated back
        this.subscription = this.translationRequestService.getLangSelectionState().subscribe((res) => {
            if (res !== null) {
                this.targetLanguage = res.selectedLanguages;
                this.sourseLanguage = res.availableLanguages;
                this.editorLanhuage = res.sourseLanguage;
                this.isLanguageSelected = false;
            }
        });

        this.languagesForm = this.fb.group({
            selectedLanguage: ['', Validators.required],
        });

        this.languagesForm.patchValue({
            selectedLanguage: this.editorLanhuage,
        });
        this.getTranslationStatusOfForeginLanguage();
    }
    getMovedLanguages() {
        this.selectedTargetLanguages = [...this.targetLanguage];

        if (this.targetLanguage.length != 0) {
            this.isLanguageSelected = false;
        }
    }
    getMovedLanguagesToSource() {
        if (this.targetLanguage.length == 0) {
            this.isLanguageSelected = true;
        }
    }
    getSelectedValue(data) {
        this.editorLanhuage = data.value;
        this.sourseLanguage = [...this.dropdownData];
        this.targetLanguage = [...this.selectedTargetLanguages];
        const selectedLanguage = [data.value];

        this.targetLanguage = this.getUnselectedLanguages(this.targetLanguage, selectedLanguage);
        this.sourseLanguage = this.getUnselectedLanguages(this.sourseLanguage, this.targetLanguage);
        this.sourseLanguage = this.getUnselectedLanguages(this.sourseLanguage, selectedLanguage);

        this.getTranslationStatusOfForeginLanguage();
    }

    getUnselectedLanguages(sourceLanguage, selectedLanguage) {
        return sourceLanguage.filter(({ name: sl }) => !selectedLanguage.some(({ name: tl }) => sl === tl));
    }
    navigate(index: number) {
        const sourceLanguage = this.languagesForm.value.selectedLanguage;
        const languageSelection = {
            projectTitle: this.ProjectData['title'],
            projectId: this.ProjectData['project_id'],
            versioNo: this.ProjectData['version_no'],
            editorLanguage: this.ProjectData['editor_language_code'],
            editorLanguageId: this.ProjectData['editor_language'],
            pmEmail: this.ProjectData['project_manager_email'],
            pmName: this.ProjectData['project_manager_email'],
            pmId: this.ProjectData['project_manager_id'],
            translationRole: this.ProjectData['translation_role'],
            selectedLanguages: this.targetLanguage,
            availableLanguages: this.sourseLanguage,
            sourseLanguage: sourceLanguage,
        };
        this.translationRequestService.setLangSelectionState(languageSelection);
        this.navigationEvent.emit(index);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getTranslationStatusOfForeginLanguage() {
        const url = `translation-request/sourceLangCount`;
        const data = {
            project_id: this.ProjectData['project_id'],
            version_id: this.ProjectData['version_no'],
            language_code: this.editorLanhuage['name'],
        };
        this.translationRequestService
            .getTranslationStatusOfForeginLanguage(url, data)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.doneNodeCount = res['data']['count '];
                    if (res['data']['count '] == 0) {
                        this.isNodeTranslated = true;
                    } else {
                        this.isNodeTranslated = false;
                        if (this.targetLanguage.length == 0) {
                            this.isLanguageSelected = true;
                        } else {
                            this.isLanguageSelected = false;
                        }
                    }
                }
            });
    }

    isChildLanguage() {
        return this.targetLanguage.filter((language) => language.parentLanguageId > 0).length > 0;
    }
}
