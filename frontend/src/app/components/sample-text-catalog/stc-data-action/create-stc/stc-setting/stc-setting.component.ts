import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { SampleTextCatalogService } from 'src/app/core/services/sample-text-catalog-service/sample-text-catalog.service';
import { StcActionService } from 'src/app/core/services/sample-text-catalog-service/stc-action.service';
import { iconBaseUrl } from '../../../../../shared/config/config';

@Component({
    selector: 'app-stc-setting',
    templateUrl: './stc-setting.component.html',
    styleUrls: ['./stc-setting.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class StcSettingComponent implements OnInit {
    baseURL: string = iconBaseUrl;
    menuHideShow = false;
    ref: object;
    subscription: Subscription;
    state: any;
    msgs: Message[] = [];

    @Output() editForm = new EventEmitter<{ flag: boolean; source: string }>();
    @Output() cancel: EventEmitter<any> = new EventEmitter();
    @Input() ifOtherBrand = true;
    @Input() stcByMP = true;
    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        public sampleTextCatalogService: SampleTextCatalogService,
        private objStcActionService: StcActionService,
        private eventBus: NgEventBus
    ) {}

    ngOnInit(): void {
        this.subscription = this.sampleTextCatalogService.getSTCState().subscribe((res) => {
            this.state = res;
        });
    }

    deleteSTC() {
        let usedProjectCount = 0;
        let stcText = '';
        if (this.state.structureSelectedRow.data?.used_project_count === undefined) {
            const selectedStcData = this.state.structureSelectedRow.children.find(
                (item) =>
                    item.data.Type === 'Stc' && item.data.stc_text === this.state.structureSelectedRow.data.context
            );
            if (selectedStcData) {
                usedProjectCount = selectedStcData.data.used_project_count;
                stcText = selectedStcData.data.stc_text;
            }
        } else {
            usedProjectCount = this.state.structureSelectedRow.data?.used_project_count;
            stcText = this.state.structureSelectedRow.data.stc_text;
        }
        let message = `Are you sure you want to delete the selected sample text "${stcText}"?`;
        if (usedProjectCount != 0) {
            message = `Are you sure you want to delete the selected sample text "${stcText}" as it is being used in other ${usedProjectCount} project?`;
        }
        this.confirmationService.confirm({
            message: message,
            header: 'Delete Sample Text',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.objStcActionService
                    .deleteSTCSampleText(`deletestc/delete_sample_text`, {
                        stc_master_id: this.state.structureSelectedRow.data.stc_id,
                    })
                    .subscribe({
                        next: (res: any) => {
                            if (res.status === 'OK') {
                                this.eventBus.cast('structure:delete', 'stc');
                                this.state.isGroupAction = 1;
                                this.sampleTextCatalogService.setSTCState(this.state);
                                this.messageService.add({
                                    severity: 'success',
                                    summary: `Selected sample text deleted successfully`,
                                });
                                setTimeout(() => {
                                    this.cancel.emit();
                                }, 1000);
                            }
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: `Error deleting selected sample text`,
                            });
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
    editStc() {
        if (this.sampleTextCatalogService?.selectedIdealTextShortFromData?.status === 'Done') {
            this.sampleTextCatalogService.itsDone = true;
        } else {
            this.sampleTextCatalogService.itsDone = false;
        }
        this.editForm.emit({ flag: false, source: 'update' });
    }
    changeStatus(status) {
        this.sampleTextCatalogService.changeStatus(status, this.messageService, 'byStcFrom');
    }
    openProjectRef() {
        this.eventBus.cast('stcSetting:showExternlProjectRef');
    }
}
