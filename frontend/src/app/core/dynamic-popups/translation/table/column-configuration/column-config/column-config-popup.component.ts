import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NgEventBus } from 'ng-event-bus';

import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { map } from 'rxjs/internal/operators/map';
import { TableService } from 'src/app/core/services/project/project-translation/table.service';
import { TranslateDataService } from 'src/app/core/services/translatedata/translate-data.service';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'column-config-popup',
    templateUrl: './column-config-popup.component.html',
    styleUrls: ['./column-config-popup.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class ColumnConfigPopupComponent implements OnInit {
    availableColumns = [];
    selectedColumns = [];
    initialSelectedColumns = [];
    translateLanguages = [];
    isAttrSelectDisabled = true;
    isUpdateDisabled = true;
    colConfigForm: UntypedFormGroup;
    newLayoutForm: UntypedFormGroup;
    configurationForm: UntypedFormGroup;
    langAttribute = [];
    showNameLayout = false;
    existingLayouts = [];
    selectedLayout;
    msgs: Message[];
    errMsg = '';
    selectedLanguages = [];
    //---------------Temp projectTabelColumns for internal functionlity
    private tempProjectTabelColumns = [];
    constructor(
        private translateDataService: TranslateDataService,
        private confirmationService: ConfirmationService,
        private config: DynamicDialogConfig,
        private ref: DynamicDialogRef,
        public objTabelService: TableService,
        public eventBus: NgEventBus,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        // Column configuration language filter form initialization
        this.colConfigForm = new UntypedFormGroup({
            languageDropDown: new UntypedFormControl(''),
            LangAttributes: new UntypedFormControl(''),
        });

        // New layout form initialization
        this.newLayoutForm = new UntypedFormGroup({
            layoutName: new UntypedFormControl(''),
        });

        this.configurationForm = new UntypedFormGroup({
            configuration: new UntypedFormControl(''),
        });

        this.loadLangAttrDropdown();
        this.loadColumnConfigDataFromTabelView();
        if (this.config.data.selectedLayout) {
            this.layoutWiseConfigColumns(this.config.data.selectedLayout?.data);
            this.bindLayoutDataForPickListControl();
        }
        this.getExsistingLayout();
        this.eventBus.on('columnConfig:afterConfigChange').subscribe(() => {
            this.selectedColumns = this.objTabelService?.header?.projectTabelColumns?.filter((item) => item.display);
            this.availableColumns = this.objTabelService?.header?.projectTabelColumns?.filter((item) => !item.display);
        });
    }

    // add laguage in table
    getDropdownVal(event) {
        if (!event.value.length) {
            if (this.isAttrSelectDisabled === false) this.isAttrSelectDisabled = true;
        } else {
            if (this.colConfigForm.get('LangAttributes').value === '')
                this.colConfigForm.get('LangAttributes').setValue(this.langAttribute);
            this.isAttrSelectDisabled = false;
        }
        const temptranslateLanguages = [...this.translateLanguages];
        if (event?.value?.length > 0) {
            event?.value.forEach((element, index) => {
                temptranslateLanguages.splice(index, 1);
            });
            temptranslateLanguages.forEach((element) => {
                this.afterCheckUnCheck(element.header, false);
            });
        }
        if (event?.value?.length === 0) {
            this.afterCheckUnCheck(event.itemValue.header, false);
        }
    }

    updateLangFilters() {
        const langAndAttributeWiseSelectedColumns = this.tempProjectTabelColumns.filter(
            (item) =>
                this.colConfigForm.get('languageDropDown')?.value.find((lang) => lang.header === item.langCode) &&
                this.colConfigForm.get('LangAttributes')?.value.find((att) => att.header === item.field)
        );
        if (langAndAttributeWiseSelectedColumns) {
            this.objTabelService.header.projectTabelColumns = this.tempProjectTabelColumns?.map((item) => {
                if (item.langCode !== '') {
                    item.display = langAndAttributeWiseSelectedColumns?.some(
                        (sc) => sc.field === item.field && sc.langCode === item.langCode
                    );
                }
                return item;
            });
        }

        this.selectedColumns = this.tempProjectTabelColumns.filter((item) => item.display);
        this.eventBus.cast('columnConfig:afterConfigChange', '');
    }
    // Change event for layout Configuration
    onChange(event) {
        if (event.value.data) {
            this.layoutWiseConfigColumns(event.value.data);
            this.bindLayoutDataForPickListControl();
        }
    }
    bindLayoutDataForPickListControl() {
        this.selectedColumns = this.tempProjectTabelColumns.filter((item) => item.display);
        this.availableColumns = this.tempProjectTabelColumns.filter((item) => !item.display);

        const uniLang = Array.from(
            new Set(
                this.tempProjectTabelColumns
                    .filter((item) => item.display && item.langCode != '')
                    .map((item) => item.langCode)
            )
        );
        if (uniLang.length > 0) {
            uniLang.forEach((element) => {
                this.selectedLanguages.push(this.translateLanguages.find((temp) => temp.header === element));
            });
        }
        this.colConfigForm.get('languageDropDown').setValue(this.selectedLanguages);
        const uniAttribute = Array.from(
            new Set(
                this.tempProjectTabelColumns
                    ?.filter((item) => item?.display && item?.langCode != '')
                    .map((item) => item?.field)
            )
        ).map((item) => ({ header: item }));
        if (uniAttribute.length > 0) {
            this.isAttrSelectDisabled = false;
        }
        this.colConfigForm.get('LangAttributes').setValue(uniAttribute);
    }
    // fetch available config layouts
    getConfigLayouts() {
        return this.translateDataService
            .getTranslateTableLayout(this.config.data.userId)
            .pipe(map((response) => response['data']));
    }

    //Update Layout Configuration

    updateConfigLayout() {
        const dataUpdate = {
            user_id: this.config.data.userId,
            project_id: this.config.data.projectId,
            layout_name: this.selectedLayout?.layout_name,
            data: JSON.stringify(this.selectedColumns),
        };
        this.translateDataService.updateTranslateTableLayout(dataUpdate).subscribe((res: any) => {
            if (res.status == 'OK') {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
                this.tempProjectTabelColumns.forEach((item) => {
                    this.columnHideShow(item, '1', item.display);
                });

                this.eventBus.cast('afterSaveConfigUpdate', this.ref);
                // TO DO: need to notify user the success
            } else {
                // TO DO: need to notify user the error
            }
        });
    }

    // //Delete Layout Configuration
    deleteTableLayout() {
        const dataPayload = {
            user_id: this.config.data.userId,
            layout_name: this.selectedLayout?.layout_name,
        };

        this.confirmationService.confirm({
            message: 'Are you sure want to delete the selected configuration ?',
            header: 'Delete Configuration',
            icon: 'pi pi-exclamation-triangle',
            key: 'deleteProject',
            accept: () => {
                this.translateDataService.deleteLayoutDate('configuration/delete', dataPayload).subscribe({
                    next: (response) => {
                        if (response['status'] === 'OK') {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: response['message'],
                            });
                            this.getConfigLayouts().subscribe({
                                next: (res) => {
                                    if (res.length) {
                                        this.existingLayouts = res;
                                        const selectedLayout = res.filter(
                                            (item) => item.default_layout_selection === true
                                        )[0];
                                        this.selectedLayout = selectedLayout;
                                        this.configurationForm.patchValue({ configuration: selectedLayout });
                                        this.layoutWiseUpdateColumnHideShow();
                                    }
                                },
                                error: (err) => {
                                    throw new Error(`Response is not ok ${err}`);
                                },
                            });
                        }
                    },
                });
            },
            reject: () => {
                this.msgs = [
                    {
                        severity: 'info',
                        summary: 'Rejected',
                        detail: 'You have rejected',
                    },
                ];
            },
        });
    }

    //Set Configuration layout as Default
    setDefaultConfigLayout() {
        const payloadLayout = {
            project_id: this.config.data.projectId,
            user_id: this.config.data.userId,
            layout_name: this.selectedLayout?.layout_name,
            default_layout_selection: 1,
        };
        this.translateDataService.postTranslateTableLayout('configuration/layout', payloadLayout).subscribe({
            next: (res) => {
                if (res['status'] === 'OK') {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
                    this.existingLayouts.forEach((item) => (item.default_layout_selection = false));
                    this.existingLayouts.find(
                        (item) => item.layout_name === this.selectedLayout?.layout_name
                    ).default_layout_selection = true;
                    this.selectedColumns = JSON.parse(
                        this.existingLayouts.filter((item) => item.default_layout_selection === true)[0].data
                    );
                    this.objTabelService.conditionWiseHeaderHideShow(
                        this.selectedColumns,
                        this.tempProjectTabelColumns
                    );
                } else {
                    // TO DO: need to implement kind of notifying user --> the occured error
                }
            },
            error: (err) => {
                throw new Error(`Response is not ok ${err}`);
            },
        });
    }
    // //Save Configuration
    postNewLayoutData() {
        if (!this.selectedColumns.length) {
            // TO DO: disable buttons save, and close popup to avoid empty selected columns
        }
        if (this.newLayoutForm.value.layoutName != '') {
            const payloadLayout = {
                project_id: this.config.data.projectId,
                user_id: this.config.data.userId,
                layout_name: this.newLayoutForm.value.layoutName,
                data: JSON.stringify(this.selectedColumns),
            };
            const payload = {
                user_id: this.config.data.userId,
                layout_name: this.newLayoutForm.value.layoutName,
            };

            this.translateDataService
                .postTranslateTableLayout('configuration/uniquelayout', payload)
                .subscribe((res: any) => {
                    if (res.status === 'NOK') {
                        this.translateDataService
                            .postTranslateTableLayout('configuration/create', payloadLayout)
                            .subscribe(() => {
                                this.newLayoutForm.patchValue({
                                    layoutName: '',
                                });
                                this.getConfigLayouts().subscribe({
                                    next: (response) => {
                                        if (response) {
                                            this.existingLayouts = response;
                                            // TO DO: need to decouple from the new layout popup - to be on done save button click
                                            this.selectedLayout = response.filter(
                                                (item) => item.default_layout_selection === true
                                            )[0];
                                            this.selectedColumns = JSON.parse(
                                                response.filter((item) => item.default_layout_selection === true)[0]
                                                    .data
                                            );
                                        }
                                    },
                                    error: (err) => {
                                        throw new Error(`Response is not ok ${err}`);
                                    },
                                });
                            });
                        this.errMsg = '';
                        this.showNameLayout = false;
                    } else {
                        this.errMsg = res.message;
                        this.showNameLayout = true;
                    }
                });
        }
    }

    closeConfig() {
        this.ref.close();
    }

    saveConfig() {
        this.tempProjectTabelColumns.forEach((item) => {
            this.columnHideShow(item, '1', item.display);
        });
        this.ref.close({
            selectedColumns: this.selectedColumns,
            selectedLayout: this.selectedLayout,
            existingLayouts: this.existingLayouts,
            availableColumns: this.availableColumns,
        });
    }

    onMoveToTarget(e) {
        e.items.forEach((item) => {
            this.columnHideShow(item, '0', true);
        });
    }
    onMoveToSource(e) {
        e.items.forEach((item) => {
            this.columnHideShow(item, '0', false);
        });
    }
    onMoveAllToTarget(e) {
        e.items.forEach((item) => {
            this.columnHideShow(item, '0', true);
        });
        this.colConfigForm.get('languageDropDown').setValue(this.selectedLanguages);
        this.colConfigForm.get('LangAttributes').setValue(this.langAttribute);
    }
    onMoveAllToSource(e) {
        e.items.forEach((item) => {
            this.columnHideShow(item, '0', false);
        });
        this.colConfigForm.get('languageDropDown').setValue('');
        this.colConfigForm.get('LangAttributes').setValue('');
    }
    columnHideShow(currentField, flag, displayFlag) {
        if (flag === '0') {
            this.tempProjectTabelColumns.find(
                (x) => x.field === currentField.field && x.langCode === currentField.langCode
            ).display = displayFlag;
        } else {
            this.objTabelService.header.projectTabelColumns.find(
                (x) => x.field === currentField.field && x.langCode === currentField.langCode
            ).display = currentField.display;
        }
    }
    afterCheckUnCheck(slectedLang, displayFlag) {
        this.tempProjectTabelColumns
            .filter((item) => item.langCode === slectedLang)
            .forEach((item) => (item.display = displayFlag));
        this.selectedColumns = this.tempProjectTabelColumns.filter((item) => item.display);
    }
    loadLangAttrDropdown() {
        //language attribute initialization - Static for now
        this.langAttribute = [
            { header: 'Text' },
            { header: 'State' },
            { header: 'User' },
            { header: 'Last change' },
            { header: 'Quality Status' },
            { header: 'Locked' },
            { header: 'Proofread Status' },
            { header: 'Proofread Comment' },
            { header: 'Review Status' },
            { header: 'Review Comment' },
            { header: 'ScreenReview Status' },
            { header: 'ScreenReview Comment' },
            { header: 'Labels' },
        ];
    }
    // Get the data from the table component via Dialog config/service
    loadColumnConfigDataFromTabelView() {
        if (this.config.data.availableColumns !== undefined) {
            this.availableColumns = this.config.data.availableColumns;
        }
        if (this.config.data.selectedColumns !== undefined) {
            this.selectedColumns = this.config.data.selectedColumns;
        }
        if (this.config.data.selectedColumns !== undefined) {
            this.initialSelectedColumns = this.config.data.selectedColumns.slice();
        }
        if (this.config.data.translateLanguages !== undefined) {
            this.translateLanguages = this.config.data.translateLanguages;
        }
        this.tempProjectTabelColumns = this.objTabelService?.header?.projectTabelColumns.map((item) => ({
            ...item,
        }));
    }
    // Get existing user config layouts
    getExsistingLayout() {
        this.getConfigLayouts().subscribe({
            next: (res) => {
                if (res.length) {
                    this.existingLayouts = res;
                } else {
                    // push the default layout to existing layouts
                    this.existingLayouts = [...this.existingLayouts, this.selectedLayout];
                    // Save new default layout in the backend and set as default
                    const payloadLayout = {
                        project_id: this.config.data.projectId,
                        user_id: this.config.data.userId,
                        layout_name: this.selectedLayout?.layout_name,
                        data: JSON.stringify(this.selectedColumns),
                    };
                    const payload = {
                        user_id: this.config.data.userId,
                        layout_name: this.selectedLayout.layout_name,
                    };

                    this.translateDataService
                        .postTranslateTableLayout('configuration/uniquelayout', payload)
                        .subscribe((output: any) => {
                            if (output.status === 'NOK') {
                                this.translateDataService
                                    .postTranslateTableLayout('configuration/create', payloadLayout)
                                    .subscribe((data: any) => {
                                        if (data.status === 'OK') {
                                            const payloadDefaultLayout = {
                                                project_id: this.config.data.projectId,
                                                user_id: this.config.data.userId,
                                                layout_name: this.selectedLayout.layout_name,
                                                default_layout_selection: 1,
                                            };
                                            this.translateDataService
                                                .postTranslateTableLayout('configuration/layout', payloadDefaultLayout)
                                                .subscribe({
                                                    next: (result) => {
                                                        if (result['status'] === 'OK') {
                                                            // TO DO - Notify the user
                                                        }
                                                    },
                                                    error: (err) => {
                                                        throw new Error(`Response is not ok ${err}`);
                                                    },
                                                });
                                        }
                                    });
                            } else {
                                this.errMsg = output.message;
                                this.showNameLayout = true;
                            }
                        });
                }
                if (this.config?.data?.selectedLayout) {
                    this.selectedLayout = this.config.data.selectedLayout;
                    this.layoutWiseUpdateColumnHideShow();
                } else {
                    if (this.existingLayouts.length > 0) {
                        this.selectedLayout = res.find((item) => item.default_layout_selection === true);
                        this.layoutWiseUpdateColumnHideShow();
                    }
                }
            },
            error: (err) => {
                throw new Error(`Response is not ok ${err}`);
            },
        });
    }
    layoutWiseUpdateColumnHideShow() {
        const layoutDataUpdated = JSON.parse(this.selectedLayout?.data);
        layoutDataUpdated?.map((item) => (item['langCode'] = !item['langCode'] ? '' : item['langCode']));
        this.objTabelService.conditionWiseHeaderHideShow(
            layoutDataUpdated,
            this.objTabelService.header.projectTabelColumns
        );
        this.selectedColumns = this.objTabelService.header.projectTabelColumns.filter((item) => item.display);
        this.availableColumns = this.objTabelService.header.projectTabelColumns.filter((item) => !item.display);
    }

    private layoutWiseConfigColumns(selectedLayout: string) {
        const data = JSON.parse(selectedLayout);
        this.objTabelService.conditionWiseHeaderHideShow(data, this.tempProjectTabelColumns);
        this.selectedLanguages = [];
    }
}
