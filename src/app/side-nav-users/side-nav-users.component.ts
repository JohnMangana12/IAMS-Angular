import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // Import NavigationEnd

import {
  faDashboard,
  faLocation,
  faShop,
  faBox,
  faMoneyBill,
  faChartBar,
  faContactBook,
  faHand,
  faComputer,
  faDriversLicense,
  faFileImport,
  faDroplet,
  faServer,
  faWarehouse,
  faShield,
  faTools,
  faChevronDown, // Add this for dropdown arrow
  faChevronUp,    // Add this for dropdown arrow
  faBoxesStacked, // Ensure this icon is imported if used
  faCertificate,
} from '@fortawesome/free-solid-svg-icons';

// Import AuthService
import { AuthService } from '../auth.service';
import { filter } from 'rxjs/operators'; // Import filter

@Component({
  selector: 'app-side-nav-users',
  standalone: false,
  templateUrl: './side-nav-users.component.html',
  styleUrl: './side-nav-users.component.scss'
})
export class SideNavUsersComponent implements OnInit {
  faDashboard = faDashboard;
  faLocation = faLocation;
  faShop = faShop;
  faBox = faBox;
  faMoneyBill = faMoneyBill;
  faChartBar = faChartBar;
  faContactBook = faContactBook;
  faHand = faHand;
  faComputer = faComputer;
  faDriversLicense = faDriversLicense;
  faFileImport = faFileImport;
  faDroplet = faDroplet;
  faServer = faServer;
  faWarehouse = faWarehouse;
  faShield = faShield;
  faTools = faTools;
  faChevronDown = faChevronDown; // Assign new icons
  faChevronUp = faChevronUp;     // Assign new icons
  faBoxesStacked = faBoxesStacked; // Ensure this icon is imported if used
  faCertificate = faCertificate;

  isAssetsDropdownOpen: boolean = false; // State to manage dropdown visibility

  constructor(private router: Router, private authService: AuthService) {} // Inject AuthService

  ngOnInit(): void {
    // Set initial state for dropdown based on current route
    this.checkActiveRoute();

    // Listen for route changes to maintain dropdown state
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkActiveRoute();
    });
  }

  // Method to toggle the dropdown
  toggleAssetsDropdown() {
    this.isAssetsDropdownOpen = !this.isAssetsDropdownOpen;
  }

  // Helper method to check the current route and set dropdown state
  checkActiveRoute() {
    const currentUrl = this.router.url;
    if (
      currentUrl.startsWith('/my-assets') ||
      currentUrl.startsWith('/scrum-team-assets') ||
      currentUrl.startsWith('/amber-assets') ||
      currentUrl.startsWith('/green-assets')
    ) {
      this.isAssetsDropdownOpen = true;
    } else {
      // Optionally close the dropdown if the route is not related to assets
      // this.isAssetsDropdownOpen = false;
    }
  }

  // Helper method to check if the user belongs to the 'amber' train
  isAmberTrainUser(): boolean {
    return this.authService.currentUserAgileTrain === 'Amber';
  }

  // Helper method to check if the user belongs to the 'green' train
  isGreenTrainUser(): boolean {
    return this.authService.currentUserAgileTrain === 'Green';
  }
}
