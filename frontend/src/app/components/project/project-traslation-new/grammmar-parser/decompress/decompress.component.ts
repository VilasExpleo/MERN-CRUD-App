import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { TranslationSource } from 'src/Enumerations';
import { CompressDecompressService } from 'src/app/core/services/project/project-translation/grammar-parser/compress-decompress.service';
import { GrammarParserService } from 'src/app/core/services/project/project-translation/grammar-parser/grammar-parser.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { TranslationCheckModel } from 'src/app/shared/models/check/translation-check.model';
import { GetUtteranceRequestModel } from 'src/app/shared/models/grammar-parser/get-utterances-request.model';
import { GetUtteranceResponseModel } from 'src/app/shared/models/grammar-parser/get-utterances-response.model';
import { DecompressDetailsModel } from './decompress-details.model';

@Component({
    selector: 'app-decompress',
    templateUrl: './decompress.component.html',
    styleUrls: ['./decompress.component.scss'],
})
export class DecompressComponent implements OnInit, OnDestroy {
    @Input()
    selectedNode: TreeNode;

    @Input()
    decompressDetailsModel: DecompressDetailsModel;

    @Input()
    selectedSource: TranslationSource;

    errors: TranslationCheckModel[];
    destroyed$ = new Subject<boolean>();

    constructor(
        private readonly grammarParserService: GrammarParserService,
        private readonly compressDecompressService: CompressDecompressService,
        private readonly projectTranslationService: ProjectTranslationService
    ) {}

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    ngOnInit(): void {
        this.compressDecompressService
            .getUtterancesState()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response: GetUtteranceResponseModel) => {
                this.decompressDetailsModel.deCompressedText = response?.utterances;
            });
        this.compressDecompressService
            .getErrorState()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response: TranslationCheckModel[]) => {
                this.errors = response;
            });
    }

    getSourceText(): void {
        this.selectedSource = TranslationSource.Source;
        this.decompressDetailsModel.unCompressText =
            this.selectedNode?.data?.context ?? this.selectedNode?.['source_text'];
    }

    getTranslationText(): void {
        this.selectedSource = TranslationSource.Translate;
        this.decompressDetailsModel.unCompressText =
            this.selectedNode?.data?.translation ??
            this.projectTranslationService.langTabelProps?.find((item) => item.prop_name === 'Text').value;
    }

    decompress(): void {
        this.grammarParserService.decompress(this.getUtteranceRequestParameters());
        this.grammarParserService.getUtterances();
    }

    refresh(): void {
        this.decompressDetailsModel.deCompressedText = [];
    }

    private getUtteranceRequestParameters(): GetUtteranceRequestModel {
        return {
            text: this.decompressDetailsModel.unCompressText,
            dbTextNodeId: this.selectedNode?.data?.db_text_node_id ?? this.selectedNode?.['db_text_node_id'],
            textNodeType: this.selectedNode?.data?.text_node_type ?? this.selectedNode?.['node_type'],
        };
    }

    isSource(): boolean {
        return this.selectedSource === TranslationSource.Source;
    }

    isTranslation(): boolean {
        return this.selectedSource === TranslationSource.Translate;
    }

    isTranslationBlank(): boolean {
        return (
            this.selectedSource === TranslationSource.Translate && this.decompressDetailsModel?.unCompressText === ''
        );
    }

    isError(): boolean {
        return this.errors?.length > 0 && this.isTranslation();
    }
}
