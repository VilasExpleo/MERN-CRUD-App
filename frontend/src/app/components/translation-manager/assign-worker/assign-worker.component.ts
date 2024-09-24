import { DatePipe } from '@angular/common';
import { IAssignData, ISaveAssignWorker, TemplateData } from 'src/app/shared/models/translation-manager';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { TranslationManagerService } from 'src/app/core/services/translation-manager-service/translation-manager.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
    selector: 'app-assign-worker',
    templateUrl: './assign-worker.component.html',
    styleUrls: ['./assign-worker.component.scss'],
    providers: [ConfirmationService],
})
export class AssignWorkerComponent implements OnInit {
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onSaveData: EventEmitter<boolean> = new EventEmitter<boolean>();

    form: UntypedFormGroup;
    subscription: Subscription;
    projectData;
    displayAssignWorkerDialog = false;
    showAssignError = true;

    error!: string;
    loading = false;
    dueDate: Date;
    selectedTemplate = 0;
    selectTemplateError = false;
    enableProofRead = false;
    assignWorkerTableData: string[] = [];
    translatorList: string[] = [];
    proofreaderList: string[] = [];

    templateName = '';
    allTranslatorAssigned = false;
    saveAssignData: IAssignData[] = [];
    assignData: IAssignData = <IAssignData>{};

    templateList: string[] = [];
    templateData: TemplateData = <TemplateData>{};
    saveTemplateData: TemplateData[] = [];
    existTemplate = false;
    saveTemplate = false;

    selectedValues = {};

    userInfo;
    reAssignFlag = false;
    templateRequire = false;
    templateNameSubscribe: Subscription;

    constructor(
        private translationService: TranslationManagerService,
        private userService: UserService,
        private datePipe: DatePipe,
        private confirmationService: ConfirmationService
    ) {}
    ngOnInit(): void {
        this.getInitialList();
        this.templateInitialise();
        this.form = new UntypedFormGroup({
            tname: new UntypedFormControl(''),
        });
    }

    submitData() {
        const payload = <ISaveAssignWorker>{};
        payload.project_id = this.projectData.project_id;
        payload.version_id = this.projectData.version_id;
        payload.translation_manager_id = this.userInfo.id;
        payload.translation_manager_email = this.userInfo.email;
        payload.translation_request_id = this.projectData.translation_request_id;
        payload.due_date = this.datePipe.transform(this.dueDate, 'yyyy-MM-dd');
        payload.assignment_data = this.saveAssignData;
        if (this.saveTemplate) {
            if (this.existTemplate) {
                payload.template_data = {
                    layout_name: this.form.controls['tname'].value,
                    action_flag: 'update',
                    template_id: this.templateList.find(
                        (item) => item['layout_name'] === this.form.controls['tname'].value
                    )['ID'],
                    default_layout_selection: 0,
                    data: this.saveTemplateData,
                };
            } else {
                payload.template_data = {
                    layout_name: this.form.controls['tname'].value,
                    action_flag: 'create',
                    template_id: 0,
                    default_layout_selection: 0,
                    data: this.saveTemplateData,
                };
            }
        } else {
            payload.template_data = {
                layout_name: '',
                action_flag: '',
                template_id: 0,
                default_layout_selection: 0,
                data: [],
            };
        }
        this.translationService.saveData(payload).subscribe((res) => {
            if (res['status'] === 'OK') {
                this.displayAssignWorkerDialog = false;
                this.templateInitialise();
                this.onSaveData.emit(true);
            }
        });
    }

    templateSave($event) {
        if ($event.checked) {
            this.form.controls['tname'].addValidators([Validators.required]);
            this.templateNameSubscribe = this.form.get('tname').valueChanges.subscribe((value) => {
                if (value !== '') {
                    this.templateRequire = false;
                    if (this.templateList.some((tn) => tn['layout_name'] === this.form.controls['tname'].value)) {
                        this.existTemplate = true;
                        this.error = `Template name "${this.form.controls['tname'].value}" is already existing. If you continue with Assign button it'll override existing template.`;
                    } else {
                        this.existTemplate = false;
                        this.error = '';
                    }
                } else {
                    this.templateRequire = true;
                }
            });
            this.saveTemplateData = this.saveAssignData.map((item) => {
                this.templateData.language_code = item.language_code;
                this.templateData.translator = item.translator_id;
                this.templateData.proofreader = item.proofreader_id;
                return { ...this.templateData };
            });
        } else {
            this.form.controls['tname'].clearValidators();
            this.templateRequire = false;
            this.templateNameSubscribe.unsubscribe();
        }
    }

    cancelDialog() {
        this.displayAssignWorkerDialog = false;
        this.translationService.clearAssignWorkerDialog();
    }

    useTemplate() {
        if (this.selectedTemplate > 0) {
            const selectedTemplateData: TemplateData[] = this.templateList
                .find((tl) => tl['ID'] === this.selectedTemplate)
                ['data'].filter((tl) =>
                    this.saveAssignData.map((item) => item.language_code).includes(tl.language_code)
                );
            selectedTemplateData.forEach((td) => {
                this.selectedValues[td.language_code] = {
                    translator: td.translator,
                    proofreader: td.proofreader,
                };
                this.assignLanguageTranslatorAndProofReader(td, 'translator', td.translator);
                this.assignLanguageTranslatorAndProofReader(td, 'proofreader', td.proofreader);
            });
        } else {
            this.selectTemplateError = true;
        }
    }

    deleteTemplate() {
        if (this.selectedTemplate > 0) {
            this.confirmationService.confirm({
                message: 'Are you sure that you want to delete the template?',
                header: 'Delete Confirmation',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.translationService.deleteData({ id: this.selectedTemplate }).subscribe((res) => {
                        if (res['status'] === 'OK') {
                            this.templateInitialise();
                        }
                    });
                },
            });
        } else {
            this.selectTemplateError = true;
        }
    }

    proofreaderSelectorHandler(language_data, $event) {
        this.assignLanguageTranslatorAndProofReader(language_data, 'proofreader', $event.value);
    }

    translatorSelectorHandler(language_data, $event) {
        this.assignLanguageTranslatorAndProofReader(language_data, 'translator', $event.value);
    }

    templateSelectHandler($event) {
        this.selectedTemplate = $event.value;
    }

    getInitialList() {
        this.userInfo = this.userService.getUser();
        this.subscription = this.translationService.getAssignWorkerDialog().subscribe((data) => {
            if (data && data !== this.projectData) {
                this.resetAll();
                this.projectData = data;
                this.displayAssignWorkerDialog = true;
                this.assignWorkerTableData = data['language_prop'];
                this.dueDate = new Date(data['pm_due_data']);
                this.enableProofRead = !data['proofread'];
                this.assignWorkerTableData.forEach((item) => {
                    this.selectedValues[item['language_code']] = {
                        translator: item['translator_id'],
                        proofreader: item['proofreader_id'],
                    };
                    this.assignLanguageTranslatorAndProofReader(item, 'translator', item['translator_id']);
                    this.assignLanguageTranslatorAndProofReader(item, 'proofreader', item['proofreader_id']);
                });
                this.reAssignFlag =
                    this.assignWorkerTableData.find((awtd) => awtd['translator_id'] > 0) === undefined ? false : true;
            } else if (data && data === this.projectData) {
                this.displayAssignWorkerDialog = true;
            }
        });
        this.translationService
            .getList('translation-member-data/translator-list', {
                translation_manager_id: this.userInfo.id,
            })
            .subscribe((res) => (this.translatorList = res['status'] === 'OK' ? res['data'] : []));

        this.translationService
            .getList('translation-member-data/proofread-list', {
                translation_manager_id: this.userInfo.id,
            })
            .subscribe((res) => (this.proofreaderList = res['status'] === 'OK' ? res['data'] : []));
    }
    templateInitialise() {
        this.translationService
            .getList('translation-manager-dashboard/template_data', {
                translation_manager_id: this.userInfo.id,
            })
            .subscribe((res) => (this.templateList = res['status'] === 'OK' ? res['data'] : []));
    }
    resetAll() {
        this.templateName = '';
        this.saveTemplate = false;
        this.allTranslatorAssigned = false;
        this.existTemplate = false;
        this.showAssignError = true;
        this.saveAssignData = [];
        this.saveTemplateData = [];
        this.selectedValues = {};
        this.selectTemplateError = false;
        this.reAssignFlag = false;
    }

    assignLanguageTranslatorAndProofReader(languageData, type, workerId) {
        let saveObject: IAssignData = <IAssignData>{};
        if (this.saveAssignData.length === 0) {
            saveObject.language_code = languageData['language_code'];
            saveObject.language_id = languageData['language_id'];
        } else {
            if (this.saveAssignData.find((item) => item.language_code === languageData['language_code'])) {
                saveObject =
                    this.saveAssignData[
                        this.saveAssignData.findIndex((item) => item.language_code === languageData['language_code'])
                    ];
            } else {
                saveObject.language_code = languageData['language_code'];
                saveObject.language_id = languageData['language_id'];
            }
        }
        if (type === 'translator') {
            saveObject.translator_email = this.translatorList.find((tli) => tli['id'] === workerId)?.['email'] || null;
            saveObject.translator_id = workerId || 0;
        } else {
            saveObject.proofreader_email =
                this.proofreaderList.find((pri) => pri['id'] === workerId)?.['email'] || null;
            saveObject.proofreader_id = workerId || 0;
        }
        if (this.saveAssignData.find((item) => item.language_code === languageData['language_code'])) {
            this.saveAssignData[
                this.saveAssignData.findIndex((item) => item.language_code === languageData['language_code'])
            ] = { ...saveObject };
        } else {
            this.saveAssignData.push({ ...saveObject });
        }
        if (
            this.assignWorkerTableData.length === this.saveAssignData.length &&
            this.saveAssignData.find((item) => item.translator_id === 0) === undefined
        ) {
            this.showAssignError = false;
        }
    }
}
