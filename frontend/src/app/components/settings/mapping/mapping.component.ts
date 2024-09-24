import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgEventBus } from 'ng-event-bus';
import { MessageService } from 'primeng/api';
import { MappingService } from 'src/app/core/services/mapping/mapping.service';
import { SampleTextCatalogService } from 'src/app/core/services/sample-text-catalog-service/sample-text-catalog.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { STCLanguage } from 'src/app/shared/models/sample-text-catalog/stc-language';

@Component({
    selector: 'app-mapping',
    templateUrl: './mapping.component.html',
    styleUrls: ['./mapping.component.scss'],
    providers: [MessageService],
})
export class MappingComponent implements OnInit {
    value4 = 50;
    value1 = 1;
    value2 = 2;
    value3 = 2;
    selectedValue = 'val1';
    values: string[] = [];
    @Output() closeSetting: EventEmitter<any> = new EventEmitter();
    @Input() isMappingAssistent;
    @Input() selectedProject;
    mappingGP: UntypedFormGroup;
    submitMappingForm = false;
    sourceLanguages: STCLanguage[] = [];
    targetLanguages: STCLanguage[] = [];
    constructor(
        private fb: UntypedFormBuilder,
        private objMapping: MappingService,
        private sampleTextCatalogService: SampleTextCatalogService,
        private userService: UserService,
        private messageService: MessageService,
        private eventEbMappingAs: NgEventBus
    ) {}

    ngOnInit(): void {
        this.loadLang();
        this.loadMappingForm();
        this.getEditorMappingPreferenceDetails();
    }
    closeBtn() {
        this.getEditorMappingPreferenceDetails();
        this.closeSetting.emit();
    }
    loadMappingForm(): void {
        this.mappingGP = this.fb.group({
            minimumScore: new UntypedFormControl(30, [Validators.required, Validators.max(100), Validators.min(0)]),
            maximumResult: new UntypedFormControl(10, [Validators.required, Validators.max(100), Validators.min(0)]),
            mutipleTranslations: new UntypedFormControl(1, [
                Validators.required,
                Validators.max(100),
                Validators.min(0),
            ]),
            textType: new UntypedFormControl(5, [Validators.required, Validators.max(100), Validators.min(0)]),
            project: new UntypedFormControl(1, [Validators.required, Validators.max(100), Validators.min(0)]),
            brand: new UntypedFormControl(1, [Validators.required, Validators.max(100), Validators.min(0)]),
            matchhandling: new UntypedFormControl('match_any_form'),
            statushandling: new UntypedFormControl(''),
            editor_id: this.userService?.getUser()?.id,
        });
    }
    loadLang(): void {
        const languagesUrl = `stclanguages`;
        this.sampleTextCatalogService.getSTCLanguages(languagesUrl).subscribe((res) => {
            if (res['status'] == 'OK') {
                this.sourceLanguages = res['data'];
            }
        });
    }
    get getMappingFromControls() {
        return this.mappingGP.controls;
    }
    submitMapping() {
        if (this.mappingGP.invalid || this.targetLanguages.length === 0) {
            this.submitMappingForm = true;
        } else {
            this.submitMappingForm = false;
            const url = `editor-mapping-preference/create`;
            this.objMapping.saveMappingSetting(url, this.mappingGP.value, this.targetLanguages).subscribe((res) => {
                if (res && res['status'] === 'OK') {
                    if (this.isMappingAssistent) {
                        this.mappingAssistent();
                    } else {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Mapping setting save successfully',
                        });
                    }
                    setTimeout(() => {
                        this.resetForm();
                    }, 500);
                    this.eventEbMappingAs.cast('globalSetting:afterSaveSettings', '');
                } else {
                    this.messageService.add({
                        severity: 'error',
                        detail: 'Something wrong',
                    });
                }
            });
        }
    }

    resetForm() {
        this.closeSetting.emit();
    }
    getEditorMappingPreferenceDetails() {
        const payload: any = {
            editor_id: this.userService?.getUser()?.id,
        };
        if (payload) {
            this.values = [];
            this.objMapping.getMappingSettingDetailsByEditorID(payload).subscribe((response) => {
                if (response?.['data']?.editor_preference?.[0]) {
                    const settingMappingData = this.processSettingMappingData(response['data']?.editor_preference?.[0]);
                    this.mappingGP.setValue(settingMappingData);
                    ({ targetLanguages: this.targetLanguages, sourceLanguages: this.sourceLanguages } =
                        this.getLanguages(this.sourceLanguages, response['data']?.languages));
                }
            });
        }
    }
    private processSettingMappingData(editor_preference) {
        this.values.push(editor_preference.status_stc === 1 ? 'status_mapping' : '');
        this.values.push(editor_preference.reset_stc_status === 1 ? 'status_mapping' : '');
        return {
            minimumScore: editor_preference.min_score,
            maximumResult: editor_preference.max_result,
            mutipleTranslations: editor_preference.multi_translation_penalty,
            textType: editor_preference.texttype_penalty,
            project: editor_preference.project_penalty,
            brand: editor_preference.brand_penalty,
            matchhandling: editor_preference.match_any_form === 0 ? 'match_ideal_form' : 'match_any_form',
            statushandling: this.values,
            editor_id: this.userService?.getUser()?.id,
        };
    }
    mappingAssistent() {
        const url = 'mapping-assistent/initiate';
        const payload = {
            brand_id: this.selectedProject?.brand_id,
            project_id: this.selectedProject?.project_id,
            editor_id: this.userService?.getUser()?.id,
            editor_language: this.selectedProject?.editor_language_code,
        };
        this.objMapping.mappingAssistent(url, payload).subscribe();
    }

    getLanguages(
        languages: STCLanguage[],
        languageIds: number[]
    ): {
        targetLanguages: STCLanguage[];
        sourceLanguages: STCLanguage[];
    } {
        const targetLanguages: STCLanguage[] = [];
        const sourceLanguages: STCLanguage[] = [];
        for (const sourceLanguage of languages) {
            if (languageIds.includes(sourceLanguage.language_id)) {
                targetLanguages.push(sourceLanguage);
            } else {
                sourceLanguages.push(sourceLanguage);
            }
        }
        return { targetLanguages, sourceLanguages };
    }
}
