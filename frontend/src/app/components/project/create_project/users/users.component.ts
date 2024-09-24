import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, catchError, of } from 'rxjs';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { Manager } from 'src/app/shared/models/translation-request/manager';
import { BrandModel } from 'src/app/shared/models/project/user-request.model';
import { UserResponseModel } from 'src/app/shared/models/project/user-response.model';
@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
    projectManagers: Manager[];
    isMapDone = false;
    usersSettingForm: FormGroup;
    usersSetting: Subscription;
    readOnlyUsers: UserResponseModel[] = [];
    selectedReadOnlyUsers: UserResponseModel[] = [];
    selectedReadOnlyUserIds: number[] = [];
    showConfirmation = false;
    confirmationMessage =
        'The users data may be lost if you cancel the project creation. Are you sure you want to cancel?';
    confirmationHeader = 'Cancel Project';

    constructor(
        private readonly translationRequestService: TranslationRequestService,
        private readonly projectService: ProjectService,
        private readonly router: Router,
        private readonly fb: FormBuilder,
        private readonly userService: UserService
    ) {}

    ngOnInit(): void {
        this.initializeForm();
        this.setProjectManagers();
        this.setReadOnlyUsers();
    }

    goToPreviousTab(): void {
        this.setUserSettingState();
        this.router.navigate(['main/dashboard/resource']);
    }
    //cancel popup
    showConfirm(): void {
        this.showConfirmation = true;
    }

    onAccept(): void {
        this.showConfirmation = false;
        this.resetStates();
        this.router.navigate(['main/dashboard']);
    }

    onReject(): void {
        this.showConfirmation = false;
    }

    submitUserForm(): void {
        this.setUserSettingState();
        this.router.navigate(['main/dashboard/confirmation-of-project']);
    }
    ngOnDestroy(): void {
        this.usersSetting.unsubscribe();
    }

    delete(users: UserResponseModel): void {
        this.selectedReadOnlyUsers = this.selectedReadOnlyUsers.filter(
            (user: UserResponseModel) => user.id !== users?.id
        );
        this.selectedReadOnlyUserIds = this.selectedReadOnlyUsers.map((user: UserResponseModel) => user?.id) ?? [];
        this.setEmptyForUser();
    }

    addUserAsReadOnly(): void {
        const userId = this.usersSettingForm.get('users').value;
        if (!this.isUserIdExists(userId)) {
            this.selectedReadOnlyUsers.push(this.readOnlyUsers.find((ele) => ele.id === userId));
            this.selectedReadOnlyUserIds.push(userId);
        }
        this.setEmptyForUser();
        this.setUserSettingState();
    }

    private setUserSettingState(): void {
        const userSetting = this.usersSettingForm.value;
        this.projectService.setUserSettingState({
            selectedManager: userSetting.selectedManager,
            readOnlyUsers: this.getUserId(this.selectedReadOnlyUsers),
        });
    }

    private setReadOnlyUsers(): void {
        const payload: BrandModel = { brand: this.getBrand() };
        this.projectService
            .getReadOnlyUsers('translation-member-data/read-only-users', payload)
            .subscribe((users: UserResponseModel[]) => {
                this.readOnlyUsers = users ?? [];
                this.setUserSettings();
            });
    }

    private initializeForm(): void {
        this.usersSettingForm = this.fb.group({
            selectedManager: new FormControl(''),
            users: new FormControl(''),
        });
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

    private setUserSettings(): void {
        this.usersSetting = this.projectService.getUserSettingState().subscribe({
            next: (res) => {
                if (res) {
                    this.usersSettingForm.patchValue({
                        selectedManager: res?.selectedManager,
                    });
                    this.selectedReadOnlyUsers = this.readOnlyUsers.filter((user) =>
                        res.readOnlyUsers.includes(user.id)
                    );
                }
            },
        });
    }

    private getUserId(user: UserResponseModel[]): number[] {
        return user.map((user) => user.id);
    }

    private isUserIdExists(id: number): boolean {
        return this.selectedReadOnlyUsers.some((user: UserResponseModel) => user.id === id);
    }

    private getBrand(): string {
        return this.userService.getUser()?.brand_name;
    }

    private resetStates(): void {
        this.projectService.closeCreateDialog();
        this.projectService.setBaseFileState(null);
        this.projectService.setlangPropertiesState(null);
        this.projectService.setLangSettingState(null);
        this.projectService.setLangInheritanceState(null);
        this.projectService.setMetaDataState(null);
        this.projectService.setUserSettingState(null);
    }

    private setEmptyForUser(): void {
        this.usersSettingForm.get('users').setValue('');
    }
}
