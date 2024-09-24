import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import { ScreenshotService } from 'src/app/core/services/project/project-translation/screenshot.service';
import { environment } from 'src/environments/environment';
import { ScreenshotModel } from './screenshot.model';

@Component({
    selector: 'app-screenshots',
    templateUrl: './screenshots.component.html',
})
export class ScreenshotsComponent implements OnInit {
    model: ScreenshotModel[];
    isLoading = true;
    selectedView: ScreenshotModel;
    isErrorOnLoad = false;
    errorMessage: string;
    baseUrl = `${environment.apiUrl}`;

    private rect = { x: 0, y: 0, width: 0, height: 0 };
    private context: CanvasRenderingContext2D | null = null;
    private failedLoadImageErrorMessage = 'Cannot load the file due to corrupted/incorrect path.';
    private image: HTMLImageElement | null = null;
    private readonly underscoreSymbol = '_';
    destroyed$ = new Subject<boolean>();

    @Output()
    screenshotHeaderEvent = new EventEmitter<string>();

    @ViewChild('dialogContainer')
    dialogContainer!: ElementRef;

    @ViewChild('canvas')
    canvas!: ElementRef;

    constructor(private eventBus: NgEventBus, private screenshotService: ScreenshotService) {}

    ngOnInit(): void {
        this.initializeScreenshot();
        this.eventBus
            .on('screenShot:drawImage')
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                this.drawImage();
            });
    }

    private initializeScreenshot() {
        this.screenshotService
            .getScreenshots()
            .pipe(catchError(() => of([])))
            .subscribe((res) => {
                this.model = res;
                this.isLoading = false;
                this.initializeCanvasWidthHeight();
                if (this.model.length > 0 && this.model[0].dbTextNodeId > 0) {
                    this.selectedView = this.model[0];
                    this.isErrorOnLoad = false;
                    this.showScreenshot();
                } else {
                    this.isErrorOnLoad = true;
                    this.errorMessage = this.model[0].errorMessage;
                    this.screenshotHeaderEvent.emit('');
                }
            });
    }

    initializeCanvasWidthHeight() {
        this.canvas.nativeElement.width = 0;
        this.canvas.nativeElement.height = 0;
    }
    private showScreenshot() {
        this.screenshotHeaderEvent.emit(this.getHeader());
        this.setRectangleCoordinates();
        this.drawImage();
    }

    private drawImage() {
        this.isLoading = true;
        this.context = this.canvas?.nativeElement?.getContext('2d');
        this.image = new Image();
        this.image.src = this.baseUrl + this.selectedView?.url;

        this.image.onload = () => {
            this.isLoading = false;
            this.isErrorOnLoad = false;
            this.calculateContainerDimensionAndDrawImage();
        };

        this.image.onerror = () => {
            this.isLoading = false;
            this.isErrorOnLoad = true;
            this.setErrorMessage();
        };
    }

    private setErrorMessage() {
        this.rect = { x: 0, y: 0, width: 0, height: 0 };
        this.canvas.nativeElement.width = 0;
        this.canvas.nativeElement.height = 0;
        this.context?.clearRect(0, 0, 0, 0);
        this.context.drawImage(this.image, 0, 0, 0, 0);
        if (this.selectedView.errorMessage) {
            this.errorMessage = this.selectedView.errorMessage;
        } else {
            this.errorMessage = this.failedLoadImageErrorMessage;
        }
    }

    onChangeScreenShot(event) {
        this.isLoading = true;
        this.isErrorOnLoad = false;
        this.rect = { x: 0, y: 0, width: 0, height: 0 };
        this.selectedView = event.value;
        this.initializeCanvasWidthHeight();
        this.showScreenshot();
    }

    private calculateContainerDimensionAndDrawImage() {
        if (this.isErrorOnLoad) {
            return;
        }
        const dialogWidth = this.dialogContainer.nativeElement.offsetWidth;
        const scaleFactor = this.image.width / this.image.height;
        const canvasWidth = dialogWidth;
        const canvasHeight = canvasWidth / scaleFactor;
        const newX = (this.rect.x / (this.canvas.nativeElement.width || this.image.width)) * canvasWidth;
        const newY = (this.rect.y / (this.canvas.nativeElement.height || this.image.height)) * canvasHeight;
        this.rect.x = newX;
        this.rect.y = newY;
        this.rect.width = (this.rect.width / (this.canvas.nativeElement.width || this.image.width)) * canvasWidth;
        this.rect.height = (this.rect.height / (this.canvas.nativeElement.height || this.image.height)) * canvasHeight;
        this.canvas.nativeElement.width = canvasWidth;
        this.canvas.nativeElement.height = canvasHeight;
        this.drawImageAndRectangle(canvasWidth, canvasHeight);
    }

    private setRectangleCoordinates() {
        this.rect.x = this.selectedView?.x ?? 0;
        this.rect.y = this.selectedView?.y ?? 0;
        this.rect.width = this.selectedView?.width ?? 0;
        this.rect.height = this.selectedView?.height ?? 0;
    }

    private drawImageAndRectangle(canvasWidth: number, canvasHeight: number) {
        this.context.clearRect(0, 0, canvasWidth, canvasWidth);
        this.context.drawImage(this.image, 0, 0, canvasWidth, canvasHeight);
        this.context.lineWidth = 4;
        this.context.strokeStyle = 'yellow';
        this.context.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }

    private getHeader() {
        let header = this.selectedView.viewName;
        if (this.selectedView.variantName !== '') {
            header += this.underscoreSymbol + this.selectedView.variantName;
        }
        if (this.selectedView.language && this.selectedView.language !== '') {
            header += this.underscoreSymbol + this.selectedView?.language;
        }
        return header;
    }
}
