import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { MappingService } from 'src/app/core/services/mapping/mapping.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
    selector: 'app-stc-details',
    templateUrl: './stc-details.component.html',
    providers: [MessageService],
})
export class StcDetailsComponent implements OnInit {
    constructor(
        private eventBus: NgEventBus,
        private ref: DynamicDialogRef,
        private objMappingService: MappingService,
        private userService: UserService,
        private refChangeDetect: ChangeDetectorRef,
        private config: DynamicDialogConfig,
        private messageService: MessageService
    ) {}
    stcDetails;
    private selectedRow;
    private selectedTransataeRow;
    ifRowNotSelect = false;
    ngOnInit(): void {
        this.stcDetails = this.config?.data?.stcDetails;
    }
    cancel(): void {
        this.ref.close();
    }
    rowDbClick(currentRow): void {
        this.stcDetails.map((row) => (row.selected = false));
        currentRow.selected = true;
        this.selectedRow = currentRow;
        this.ifRowNotSelect = false;
    }
    Ok() {
        if (!this.stcDetails.find((item) => item.selected)) {
            this.ifRowNotSelect = true;
        } else {
            this.ifRowNotSelect = false;
            this.eventBus.cast('stc:currentRow', this.selectedRow);
            this.updateMapping();
        }
    }

    updateMapping() {
        const paylod = {
            project_id: this.config?.data?.projectId,
            version_id: this.config?.data?.versionId,
            editor_id: this.userService?.getUser()?.id,
            textnode_id: this.config?.data?.TextNodeId,
            variant_id: this.config?.data?.variantId,
            array_item_index: this.config?.data?.arrayItemIndex,
            stc_master_id: this.config?.data?.stcId,
            textnode_language_id: this.config?.data?.languageId,
            stc_shortform_id: this.selectedRow?.id,
            flag: this.selectedRow?.Forms === 'Ideal Text' ? 'update_mapping' : 'update_shortform',
        };
        if (paylod) {
            this.objMappingService
                .saveMappingData(`project-mapping/update-mapping-data`, paylod)
                .pipe(catchError((error) => of(error)))
                .subscribe((response) => {
                    if (response) {
                        if (response['status'] === 'Ok') {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: response['message'],
                            });
                            const obj: any = { data: this.selectedRow?.Text, Map: 'Yes' };
                            this.eventBus.cast('stcMapping:currentRowAfterMap', obj);
                            this.cancel();
                        } else {
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Warning',
                                detail: response['message'],
                            });
                        }
                    }
                });
        }
    }
}
