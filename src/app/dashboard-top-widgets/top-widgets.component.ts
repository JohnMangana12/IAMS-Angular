import { Component, OnInit } from '@angular/core';
import {
  faServer,
  faComputer,
  faBox,
  faWarehouse,
  faBoxesStacked,
  faPeopleRoof,
  faLaptop,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardService, DashboardStats } from '../services/dashboard.service'; // Adjust path if needed

@Component({
    selector: 'app-top-widgets',
    templateUrl: './top-widgets.component.html',
    styleUrls: ['./top-widgets.component.scss'],
    standalone: false
})
export class TopWidgetsComponent implements OnInit {

  // Font Awesome icons
  faServer = faServer;
  faComputer = faComputer;
  faBox = faBox;
  faWarehouse = faWarehouse;
  faBoxesStacked = faBoxesStacked;
  faPeopleRoof = faPeopleRoof;
  faLaptop = faLaptop;

  // Property to hold our data, initialized with default values
  dashboardStats: DashboardStats = {
    servers: 0,
    desktops: 0,
    deltaV: 0,
    laptops: 0
  };

  isLoading = true; // To show a loading state

  // Inject the service
  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    // When the component loads, call the service
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.dashboardStats = data;
        this.isLoading = false; // Data loaded, hide loading state
      },
      error: (err) => {
        console.error('Failed to get dashboard stats', err);
        this.isLoading = false; // Stop loading even if there's an error
      }
    });
  }
}
