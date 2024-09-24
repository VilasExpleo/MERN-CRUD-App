import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { SampleTextCatalogService } from 'src/app/core/services/sample-text-catalog-service/sample-text-catalog.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { NgEventBus } from 'ng-event-bus';
import { MetaData } from 'ng-event-bus/lib/meta-data';
import { stcTextDesc } from 'src/app/shared/models/patterns';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Brand } from 'src/app/shared/models/brand';

@Component({
    selector: 'app-stc-group',
    templateUrl: './stc-group.component.html',
    styleUrls: ['./stc-group.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class StcGroupComponent implements OnInit {
    userInfo;
    createGroupForm: UntypedFormGroup;
    state;
    subscription: Subscription;
    buttonName = 'Create Group';
    isCreateGroupDisabled = true;
    isEditGroup = true;
    isClickedOnEditIcon = false;
    rootName: string;
    editView;
    brand_id: number;
    brand_name: string;
    items: MenuItem[] = [];
    isGroupNameAvailble = false;
    isGroupCreated = false;
    msgs: Message[] = [];
    sub: Subscription;
    groupFormIcon = 'pi-plus';
    @Output() setLayout: EventEmitter<any> = new EventEmitter();
    @Output() cancel: EventEmitter<any> = new EventEmitter();
    constructor(
        private sampleTextCatalogService: SampleTextCatalogService,
        private userService: UserService,
        private fb: UntypedFormBuilder,
        private ref: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private eventBus: NgEventBus
    ) {}

    ngOnInit(): void {
        this.sub = this.eventBus.on('group:edit').subscribe((data: MetaData) => {
            this.editView = true;
            this.buttonName = 'Save';
            this.groupFormIcon = 'pi-save';
            this.state = data.data.data;
            this.setView(
                this.state.structureSelectedRow.data.context,
                this.state.structureSelectedRow.data.Id,
                this.state.structureSelectedRow.data.sequence_order
            );
        });
        this.eventBus.on('group:create').subscribe((data: MetaData) => {
            this.buttonName = 'Create Group';
            this.groupFormIcon = 'pi-plus';
            this.state = data.data.data;
            this.setView();
        });
        this.eventBus.on('group:details').subscribe((data: MetaData) => {
            this.state = data.data.data;
            this.setView(
                this.state?.structureSelectedRow?.data?.context,
                this.state?.structureSelectedRow?.data?.Id,
                this.state?.structureSelectedRow?.data?.sequence_order
            );
        });

        this.userInfo = this.userService.getUser();
        this.initializeCreateGroupForm();
        this.createGroupForm.controls['brandName'].disable();
        this.brand_id = this.userService.getUser().brand_id;
        this.brand_name = this.userService.getUser().brand_name.trim();
    }
    checkGroupName(e) {
        if (this.state.structureSelectedRow && this.state?.parent[0]?.children?.length > 0) {
            this.isGroupNameAvailble = this.state.parent[0].children
                .filter((item) => item.data.Id !== this.state.structureSelectedRow.data.Id)
                .map((node) => node.data.context)
                .find((item) => e.target.value === item);
        } else {
            this.isGroupNameAvailble = this.state.treeData
                .filter((item) => item.data.Id !== this.state?.structureSelectedRow?.data?.Id)
                .map((node) => node.data.context)
                .find((item) => e.target.value === item);
        }
    }

    initializeCreateGroupForm() {
        this.createGroupForm = this.fb.group({
            brandName: this.userService.getUser().brand_name.trim(),
            groupName: ['', Validators.compose([Validators.required, Validators.pattern(stcTextDesc)])],
            brandId: this.userService.getUser().brand_id,
            editorId: this.userService.getUser().id,
            id: 0,
            sequenceOrder: 0,
        });
    }

    onSubmit() {
        if (this.createGroupForm.invalid) {
            return;
        } else {
            if (this.buttonName !== 'Save') {
                this.createGroup(this.createGroupForm.value);
                this.groupFormIcon = 'pi-plus';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Group created successfully',
                });
            } else {
                this.updateGroup(this.createGroupForm.value);
                this.groupFormIcon = 'pi-save';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Selected Group edited successfully',
                });
            }
        }
    }

    createGroup(formData: any) {
        let parentGroupId;
        let sequenceOrder;
        if (this.state.structureSelectedRow == undefined) {
            parentGroupId = 0;
            sequenceOrder = 1;
        } else {
            parentGroupId = this.state.structureSelectedRow.data.Id;
            sequenceOrder = this.state.structureSelectedRow.data.sequence_order;
        }

        const postObj = {
            group_name: formData.groupName,
            parent_group_id: parentGroupId,
            brand_id: formData.brandId,
            editor_id: formData.editorId,
            sequence_order: sequenceOrder,
        };

        this.sampleTextCatalogService.createGroup(postObj).subscribe((res: any) => {
            if (res.status === 'OK') {
                this.eventBus.cast('structure:create', 'group');
                this.createGroupForm.controls['groupName'].setValue('');
                this.state.isGroupAction = 1;
                this.sampleTextCatalogService.setSTCState(this.state);
                this.isGroupCreated = true;
                this.cancelPanel();
            }
        });
    }

    updateGroup(formData: any) {
        this.isEditGroup = true;
        const postObj = {
            group_id: formData.id,
            brand_id: this.userService.getUser().brand_id,
            editor_id: this.userService.getUser().id,
            group_name: formData.groupName,
            sequence_order: formData.sequenceOrder,
        };
        this.sampleTextCatalogService.editGroup(postObj).subscribe((res: any) => {
            if (res.status === 'OK') {
                this.state.structureSelectedRow.data.context = formData.groupName;
                this.createGroupForm.reset();
                this.createGroupForm.controls['brandName'].setValue(this.userService.getUser().brand_name.trim());
                this.state.isGroupAction = 1;
                this.sampleTextCatalogService.setSTCState(this.state);
                this.isGroupCreated = true;
                this.cancelPanel();
            }
        });
    }

    editGroupEnable() {
        const data = { title: 'Edit Group', data: this.state, contentId: 'group' };
        this.state.title = 'editgroup';
        this.eventBus.cast('group:edit', data);
        this.setLayout.emit(data);
    }
    getBrandLogo(num) {
        return Brand.getBrand(num).getName();
        // Refactored: return BrandEnum[num];
    }

    deleteGroup() {
        if (
            this.state.parent[0].data.brand_id !== undefined &&
            this.state.parent[0].data.brand_id === this.userInfo['brand_id']
        ) {
            this.confirmationService.confirm({
                message: `Are you sure you want to delete the selected Group "${this.state.structureSelectedRow.data.context}"?`,
                header: 'Delete Group',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.sampleTextCatalogService
                        .deleteSTCGroup(`deletestc/delete_group`, {
                            group_id: this.state.structureSelectedRow.data.Id,
                        })
                        .subscribe({
                            next: (res: any) => {
                                if (res.status === 'OK') {
                                    this.eventBus.cast('structure:delete', 'group');
                                    this.state.isGroupAction = 1;
                                    this.sampleTextCatalogService.setSTCState(this.state);

                                    this.messageService.add({
                                        severity: 'success',
                                        summary: `Selected Group deleted successfully`,
                                    });
                                    setTimeout(() => {
                                        this.cancel.emit();
                                    }, 1000);
                                }
                            },
                            error: () => {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: `Error deleting selected Group`,
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
    }
    cancelPanel() {
        let data = {};
        if (!this.state.structureSelectedRow && !this.isGroupCreated) {
            this.cancel.emit();
        } else {
            data = {
                title: 'Details of Group',
                data: this.state,
                contentId: 'group',
            };
            this.state.title = 'detailsgroup';
            this.eventBus.cast('group:details', data);
        }
        this.isGroupCreated = false;
        this.setLayout.emit(data);
    }
    getBrand(data) {
        if (data.structureSelectedRow !== undefined && data.structureSelectedRow.data !== undefined) {
            this.brand_id = data.structureSelectedRow.data.brand_id;
            this.brand_name = this.getBrandLogo(this.brand_id);
        } else {
            this.brand_id = this.userService.getUser().brand_id;
            this.brand_name = this.getBrandLogo(this.brand_id);
        }
    }
    setBreadCrumb(breadCrumb) {
        this.items = breadCrumb?.length > 0 ? breadCrumb : [{ label: '[Root]' }];
    }
    setView(groupName = '', id = 0, sequenceOrder = 0) {
        this.setBreadCrumb(this.state.breadcrumbItems);
        this.getBrand(this.state);
        this.isCreateGroupDisabled = this.brand_id !== this.userInfo.brand_id;
        this.isGroupNameAvailble = false;
        this.createGroupForm.patchValue({
            groupName: groupName,
            brandName: this.brand_name,
            brandId: this.brand_id,
            editorId: this.userService.getUser().id,
            id: id,
            sequenceOrder: sequenceOrder,
            isGroupNameAvailble: this.isGroupNameAvailble,
        });
    }
}
