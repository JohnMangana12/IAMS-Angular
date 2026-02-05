import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { DashboardService, WarrantyCounts } from '../services/dashboard.service'; // Adjust path if necessary
import { SeriesColumnOptions } from 'highcharts';

@Component({
  selector: 'app-dashboard-warranty',
  templateUrl: './dashboard-warranty.component.html',
  styleUrls: ['./dashboard-warranty.component.scss'],
  standalone: false
})
export class DashboardWarrantyComponent implements OnInit {

  chart: Chart; // Declare chart without initial data

  constructor(private dashboardService: DashboardService) {
    // Initialize chart with structure, but empty data initially
    this.chart = new Chart({
      chart: {
        type: 'column',
        height: 225
      },
      title: {
        text: 'Warranty Monitoring Summary'
      },
      xAxis: {
        categories: [
          'Laptop',
          'Server Machine', // Represents Rack Type Server and Tower Type Server
          'Desktop',
          'Workstation',
        ]
      },
      yAxis: {
        title: {
          text: 'Count' // Added a title for y-axis
        },
        allowDecimals: false // Counts should be whole numbers
      },
      series: [
        {
          type: 'column',
          name: 'Under Warranty', // First series: for "has warranty"
          data: [], // Will be populated dynamically
          color: '#4CAF50', // Green color for "under warranty"
          showInLegend: true // Ensure legend is visible for this series
        } as SeriesColumnOptions, // Type assertion for compatibility
        {
          type: 'column',
          name: 'No Warranty', // Second series: for "no warranty"
          data: [], // Will be populated dynamically
          color: '#F44336', // Red color for "no warranty"
          showInLegend: true // Ensure legend is visible for this series
        }as SeriesColumnOptions
      ],

      credits: {
        enabled: false
      }
    });
  }

  ngOnInit(): void {
    this.getWarrantyData();
  }

  getWarrantyData(): void {
    this.dashboardService.getWarrantyStatus().subscribe(
      (data: WarrantyCounts) => {
        // Extract data for "Under Warranty" series
        const hasWarrantyData = [
          data.laptop.hasWarranty,
          data.server.hasWarranty,
          data.desktop.hasWarranty,
          data.workstation.hasWarranty

        ];
        // Extract data for "No Warranty" series
        const noWarrantyData = [
          data.laptop.noWarranty,
          data.server.noWarranty,
          data.desktop.noWarranty,
          data.workstation.noWarranty
        ]
        // Update the chart with new series data
        if (this.chart.ref) {
          this.chart.ref.update({
            series: [
              {
                type: 'column',
                name: 'Under Warranty',
                data: hasWarrantyData
              } as SeriesColumnOptions,
              {
                type: 'column',
                name: 'No Warranty',
                data: noWarrantyData,
              } as SeriesColumnOptions,

            ]
          }, true); // The 'true' argument redraws the chart
        }
      },
      (error: any) => {
          console.error('Error loading warranty data', error);
          if (this.chart.ref) {
            this.chart.ref.update({
              title: { text: 'Warranty Monitoring Summary (Error Loading Data)' },
              series: [
                { type: 'column', name: 'Under Warranty', data:[] } as SeriesColumnOptions,
                { type: 'column', name: 'No Warranty', data:[] } as SeriesColumnOptions
              ]
            }, true);
          }
      }
    );
  }
}

