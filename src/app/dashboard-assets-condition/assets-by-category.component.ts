import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import * as Highcharts from 'highcharts'; // Import Highcharts to get access to its types
import { DashboardService, AssetConditionData } from '../services/dashboard.service'; // Adjust path as needed



@Component({
  selector: 'app-assets-by-category',
  templateUrl: './assets-by-category.component.html',
  styleUrls: ['./assets-by-category.component.scss'],
  standalone: false
})
export class AssetsByCategoryComponent implements OnInit {

  private conditionColors: { [key: string]: string } = {
    'Good': 'Green',
    'Spare': 'Blue',
    'Borrowed': 'Pink',
    'Reserved': 'Orange',
    'Defective': 'Red',
    'Archived': 'violet',
    'Expired': 'DarkGray',
    'Disposed Assets': 'Orange',

    // Add more if you have other conditions and want specific colors
  };

  chart: Chart = new Chart({
    chart: {
      type: 'pie',
      height: 325
    },
    title: {
      text: 'Assets by Condition Status'
    },
    yAxis: {
      title: {
        text: 'Number of Assets'
      }
    },
    series: [
      {
        type: 'pie',
        data: [] // Data will be loaded here
      } as Highcharts.SeriesPieOptions // Explicitly type the series for better type safety
    ],
    credits: {
      enabled: false
    }
  });

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadAssetsByCondition();
  }

  private loadAssetsByCondition(): void {
    this.dashboardService.getAssetsByCondition().subscribe({
      next: (data: AssetConditionData[]) => {
        const chartData: Highcharts.PointOptionsObject[] = data.map(item => ({
          name: item.name,
          y: item.y,
          color: this.conditionColors[item.name] || '#cccccc' // Use mapped color or a default grey
        }));

        // --- Fix Start ---
        // Option 1: Preferred - Use setData on the underlying Highcharts chart instance
        if (this.chart.ref) {
          // If the chart is already rendered and its reference is available
          // (this.chart.ref is the actual Highcharts.Chart object)
          this.chart.ref.series[0].setData(chartData, true); // true for redraw immediately
        } else {
          // Option 2: Fallback - Create a new Chart instance if ref is not yet available
          // This ensures reactivity as the [chart] input binding will detect the new object reference.
          this.chart = this.createNewChartInstance(chartData);
        }
        // --- Fix End ---
      },
      error: (err) => {
        console.error('Error loading assets by condition:', err);
        // Handle error, e.g., show a message to the user
      }
    });
  }

  // Helper to create a new chart instance (used for initial load or if ref isn't available)
  // Changed data type to Highcharts.PointOptionsObject for better Highcharts type compatibility
  private createNewChartInstance(chartData: Highcharts.PointOptionsObject[]): Chart {
    return new Chart({
      chart: {
        type: 'pie',
        height: 325
      },
      title: {
        text: 'Assets by Condition Status' // Keep consistent with the main chart title
      },
      yAxis: {
        title: {
          text: 'Number of Assets'
        }
      },
      series: [
        {
          type: 'pie',
          data: chartData // Set the loaded data here
        } as Highcharts.SeriesPieOptions // Explicitly type the series for better type safety
      ],
      credits: {
        enabled: false
      }
    });
  }

}
