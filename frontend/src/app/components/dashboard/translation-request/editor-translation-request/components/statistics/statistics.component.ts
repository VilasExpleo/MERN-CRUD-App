import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, catchError, of } from 'rxjs';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit, OnDestroy {
    statisticsForm: UntypedFormGroup;
    minDateValue = new Date();
    subscription: Subscription;
    private langSelSub: Subscription;
    private filterSub: Subscription;
    private statisiticsSub: Subscription;
    statisticsData;
    statisticsOptions;
    langSelState;
    filterState;
    translation_languages_for_save_filter;
    loading = true;

    @Output()
    navigationEvent = new EventEmitter<number>();

    constructor(
        private router: Router,
        private fb: UntypedFormBuilder,
        public translationRequestService: TranslationRequestService
    ) {}

    ngOnInit(): void {
        this.statisticsForm = this.fb.group({
            deuDate: [new Date(+new Date() + 12096e5), Validators.required],
        });
        this.langSelSub = this.translationRequestService.getLangSelectionState().subscribe((res) => {
            this.langSelState = res;
        });

        this.filterSub = this.translationRequestService.getFilterState().subscribe((res) => {
            if (res !== null) {
                this.filterState = res;
            }
        });

        this.statisiticsSub = this.translationRequestService.getStatisticsState().subscribe({
            next: (res: any) => {
                if (res !== null) {
                    this.statisticsData = res.statisticsData;
                    this.translation_languages_for_save_filter = res.translation_languages;
                    this.statisticsForm.patchValue({
                        deuDate: res.statistics.deuDate,
                    });
                } else {
                    this.loadStaticsData();
                }
            },
        });

        this.statisiticsSub = this.translationRequestService.getStatisticsState().subscribe({
            next: (res: any) => {
                if (res !== null) {
                    this.loading = false;
                    this.statisticsData = res.statisticsData;
                    this.translation_languages_for_save_filter = res.translation_languages;
                    this.statisticsForm.patchValue({
                        deuDate: res.statistics.deuDate,
                    });
                } else {
                    this.loadStaticsData();
                }
            },
        });

        this.statisticsOptions = {
            plugins: {
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    position: 'right',
                    labels: {
                        color: '#495057',
                    },
                },
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        color: '#fff',
                    },
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: '#495057',
                        precision: 0,
                    },
                    grid: {
                        color: '#fff',
                    },
                },
            },
        };
    }

    loadStaticsData() {
        let sourceLang: '';
        this.translationRequestService.getLangSelectionState().subscribe((dataLang) => {
            sourceLang = dataLang?.sourseLanguage?.name;
        });

        const url = `translation-request/translation-text-count`;
        let labels;
        const objDataSet = [];
        const selectedLanguages = [];
        this.langSelState.selectedLanguages.map((item) => {
            selectedLanguages.push(item.name);
        });
        const parameterObject = {
            project_id: this.langSelState.projectId,
            version_id: this.langSelState.versioNo,
            editor_language: sourceLang,
            text_nodes: this.filterState.nodeList,
            translation_languages: selectedLanguages + '',
            export: this.filterState?.unfinishedNodes,
        };
        if (parameterObject) {
            this.translationRequestService
                .getStaticticsData(url, parameterObject)
                .pipe(catchError(() => of(undefined)))
                .subscribe((res) => {
                    if (res !== undefined) {
                        this.loading = false;
                        const response = JSON.parse(JSON.stringify(res));
                        labels = response.data[0].translation_languages.map((x) => x.language_code);
                        const lagWiseData = response.data[0].translation_languages;
                        this.translation_languages_for_save_filter = this.translationRequestService.getNodeData(
                            lagWiseData,
                            this.langSelState.selectedLanguages
                        );

                        const dataSetUnWorked = {
                            type: 'bar',
                            label: 'UnWorked',
                            backgroundColor: '#CED4D9',
                            data: lagWiseData.map((x) => x.unworked_word_count),
                        };
                        objDataSet.push(dataSetUnWorked);

                        const dataSetDone = {
                            type: 'bar',
                            label: 'Done',
                            backgroundColor: '#00FF00',
                            data: lagWiseData.map((x) => x.done_word_count),
                        };
                        objDataSet.push(dataSetDone);
                        const dataSetErrorLength = {
                            type: 'bar',
                            label: 'Length Error',
                            backgroundColor: '#FF4B4B',
                            data: lagWiseData.map((x) => x.length_word_count),
                        };
                        objDataSet.push(dataSetErrorLength);
                        const dataSetMissing = {
                            type: 'bar',
                            label: 'Missing Font',
                            backgroundColor: '#A70000',
                            data: lagWiseData.map((x) => x.missing_word_count),
                        };
                        objDataSet.push(dataSetMissing);
                        const dataSetInprogress = {
                            type: 'bar',
                            label: 'Inprogress',
                            backgroundColor: '#FFEFCA',
                            data: lagWiseData.map((x) => x.work_in_word_count),
                        };
                        objDataSet.push(dataSetInprogress);
                        this.statisticsData = {
                            labels: labels,
                            datasets: objDataSet,
                        };
                    }
                });
        }
    }
    submitStatisticsForm(next) {
        this.translationRequestService.setStatisticsState({
            statistics: this.statisticsForm.value,
            translation_languages: this.translation_languages_for_save_filter,
            statisticsData: this.statisticsData,
        });
        this.navigationEvent.emit(next);
    }
    prevPage(prev) {
        this.navigationEvent.emit(prev);
    }
    ngOnDestroy() {
        this.langSelSub.unsubscribe();
        this.filterSub.unsubscribe();
        this.statisiticsSub.unsubscribe();
    }
}
