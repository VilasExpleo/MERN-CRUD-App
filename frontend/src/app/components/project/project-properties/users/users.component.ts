import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, catchError, of } from 'rxjs';
import { ProjectPropertiesService } from 'src/app/core/services/project/project-properties/project-properties.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { AssignUserModel } from 'src/app/shared/components/assign-user/assign-user.model';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { BrandModel } from 'src/app/shared/models/project/user-request.model';
import { UserResponseModel } from 'src/app/shared/models/project/user-response.model';
@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    providers: [ConfirmationService],
})
export class UsersComponent implements OnInit {
    projectManagers: AssignUserModel[];
    brand: string;
    isMapDone = false;
    state: any;
    usersSettingForm: FormGroup;
    usersSetting: Subscription;
    submitBtn = true;
    readOnlyUsers: UserResponseModel[] = [];
    selectedReadOnlyUsers: UserResponseModel[] = [];
    selectedReadOnlyUserIds: number[] = [];
    showConfirmation = false;
    isRawProject = false;
    constructor(
        private readonly translationRequestService: TranslationRequestService,
        private readonly projectPropertiesService: ProjectPropertiesService,
        private readonly messageService: MessageService,
        private readonly ref: DynamicDialogRef,
        private readonly fb: FormBuilder,
        private readonly projectService: ProjectService,
        private readonly userService: UserService
    ) {}

    ngOnInit(): void {
        this.isRawProject = this.projectPropertiesService.projectType === 'raw' ?? true;
        this.initializeForm();
        this.setProjectManagers();
        this.setReadOnlyUsers();
    }

    submitUserForm(): void {
        const selectedManager = this.usersSettingForm.value.selectedManager;
        if (selectedManager?.id) {
            this.state.properties.project_properties.project_manager_id = selectedManager.id;
            this.state.properties.project_properties.project_manager_email = selectedManager.email;
        }
        this.handleReadOnlyUsersState();
        this.updateProjectProperties();
    }

    closePropertiesDialogOnCancel(): void {
        if (!this.usersSettingForm.valid) {
            this.showConfirmation = true;
        } else {
            this.showConfirmation = false;
            this.ref.close();
        }
    }

    delete(users: UserResponseModel): void {
        this.selectedReadOnlyUsers = this.selectedReadOnlyUsers.filter(
            (user: UserResponseModel) => user.id !== users.id
        );
        this.selectedReadOnlyUserIds = this.selectedReadOnlyUsers.map((user: UserResponseModel) => user.id) ?? [];
        this.setEmptyForUser();
        this.handleReadOnlyUsersState();
    }

    addUserAsReadOnly(): void {
        const userId = this.usersSettingForm.get('users').value;
        if (!this.isUserIdExists(userId)) {
            this.selectedReadOnlyUsers.push(this.readOnlyUsers.find((ele) => ele.id === userId));
            this.selectedReadOnlyUserIds.push(userId);
        }
        this.setEmptyForUser();
        this.handleReadOnlyUsersState();
    }

    onAccept(): void {
        this.showConfirmation = false;
        this.ref.close();
    }

    onReject(): void {
        this.showConfirmation = false;
    }

    private setReadOnlyUsers(): void {
        const payload: BrandModel = { brand: this.getBrand() };
        this.projectService
            .getReadOnlyUsers('translation-member-data/read-only-users', payload)
            .subscribe((users: UserResponseModel[]) => {
                this.readOnlyUsers = users ?? [];
                this.handlePropertiesState();
            });
    }

    private getBrand(): string {
        return this.userService.getUser()?.brand_name;
    }

    private setProjectManagers(): void {
        const url = `translation-member-data/project-manager-list`;
        this.translationRequestService
            .getManager(url, { brand: this.getBrand() })
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                this.projectManagers = response?.data ?? [];
            });
    }

    private initializeForm(): void {
        this.usersSettingForm = this.fb.group({
            selectedManager: new FormControl(''),
            users: new FormControl(''),
        });
    }

    private handlePropertiesState(): void {
        this.projectService.getPropertiesState().subscribe((response) => {
            this.state = response;
            const selectedPM = { id: null, name: '', email: '' };
            const readOnlyUsers = this.getUserId(this.state?.properties?.project_properties?.readOnlyUsers) ?? [];
            selectedPM.id = this.state?.properties?.project_properties?.project_manager_id;
            selectedPM.name = this.state?.properties?.project_properties?.project_manager_email;
            selectedPM.email = this.state?.properties?.project_properties?.project_manager_email;
            this.usersSettingForm.patchValue({
                selectedManager: selectedPM,
                readOnlyUsers: readOnlyUsers,
            });
            this.selectedReadOnlyUsers = this.getUsers(readOnlyUsers);
            this.selectedReadOnlyUserIds = readOnlyUsers;
        });
    }

    private updateProjectProperties(): void {
        this.projectPropertiesService
            .updateProjectProperties(this.state.properties)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                if (response?.status === 'OK') {
                    this.state.isProjectPropertiesUpdated = 1;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Project properties updated successfully',
                    });
                    this.projectService.setPropertiesState(this.state);
                    this.ref.close();
                }
            });
    }

    private handleReadOnlyUsersState(): void {
        const userSettings: UserResponseModel = this.usersSettingForm.get('selectedManager').value;
        this.state['properties']['project_properties']['readOnlyUsers'] = this.selectedReadOnlyUserIds;
        this.state['properties']['project_properties']['project_manager_id'] = userSettings.id;
        this.state['properties']['project_properties']['project_manager_email'] = userSettings.email;
        this.projectService.setPropertiesState(this.state);
        this.handlePropertiesState();
    }

    private getUsers(value: number[]): UserResponseModel[] {
        return this.readOnlyUsers.filter((user) => value.some((id) => id === user.id));
    }

    private getUserId(user: UserResponseModel[] | number[]): number[] {
        return user?.map((user) => user.id ?? user);
    }

    private isUserIdExists(id: number): boolean {
        return this.selectedReadOnlyUsers.some((user: UserResponseModel) => user.id === id);
    }

    private setEmptyForUser(): void {
        this.usersSettingForm.get('users').patchValue('');
    }

    nextTab(): void {
        const userSettings: UserResponseModel = this.usersSettingForm.get('selectedManager').value;
        this.state['properties']['project_properties']['readOnlyUsers'] = this.selectedReadOnlyUserIds;
        this.state['properties']['project_properties']['project_manager_id'] = userSettings.id;
        this.state['properties']['project_properties']['project_manager_email'] = userSettings.email;
        this.projectService.setPropertiesState(this.state);
        this.projectPropertiesService.setState(6);
    }

    prevTab(): void {
        this.projectPropertiesService.setState(4);
    }
}
