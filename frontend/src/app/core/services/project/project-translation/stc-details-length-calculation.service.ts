import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { TranslationViewType } from 'src/Enumerations';
import {
    LengthCalculationModel,
    TextWidthModel,
} from 'src/app/shared/models/project/project-translation.websocket.model';
import { CalculateWordLineBreakPayload } from 'src/app/shared/models/project/projectTranslate';
import { environment } from 'src/environments/environment';
import { ProjectTranslationService } from './project-translation.service';
import { StcDetailsService } from './stc-details.service';

@Injectable({
    providedIn: 'root',
})
export class StcLengthCalculationService {
    //Here structure of 'content' in Request and Response is different so not able to maintain generic type for websocket.
    private socket$: WebSocketSubject<any>;
    private stcDetails = [];

    constructor(
        private readonly projectTranslationService: ProjectTranslationService,
        private readonly stcDetailsService: StcDetailsService
    ) {
        this.socket$ = new WebSocketSubject(environment.lcWsUrl);
        this.socketSubscription();
    }

    isTextNodeHasValidFont(): boolean {
        const fontType = this.getFontType();
        return fontType !== '_' && fontType !== 'Raster';
    }

    getFontType(): string {
        const selectedRow = this.projectTranslationService.selectedRow;
        return this.projectTranslationService.translationSourceType === TranslationViewType.structure
            ? selectedRow['data']?.fontType
            : selectedRow['fontType'];
    }

    calculateLength(): void {
        const payload = this.getPayload();
        if (payload && this.isTextNodeHasValidFont()) {
            this.socket$.next({
                type: 'calculateWidth-client',
                content: payload,
            });
        }
    }

    private socketSubscription(): void {
        this.socket$.asObservable().subscribe((response: LengthCalculationModel) => {
            if (response?.content) {
                this.setWidthForStcDetails(response);
            }
        });
    }

    private setWidthForStcDetails(response: LengthCalculationModel) {
        const isWidthAvailable = response.content.find((webSocketResponse) => !!webSocketResponse?.widths);
        if (!isWidthAvailable) {
            return;
        }
        const [{ widths }] = response.content;
        this.stcDetails = [...this.stcDetailsService.stcDetails];

        this.stcDetails.forEach((details) => {
            const width = this.getWidthForText(widths, details?.Text);
            if (width) {
                details['width'] = width;
            }
        });
        this.stcDetailsService.stcDetails = this.stcDetails;
    }

    private getWidthForText(widths: TextWidthModel[], text: string): number {
        return widths.find((width: TextWidthModel) => width.text === text).width;
    }

    private getPayload(): CalculateWordLineBreakPayload {
        const text: string[] = this.stcDetailsService.stcDetails.map((detail) => detail?.Text) ?? [];
        return {
            text,
            fontSize: 12,
            bold: false,
            italic: false,
            lcFile: this.projectTranslationService.getLcPath(this.projectTranslationService.selectedRow),
            fontDir: this.projectTranslationService.getCalculateLengthRequiredParms?.fontDir,
            fontType: this.getFontType(),
            font: this.getFontName(),
        };
    }

    private getFontName(): string {
        return this.projectTranslationService.translationSourceType === TranslationViewType.structure
            ? this.projectTranslationService.selectedRow['data']?.fontName
            : this.projectTranslationService.selectedRow['fontName'];
    }
}
