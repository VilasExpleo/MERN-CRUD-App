import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, catchError, of } from 'rxjs';
import { TranslationRoleEnum } from 'src/Enumerations';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { LcAndFontModel } from './lc-and-fonts.model';

@Component({
    selector: 'app-lc-and-fonts',
    templateUrl: './lc-and-fonts.component.html',
})
export class LcAndFontsComponent implements OnInit, OnDestroy {
    metadataOfProjectForm: FormGroup;
    translationRole = [];
    lcOption = [];
    fontOption = [];
    roleSubscription: Subscription;
    lengthCalcSubscription: Subscription;
    fontsSubscription: Subscription;
    metaDataSubscription: Subscription;
    isTranslationRoleConstrained = true;
    isFontSelected = false;

    constructor(private readonly projectService: ProjectService) {}

    ngOnInit(): void {
        this.initializeForm();
        this.updateMetaDataForm();
        this.handleMetaDataChange();
        this.getRole();
        this.getFont();
        this.getLengthCalculationList();
        this.handleLcAndFontChanges();
    }

    ngOnDestroy(): void {
        this.resetStates();
    }

    get formControl() {
        return this.metadataOfProjectForm.controls;
    }

    isLengthCalculationValid() {
        return (
            (this.metadataOfProjectForm.get('defaultLengthCalculationsOfVectorFonts')?.value?.length > 0 &&
                this.metadataOfProjectForm.get('translationRole')?.value === 1) ||
            this.metadataOfProjectForm.get('translationRole')?.value === 2
        );
    }

    private initializeForm(): void {
        this.metadataOfProjectForm = new FormGroup({
            defaultLengthCalculationsOfVectorFonts: new FormControl(['']),
            defaultFontPackages: new FormControl(null),
            translationRole: new FormControl(null, [Validators.required]),
        });
    }

    private updateMetaDataForm(): void {
        const metadata = {
            translationRole: TranslationRoleEnum.Constrained,
            defaultLengthCalculationsOfVectorFonts: this.projectService.lengthCalculationIds,
        };
        this.metadataOfProjectForm.patchValue(metadata);
    }

    private handleMetaDataChange(): void {
        this.metadataOfProjectForm.valueChanges.subscribe((value: LcAndFontModel) => {
            value && this.projectService.setLcAndFontState({ ...value, formChange: true });
            this.isFontSelected = !!value.defaultFontPackages;
        });
    }

    private getFont(): void {
        this.fontsSubscription = this.projectService
            .getFontList()
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res: any) => {
                    if (res) {
                        this.fontOption = res.data;
                        this.fontOption.forEach((item) => {
                            item.font_packagename = item.font_packagename.concat(` -V${item.font_version}`);
                        });
                    }
                },
            });
    }

    private getRole(): void {
        this.roleSubscription = this.projectService
            .getRole()
            .pipe(catchError(() => of(undefined)))
            .subscribe((roleData: any) => {
                if (roleData) {
                    this.translationRole = roleData.data;
                }
            });
    }

    private getLengthCalculationList(): void {
        this.lengthCalcSubscription = this.projectService
            .getLengthCalculationsList()
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res: any) => {
                    if (res) {
                        this.lcOption = res.data;
                        this.lcOption.forEach((item) => {
                            item.lc_name = item.lc_name.concat(` -V${item.lc_version}`);
                        });
                    }
                },
            });
    }

    private handleLcAndFontChanges(): void {
        this.metaDataSubscription = this.projectService
            .getLcAndFontState()
            .pipe(catchError(() => of(undefined)))
            .subscribe((data) => {
                if (data) {
                    this.isFontSelected = !!data.defaultFontPackages;
                    this.metadataOfProjectForm.patchValue(
                        {
                            defaultLengthCalculationsOfVectorFonts: data.defaultLengthCalculationsOfVectorFonts,
                            defaultFontPackages: data.defaultFontPackages,
                            translationRole: data.translationRole,
                        },
                        { emitEvent: false }
                    );
                }
            });
    }

    private resetStates(): void {
        this.roleSubscription?.unsubscribe();
        this.lengthCalcSubscription?.unsubscribe();
        this.fontsSubscription?.unsubscribe();
        this.metaDataSubscription?.unsubscribe();
    }
}
