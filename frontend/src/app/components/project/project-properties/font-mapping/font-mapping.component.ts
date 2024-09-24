import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { ProjectPropertiesService } from 'src/app/core/services/project/project-properties/project-properties.service';
@Component({
    selector: 'app-font-mapping',
    templateUrl: './font-mapping.component.html',
    styleUrls: ['./font-mapping.component.scss'],
    providers: [ConfirmationService],
})
export class FontMappingComponent implements OnInit {
    selectedFont: any[];
    fontPostObj: any;
    projectFontId: any;
    projectFontName: any;
    systemFontName: any;
    fontLanguageCode: any;
    fontType: any;
    selectedFontLinking: any = null;
    availableFont: any[] = [];
    fontOption: any = [];
    fontLinking: any[] = [
        { id: 1, name: 'Static' },
        { id: 2, name: 'Dynamic' },
    ];
    constructor(
        private ref: DynamicDialogRef,
        private config: DynamicDialogConfig,
        private projectPropertiesService: ProjectPropertiesService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.selectedFontLinking = this.fontLinking;
    }
    //  font mapping start
    getFontDetails() {
        // get system fonts
        this.projectPropertiesService
            .getSystemFonts()
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res) {
                    const resp = JSON.stringify(res);
                    const response = JSON.parse(resp);

                    for (const item of response) {
                        this.availableFont.push({
                            lable: item.font_name,
                            value: item.font_id,
                        });
                    }
                }
            });

        const postFontObj = {
            project_id: this.config?.data?.project_id,
            version_id: this.config?.data?.version_no,
        };
        this.projectPropertiesService.getFontmappingData(postFontObj).subscribe((res) => {
            if (res) {
                const resp = JSON.stringify(res);
                const response = JSON.parse(resp);
                for (let i = 0; i < response.fonts.length; i++) {
                    let isFotAvailable;
                    const availableFont = this.availableFont.filter(
                        (e) => e.lable == response.fonts[i].system_font_name
                    );
                    if (availableFont.length != 0) {
                        isFotAvailable = true;
                    } else {
                        isFotAvailable = false;
                    }
                    this.fontOption.push({
                        index: i,
                        language_name: response.fonts[i].language,
                        selected_font: response.fonts[i].system_font_name,
                        font_id: response.fonts[i].system_font_id,
                        font_type: response.fonts[i].font_type,
                        language_id: response.fonts[i].language_id,
                        font_status: isFotAvailable,
                        available_fonts: this.availableFont,
                    });
                }
            }
        });
    }
    getSelectedFont(e: any, i: any, f: any) {
        this.fontOption[i].selected_font = e.value.lable;
        this.fontOption[i].font_status = true;
        this.projectFontId = f.font_id;
        this.systemFontName = f.selected_font;
        this.fontLanguageCode = f.language_id;
        this.fontType = f.font_type;
    }
    postFontDetails() {
        this.fontPostObj = {
            selected_font_id: this.projectFontId,
            selected_font_name: this.systemFontName,
            language_id: this.fontLanguageCode,
            project_id: this.config?.data?.project_id,
            version_id: this.config?.data?.version_no,
            selected_font_type: this.fontType,
        };
        this.projectPropertiesService
            .postFontmappingData(this.fontPostObj)
            .pipe(catchError(() => of(undefined)))
            .subscribe();
    }
    closePropertiesDialogOnCancel() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to cancel?',
            header: 'Cancel Properties',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.ref.close();
            },
        });
    }
    //  font mapping end
}
