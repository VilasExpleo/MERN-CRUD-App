import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Subscription, catchError, of } from 'rxjs';

import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { ProjectManagerTR } from 'src/app/shared/models/translation-request/pm-translation-request';
@Component({
    selector: 'app-statistical-evaluation',
    templateUrl: './statistical-evaluation.component.html',
    styleUrls: ['./statistical-evaluation.component.scss'],
})
export class StatisticalEvaluationComponent implements OnChanges {
    @Input()
    statisticalEvaluation: boolean;

    @Input()
    selectedProject;

    @Input()
    role;

    @Output()
    hidesStatisticalEvaluation: EventEmitter<any> = new EventEmitter();

    statisticsData;
    statisticsOptions;
    subscription: Subscription;
    langSelState;
    filterState;
    translation_languages_for_save_filter;
    isPopupMaximized = false;
    constructor(public translationRequestService: TranslationRequestService) {}

    ngOnChanges(): void {
        if (this.statisticalEvaluation) {
            this.loadEvaluation();
        }
    }

    loadEvaluation() {
        this.statisticsData = {};
        if (this.selectedProject) {
            const url = `translation-request/translation-text-count`;
            let labels;
            const objDataSet = [];
            const parameterObject = {
                project_id: this.selectedProject.project_id,
                version_id: this.selectedProject.version_id,
                translation_request_id: this.getTranslationRequestId(this.role, this.selectedProject),
                role: this.role,
                translation_languages: this.selectedProject.language_prop.map((item) => item.language_code) + '',
            };
            this.translationRequestService
                .getStaticticsData(url, parameterObject)
                .pipe(catchError(() => of(undefined)))
                .subscribe((res) => {
                    this.statisticsData = res;
                    if (res?.['status'] === 'OK') {
                        const response = JSON.parse(JSON.stringify(res));
                        labels = response.data[0].translation_languages.map((x) => x.language_code);
                        const lagWiseData = response.data[0].translation_languages;

                        const dataSetUnWorked = {
                            type: 'bar',
                            label: 'UnWorked',
                            backgroundColor: '#CED4D9',
                            data: lagWiseData.map((x) => x.unworked_word_count),
                        };
                        objDataSet.push(dataSetUnWorked);

                        const dataSetDone: any = {
                            type: 'bar',
                            label: 'Done',
                            backgroundColor: '#00FF00',
                            data: lagWiseData.map((x) => x.done_word_count),
                        };
                        objDataSet.push(dataSetDone);
                        const dataSetErrorLength: any = {
                            type: 'bar',
                            label: 'Length Error',
                            backgroundColor: '#FF4B4B',
                            data: lagWiseData.map((x) => x.length_word_count),
                        };
                        objDataSet.push(dataSetErrorLength);
                        const dataSetMissing: any = {
                            type: 'bar',
                            label: 'Missing Font',
                            backgroundColor: '#A70000',
                            data: lagWiseData.map((x) => x.missing_word_count),
                        };
                        objDataSet.push(dataSetMissing);
                        const dataSetInprogress: any = {
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
                    this.setOption();
                });
        }
    }

    onMaximize() {
        this.isPopupMaximized = !this.isPopupMaximized;
    }

    statisticalEvaluationData() {
        this.hidesStatisticalEvaluation.emit();
    }

    private getTranslationRequestId(role, project: ProjectManagerTR) {
        if (role === 'PM') {
            return project.ID;
        }

        return project.translation_request_id;
    }

    setOption() {
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
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#fff',
                    },
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#fff',
                    },
                },
            },
        };
    }
}
