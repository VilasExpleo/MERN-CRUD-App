import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    UntypedFormControl,
    UntypedFormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subscription, of } from 'rxjs';
import { ProjectManagerService } from 'src/app/core/services/project-manager-service/project-manager.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { IAssignData, ISaveAssignTranslationManager, ITemplateData } from 'src/app/shared/models/project-manager';
import { UpdateTranslationRequest } from '../../dashboard/project-manager-dashboard/components/dialogs/complete-translation-request/complete-translation-request.model';
@Component({
    selector: 'app-assign-translation-manager',
    templateUrl: './assign-translation-manager.component.html',
    styleUrls: ['./assign-translation-manager.component.scss'],
    providers: [ConfirmationService],
})
export class AssignTranslationManagerComponent implements OnInit, OnDestroy {
    @Output()
    saveDataEvent: EventEmitter<UpdateTranslationRequest> = new EventEmitter<UpdateTranslationRequest>();

    form: UntypedFormGroup;
    subscription: Subscription;
    projectData: any;
    displayAssignTranslationManagerDialog = false;
    showAssignError = true;
    reasonEnableFlag = false;
    requireError = false;

    error!: string;
    loading = false;
    dueDate: Date;
    dueDatePM: Date;
    maxDate: Date;
    minDate: Date = new Date();
    selectedTemplate = 0;
    selectTemplateError = false;

    assignTranslationManagerTableData: string[] = [];
    translationManagerList: string[] = [];

    templateName = '';

    saveAssignData: IAssignData[] = [];
    assignData: IAssignData = <IAssignData>{};

    templateList: string[] = [];
    templateData: ITemplateData = <ITemplateData>{};
    existTemplate = false;
    saveTemplate = false;
    selectedValues: any = [];
    templateRequire = false;
    templateNameSubscribe: Subscription;

    reasonRequire = false;
    userInfo: any;
    reAssignFlag = false;
    reasonsubscribe: Subscription;

    constructor(
        private projectManagerService: ProjectManagerService,
        private userService: UserService,
        private datePipe: DatePipe,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.getInitialList();
        this.templateInitialise();
        this.form = new UntypedFormGroup({
            tname: new UntypedFormControl(''),
            reason: new UntypedFormControl('', Validators.required),
        });
    }

    isTemplateNameNotInList(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            let bReturn = true;
            if (this.templateList?.some((tn) => tn['layout_name'] === control.value)) {
                bReturn = false;
                this.existTemplate = true;
                this.error = `Template name "${control.value}" is already existing. If you continue with Assign button it'll override existing template.`;
            } else {
                this.existTemplate = false;
                this.error = '';
            }
            if (control.value !== '') this.templateRequire = false;
            else this.templateRequire = true;
            const err: ValidationErrors = { exists: true };
            return bReturn ? of(null) : of(err);
        };
    }

    submitData() {
        const payload = <ISaveAssignTranslationManager>{};

        payload.project_id = this.projectData.project_id;
        payload.version_id = this.projectData.version_id;
        payload.project_manager_id = this.userInfo.id;
        payload.project_manager_email = this.userInfo.email;
        payload.translation_request_id = this.projectData.ID;
        payload.due_date = this.datePipe.transform(this.dueDate, 'yyyy-MM-dd');
        payload.reason = this.form.controls['reason'].value;
        payload.assignment = this.saveAssignData;
        const templatePayload = <ITemplateData>{};
        if (this.saveTemplate) {
            templatePayload.project_manager_id = this.userInfo.id;
            templatePayload.layout_name = this.form.controls['tname'].value;
            templatePayload.default_layout_selection = 0;
            if (this.existTemplate) {
                templatePayload.id = this.templateList.find(
                    (item) => item['layout_name'] === this.form.controls['tname']?.value
                )['id'];
            }
            templatePayload.data = JSON.stringify(this.templateData.data);
        }

        this.projectManagerService.saveData(payload).subscribe((res) => {
            if (res['status'] === 'OK') {
                this.displayAssignTranslationManagerDialog = false;
                this.saveDataEvent.emit({ isAssigned: true, dueDatePM: this.dueDate });
            }
        });
        if (this.existTemplate && this.saveTemplate) {
            this.projectManagerService.updateTemplateData(templatePayload).subscribe((res) => {
                if (res['status'] === 'OK') {
                    this.templateInitialise();
                }
            });
        } else if (!this.existTemplate && this.saveTemplate) {
            this.projectManagerService.saveTemplateData(templatePayload).subscribe((res) => {
                if (res['status'] === 'OK') {
                    this.templateInitialise();
                }
            });
        }
    }

    templateSave($event) {
        if ($event.checked) {
            this.form.controls['tname'].setAsyncValidators([this.isTemplateNameNotInList()]);
            this.templateRequire = true;
            const tempTemplateData = {};
            this.saveAssignData.forEach((item) => {
                tempTemplateData[item.language_code] = item.translation_manager_id;
            });
            this.templateData.data = [];
            this.templateData.data.push(tempTemplateData);
        } else {
            this.form.controls['tname'].clearAsyncValidators();
            this.templateRequire = false;
        }
    }

    cancelDialog() {
        this.displayAssignTranslationManagerDialog = false;
        this.projectManagerService.clearAssignTransalationManagerAssignDialog();
    }

    useTemplate() {
        this.saveAssignData = [];
        this.showAssignError = true;
        if (this.selectedTemplate > 0) {
            const selectedTemplateData = JSON.parse(
                this.templateList.find((tl) => tl['id'] === this.selectedTemplate)['data']
            );
            this.assignTranslationManagerTableData.forEach((item) => {
                this.selectedValues[item['language_code']] = selectedTemplateData[0][item['language_code']];
                this.assignLanguageTranslationManager(item, selectedTemplateData[0][item['language_code']]);
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
                    this.projectManagerService.deleteTemplateData({ id: this.selectedTemplate }).subscribe((res) => {
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

    translationManagerSelectorHandler(language_data, $event) {
        this.assignLanguageTranslationManager(language_data, $event.value);
    }

    templateSelectHandler($event) {
        this.selectedTemplate = $event.value;
    }

    getInitialList() {
        this.userInfo = this.userService.getUser();
        this.subscription = this.projectManagerService.getAssignTransalationManagerAssignDialog().subscribe((data) => {
            if (data && data !== this.projectData) {
                this.resetAll();
                this.projectData = data;
                this.displayAssignTranslationManagerDialog = true;
                this.assignTranslationManagerTableData = data['language_prop'];
                this.dueDate = new Date(data['editor_due_date']);
                this.maxDate = new Date(data['editor_due_date']);
                this.assignTranslationManagerTableData.forEach((item) => {
                    this.selectedValues[item['language_code']] = item['tmanager_id'];
                    this.assignLanguageTranslationManager(item, item['tmanager_id']);
                });
                this.reAssignFlag =
                    this.assignTranslationManagerTableData.find((awtd) => awtd['tmanager_id'] > 0) === undefined
                        ? false
                        : true;
                if (data['reason'] !== '') {
                    this.reasonEnableFlag = true;
                    this.form.controls['reason'].setValue(data['reason']);
                    this.dueDatePM = new Date(this.assignTranslationManagerTableData[0]['pm_due_date']);
                }
                if (this.reAssignFlag) this.form.controls['reason'].disable();
            } else if (data && data === this.projectData) {
                this.displayAssignTranslationManagerDialog = true;
            }
        });
        this.projectManagerService
            .getList('translation-member-data/translation-manager-list')
            .subscribe((res) => (this.translationManagerList = res['status'] === 'OK' ? res['data'] : []));
    }

    templateInitialise() {
        this.projectManagerService
            .getTemplateList({ project_manager_id: this.userInfo.id })
            .subscribe((res) => (this.templateList = res['status'] === 'OK' ? res['data']['data'] : []));
    }

    resetAll() {
        this.templateName = '';
        this.saveTemplate = false;
        this.existTemplate = false;
        this.showAssignError = true;
        this.saveAssignData = [];
        this.selectedValues = [];
        this.selectTemplateError = false;
        this.reAssignFlag = false;
        this.reasonEnableFlag = false;
    }

    assignLanguageTranslationManager(languageData, transaltionManagerId) {
        let saveObject: IAssignData = <IAssignData>{};
        let existSaveData = false;
        if (this.saveAssignData.find((item) => item.language_code === languageData['language_code'])) {
            saveObject =
                this.saveAssignData[
                    this.saveAssignData.findIndex((item) => item.language_code === languageData['language_code'])
                ];
            existSaveData = true;
        } else {
            saveObject.language_code = languageData['language_code'];
            saveObject.language_id = languageData['language_id'];
        }
        saveObject.translation_manager_email =
            this.translationManagerList.find((tli) => tli['id'] === transaltionManagerId)?.['email'] || null;
        saveObject.translation_manager_id = transaltionManagerId || 0;

        if (existSaveData) {
            this.saveAssignData[
                this.saveAssignData.findIndex((item) => item.language_code === languageData['language_code'])
            ] = { ...saveObject };
        } else {
            this.saveAssignData.push({ ...saveObject });
        }
        if (
            this.assignTranslationManagerTableData.length === this.saveAssignData.length &&
            this.saveAssignData.find((item) => item.translation_manager_id === 0) === undefined
        ) {
            this.showAssignError = false;
        }
    }
    dueDatePrepond() {
        if (this.dueDate < this.maxDate) {
            this.reasonEnableFlag = true;
            this.form.controls['reason'].enable();
            this.reasonRequire = true;
            this.form.controls['reason'].addValidators([Validators.required]);
            this.form.controls['reason'].setValue('');
            this.reasonsubscribe = this.form.get('reason').statusChanges.subscribe((status) => {
                if (status === 'VALID') this.reasonRequire = false;
                else this.reasonRequire = true;
            });
        } else {
            this.reasonEnableFlag = false;
            this.reasonRequire = false;
            this.form.controls['reason'].clearValidators();
            this.reasonsubscribe.unsubscribe();
        }
        if (this.reAssignFlag) this.form.controls['reason'].disable();
    }

    ngOnDestroy() {
        if (this.dueDate < this.maxDate) {
            this.reasonsubscribe.unsubscribe();
        }
        this.subscription.unsubscribe();
    }
}
