import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { DashboardService, AssetYearlyData } from '../services/dashboard.service'; // We'll define AssetYearlyData
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-dashboard-assets-all',
  templateUrl: './dashboard-assets-all.component.html',
  styleUrls: ['./dashboard-assets-all.component.scss'],
  standalone: false,
})
export class DashboardAssetsAllComponent implements OnInit, OnDestroy {
  chart: Chart = new Chart({
    chart: { type: 'column', height: 225 }, // 'column' might be better for year-over-year comparison
    title: { text: 'Asset Count by Acquisition Year' },
    credits: { enabled: false },
    xAxis: {
      type: 'category', // Use category type for years
      title: { text: 'Acquisition Year' }
    },
    yAxis: {
      title: { text: 'Total Count' },
      min: 0
    },
    tooltip: {
      pointFormat: '<span style="color:{point.color}">{series.name}</span>: <b>{point.y}</b><br/>',
      shared: true
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0
      }
    },
    series: []
  });

  private dataSubscription: Subscription | undefined;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    // Fetch data every 30 seconds (adjust as needed)
    this.dataSubscription = timer(0, 30000)
      .pipe(
        switchMap(() => this.dashboardService.getAssetsByYear()) // New service method
      )
      .subscribe(
        (data: AssetYearlyData) => {
          console.log('Received yearly chart data:', data);
          this.updateChartData(data);
        },
        (error) => {
          console.error('Error fetching yearly chart data:', error);
          if (this.chart.ref) {
            this.chart.ref.setTitle({ text: 'Failed to load yearly data' });
          }
        }
      );
  }

  updateChartData(data: AssetYearlyData): void {
    if (!this.chart.ref) {
      console.warn('Chart reference not available for yearly data');
      return;
    }

    // The data will come in as year-count pairs.
    // We'll convert this into Highcharts series format.

    const seriesData: Highcharts.SeriesOptionsType[] = [
      {
        name: 'Total Assets', // You might want to break this down by asset type if your new endpoint supports it
        type: 'column',
        color: '#508078', // Example color
        data: data.years.map(yearData => ({
          name: String(yearData.year), // Year as string for category name
          y: yearData.totalCount
        })),
        // If your backend provides different asset types per year, you'd create separate series here:
        // e.g., { name: 'Servers', type: 'column', data: data.years.map(yd => ({ name: String(yd.year), y: yd.serverCount })) }
      }
    ];

    // Update the chart
    this.chart.ref.update({
      xAxis: {
        categories: data.years.map(yearData => String(yearData.year)) // Set years as categories
      },
      series: seriesData,
      title: { text: `Total Asset Count Per Year` }
    }, true, true);
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}
