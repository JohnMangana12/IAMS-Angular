import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { DashboardService, AssetMonthlyData } from '../services/dashboard.service';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as HighCharts from 'highcharts';

@Component({
  selector: 'app-assets-by-month',
  templateUrl: './assets-by-month.component.html',
  styleUrls: ['./assets-by-month.component.scss'],
  standalone: false,
})
export class AssetsByMonthComponent implements OnInit, OnDestroy {
  chart: Chart = new Chart({
    chart: { type: 'line', height: 325 },
    // Title will be updated dynamically in updateChartData
    title: { text: 'Asset Trends: Total Count Per Month' },
    credits: { enabled: false },
    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
      title: { text: 'Count' },
      min: 0
    },
    tooltip: {
      pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
      shared: true
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
          radius: 4
        }
      }
    },
    series: []
  });

  private dataSubscription: Subscription | undefined;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dataSubscription = timer(0, 30000)
      .pipe(
        switchMap(() => this.dashboardService.getAssetsByMonth())
      )
      .subscribe(
        (data: AssetMonthlyData) => {
          console.log('Received new chart data:', data);
          this.updateChartData(data);
        },
        (error) => {
          console.error('Error fetching chart data:', error);
          if (this.chart.ref) {
            this.chart.ref.setTitle({ text: 'Failed to load data' });
          }
        }
      );
  }

  updateChartData(data: AssetMonthlyData): void {
    if (!this.chart.ref) {
      console.warn('Chart reference not available');
      return;
    }

    const totalServers: number[] = [];
    const totalDesktops: number[] = [];
    const totalDeltaV: number[] = [];

    let currentTotalServers = 0;
    let currentTotalDesktops = 0;
    let currentTotalDeltaV = 0;

    const currentMonthIndex = new Date().getMonth(); // 0-indexed (Jan=0, Dec=11)
    const currentYear = new Date().getFullYear();

    // Determine how many months to display:
    // It should be at least up to the current real-world month.
    // It should also extend if there's actual data in "future" months (e.g., data was
    // back-entered for November though it's only July).
    let lastMonthWithData = -1;
    for (let i = 11; i >= 0; i--) { // Loop backwards to find the last non-zero data point
      if ((data.servers && data.servers[i] !== 0) ||
          (data.desktops && data.desktops[i] !== 0) ||
          (data.deltaV && data.deltaV[i] !== 0)) {
        lastMonthWithData = i;
        break;
      }
    }

    // The number of months to display will be:
    // 1. The current month (plus one for 1-indexing month count)
    // 2. OR the index of the last month with actual data (plus one)
    // Whichever is greater. This ensures we don't cut off actual data if it exists for
    // a month beyond the current real-world month.
    const monthsToDisplay = Math.max(currentMonthIndex + 1, lastMonthWithData + 1);

    // Calculate cumulative totals for the full 12 months as initial step,
    // then slice it later.
    for (let i = 0; i < 12; i++) {
        currentTotalServers += (data.servers && data.servers[i]) || 0;
        currentTotalDesktops += (data.desktops && data.desktops[i]) || 0;
        currentTotalDeltaV += (data.deltaV && data.deltaV[i]) || 0;

        totalServers.push(currentTotalServers);
        totalDesktops.push(currentTotalDesktops);
        totalDeltaV.push(currentTotalDeltaV);
    }

    const allMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const displayedCategories = allMonthNames.slice(0, monthsToDisplay);

    const newSeries: Highcharts.SeriesOptionsType[] = [
      {
        name: 'Servers',
        type: 'line',
        color: '#028A8A',
        data: totalServers.slice(0, monthsToDisplay), // Slice data to match displayed categories
        lineWidth: 2
      },
      {
        name: 'Desktops & Workstations',
        type: 'line',
        color: '#000080',
        data: totalDesktops.slice(0, monthsToDisplay), // Slice data to match displayed categories
        lineWidth: 2
      },
      {
        name: 'Delta V Items',
        type: 'line',
        color: '#b87c33',
        data: totalDeltaV.slice(0, monthsToDisplay), // Slice data to match displayed categories
        lineWidth: 2
      },
    ];

    // Update the chart with new categories, series data, and dynamic title
    this.chart.ref.update({
      xAxis: {
        categories: displayedCategories // Set dynamically generated categories
      },
      series: newSeries,
      title: { text: `Asset Trends: Total Asset Acquisitions Per Month (${currentYear})` } // Add current year to title
    }, true, true);
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}
