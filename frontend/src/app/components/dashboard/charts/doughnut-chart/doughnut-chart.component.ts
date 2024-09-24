import { Component, Input, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { ProjectService } from 'src/app/core/services/project/project.service';

@Component({
    selector: 'app-doughnut-chart',
    templateUrl: './doughnut-chart.component.html',
    styleUrls: ['./doughnut-chart.component.scss'],
})
export class DoughnutChartComponent implements OnInit {
    data: any;
    projectOverview: any;
    options: any;
    @Input() xlsxdownloadId: number;

    @Input() editorLanguage: string;
    constructor(private projectService: ProjectService) {}

    ngOnInit(): void {
        this.projectOverviewChart();
    }
    ngOnChanges() {
        this.projectOverviewChart();
    }
    projectOverviewChart() {
        const projectId = {
            project_id: this.xlsxdownloadId,
            editor_language: this.editorLanguage,
        };
        this.projectService
            .projectOverview(projectId)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                this.projectOverview = res;
                if (this.projectOverview) {
                    this.data = {
                        labels: this.projectOverview.data[0].labels,
                        datasets: [
                            {
                                data: this.projectOverview.data[0].datasets[0].data,
                                backgroundColor: [
                                    '#495057',
                                    '#1EA97C',
                                    '#CD9A23',
                                    '#FF4B4B',
                                    '#FF7B7B',
                                    '#CD0000',
                                    '#3366CC',
                                    '#F72626',
                                ],
                                hoverBackgroundColor: [
                                    '#495057',
                                    '#1EA97C',
                                    '#CD9A23',
                                    '#FF4B4B',
                                    '#FF7B7B',
                                    '#CD0000',
                                    '#3366CC',
                                    '#F72626',
                                ],
                            },
                        ],
                    };
                    this.options = {
                        responsive: true,
                        maintainAspectRatio: false,
                        // cutout: 60,
                        plugins: {
                            legend: {
                                position: 'left',
                            },
                        },
                    };
                }
            });
    }
}
