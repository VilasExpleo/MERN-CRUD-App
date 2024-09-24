import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, catchError, of } from 'rxjs';
import { TranslationRoleEnum } from 'src/Enumerations';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { Manager } from 'src/app/shared/models/translation-request/manager';
import { StateOptions } from 'src/app/shared/models/translation-request/proofread';
import { JobDetails } from 'src/app/shared/models/translation-request/jobDetails.model';

@Component({
    selector: 'app-job-details',
    templateUrl: './job-details.component.html',
    styleUrls: ['./job-details.component.scss'],
})
export class JobDetailsComponent implements OnInit, OnDestroy {
    manager: Manager[];
    selectedManager: Manager;
    stateOptions: StateOptions[];
    jobDetailsForm: UntypedFormGroup;
    jobInformation;
    brand: string;
    subscription: Subscription;
    state;
    proofRead = false;
    proofReadValue = [];
    translationRole: string;
    isUnconstrained = false;

    @Output()
    navigationEvent = new EventEmitter<number>();

    constructor(
        private router: Router,
        private fb: UntypedFormBuilder,
        public translationRequestService: TranslationRequestService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        const url = `translation-member-data/project-manager-list`;
        this.brand = this.userService.getUser().brand_name.trim();
        this.translationRequestService
            .getManager(url, { brand: 'VW_11' })
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res) {
                    this.manager = res['data'];
                }
            });

        this.stateOptions = [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
        ];
        this.jobDetailsForm = this.fb.group({
            selectedManager: ['', Validators.required],
            description: [''],
            proofRead: [true],
            isConstrained: [TranslationRoleEnum[this.translationRole] === TranslationRoleEnum.Unconstrained],
        });

        this.subscription = this.translationRequestService
            .getJobDetailsState()
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                if (!response) {
                    this.loadJobDetails();
                } else {
                    this.setJobDetails(response);
                }
            });
    }

    navigate(index: number) {
        this.translationRequestService.setJobDetailsState(this.jobDetailsForm.value);
        this.navigationEvent.emit(index);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    toggleTranslationRole(event) {
        this.translationRole =
            TranslationRoleEnum[event?.checked ? TranslationRoleEnum.Constrained : TranslationRoleEnum.Unconstrained];
    }

    private loadJobDetails(): void {
        this.translationRequestService.getLangSelectionState().subscribe((response) => {
            this.translationRole = TranslationRoleEnum[response?.translationRole];
            this.jobDetailsForm.patchValue({
                selectedManager: {
                    email: response?.pmName,
                    id: response?.pmId,
                    name: response?.pmName,
                },
                isConstrained: response?.translationRole === TranslationRoleEnum.Constrained,
            });
            this.isUnconstrained = TranslationRoleEnum[this.translationRole] === TranslationRoleEnum.Unconstrained;
        });
    }

    private setJobDetails(jobDetail: JobDetails): void {
        this.jobDetailsForm.patchValue({
            selectedManager: jobDetail.selectedManager,
            description: jobDetail.description,
            proofRead: jobDetail.proofRead,
            isConstrained: jobDetail.isConstrained,
        });
        this.translationRole =
            TranslationRoleEnum[
                jobDetail.isConstrained ? TranslationRoleEnum.Constrained : TranslationRoleEnum.Unconstrained
            ];
    }
}
