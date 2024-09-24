import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TranslationSource } from 'src/Enumerations';
import { DecompressDetailsModel } from './decompress/decompress-details.model';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';

@Component({
    selector: 'app-grammar-parser',
    templateUrl: './grammar-parser.component.html',
    styleUrls: ['./grammar-parser.component.scss'],
})
export class GrammarParserComponent implements OnInit {
    steps: MenuItem[];
    activeIndex = 0;
    selectedNode: any;
    decompressDetailsModel: DecompressDetailsModel = {};
    selectedSource: TranslationSource;

    constructor(
        private dialogConfig: DynamicDialogConfig,
        private readonly projectTranslationService: ProjectTranslationService
    ) {}

    ngOnInit(): void {
        this.steps = this.getSteps();
        this.selectedNode = this.dialogConfig?.data.selectedRow;
        this.decompressDetailsModel.unCompressText = this.getUnCompareText();
        this.decompressDetailsModel.deCompressedText = [];
        this.selectedSource = TranslationSource.Source;
    }

    private getSteps(): MenuItem[] {
        return [
            {
                label: 'Decompress',
                command: () => {
                    this.activeIndex = 0;
                },
            },
            {
                label: 'Translate',
                command: () => {
                    this.activeIndex = 1;
                },
            },
            {
                label: 'Compress',
                command: () => {
                    this.activeIndex = 2;
                },
            },
        ];
    }

    backStep(activeIndex: number) {
        if (activeIndex > 0) this.activeIndex = activeIndex - 1;
    }

    nextStep(activeIndex: number) {
        if (activeIndex < 2) this.activeIndex = activeIndex + 1;
    }

    private getUnCompareText(): string {
        return this.selectedNode?.data?.context ?? this.selectedNode?.source_text;
    }

    isDisabled(): boolean {
        return this.activeIndex === 2 || !this.decompressDetailsModel?.deCompressedText;
    }
}
