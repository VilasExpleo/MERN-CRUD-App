import { Injectable } from '@angular/core';
import { ReviewersStatisticsResponseModel } from 'src/app/shared/models/order-review/order-review-statistics-api.model';
import { OrderReviewStateModel } from '../../../../../core/services/order-review/order-review.model';

@Injectable({
    providedIn: 'root',
})
export class OrderReviewStatisticsTransformer {
    documentStyle = getComputedStyle(document.documentElement);

    transform(state: OrderReviewStateModel, statistics?: ReviewersStatisticsResponseModel[]) {
        return {
            ...state,
            statistics: {
                data: this.getStatisticsData(statistics ?? []),
                options: this.getStatisticsOptions(),
            },
            dueDate: state.dueDate ?? new Date(),
        };
    }

    private getStatisticsOptions() {
        return {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    labels: {
                        color: this.documentStyle.getPropertyValue('--text-color'),
                    },
                },
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: this.documentStyle.getPropertyValue('--text-color-secondary'),
                    },
                    grid: {
                        color: this.documentStyle.getPropertyValue('--surface-border'),
                        drawBorder: false,
                    },
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: this.documentStyle.getPropertyValue('--text-color-secondary'),
                    },
                    grid: {
                        color: this.documentStyle.getPropertyValue('--surface-border'),
                        drawBorder: false,
                    },
                },
            },
        };
    }

    private getStatisticsData(statistics: ReviewersStatisticsResponseModel[]) {
        return {
            labels: statistics.map((item) => item.languageCode),
            datasets: [
                {
                    type: 'bar',
                    label: 'Done',
                    backgroundColor: this.documentStyle.getPropertyValue('--green-300'),
                    data: statistics.map((item) => item.doneCount),
                },
                {
                    type: 'bar',
                    label: 'Work In Progress',
                    backgroundColor: this.documentStyle.getPropertyValue('--yellow-300'),
                    data: statistics.map((item) => item.wipCount),
                },
                {
                    type: 'bar',
                    label: 'Length Error',
                    backgroundColor: this.documentStyle.getPropertyValue('--red-300'),
                    data: statistics.map((item) => item.lengthErrorCount),
                },
                {
                    type: 'bar',
                    label: 'Unworked',
                    backgroundColor: this.documentStyle.getPropertyValue('--gray-300'),
                    data: statistics.map((item) => item.unworkedCount),
                },
                {
                    type: 'bar',
                    label: 'Placeholder Error',
                    backgroundColor: this.documentStyle.getPropertyValue('--blue-300'),
                    data: statistics.map((item) => item.placeholderErrorCount),
                },
                {
                    type: 'bar',
                    label: 'Unresolved Font',
                    backgroundColor: this.documentStyle.getPropertyValue('--red-300'),
                    data: statistics.map((item) => item.unresolvedFontCount),
                },
            ],
        };
    }
}
