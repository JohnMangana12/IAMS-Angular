import { Component, OnInit, OnDestroy } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCertificate,
  faExclamationTriangle,
  faCheckCircle,
  faSpinner,
  faRedo,
  faChevronDown, // For expandable sections
  faChevronUp,   // For expandable sections
  faSearch       // Import the search icon
} from '@fortawesome/free-solid-svg-icons';
import { DashboardService, Asset } from '../services/dashboard.service'; // Import Asset interface
import { CommonModule, NgFor, NgIf, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  stagger,
  AnimationBuilder, // Optional for more complex animations, not strictly needed here
  AnimationEvent
} from '@angular/animations';

// Interface to group assets by Cost Center (or other grouping key) and Warranty Status
interface WarrantyGroup {
  train: string; // Represents the group key (e.g., Cost Center, AgileReleaseTrain)
  assetsWithWarranty: Asset[];
  assetsWithoutWarranty: Asset[];
}

@Component({
  selector: 'app-warranty-monitoring',
  standalone: false, // Ensure this is true if you're using standalone components
  templateUrl: './warranty-monitoring.component.html',
  styleUrl: './warranty-monitoring.component.scss',
  animations: [
    // Animation for individual elements appearing
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    // Animation for a list of items (e.g., Cost Center groups)
    trigger('listAnimation', [
      transition(':enter', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('50ms', animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ]),
      // Animation for staggering items within a list (applied to each group)
      trigger('itemStagger', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
  ]
})
export class WarrantyMonitoringComponent implements OnInit, OnDestroy {

  // Icons
  faCertificate = faCertificate;
  faExclamationTriangle = faExclamationTriangle;
  faCheckCircle = faCheckCircle;
  faSpinner = faSpinner;
  faRedo = faRedo;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faSearch = faSearch;

  // Data properties
  allAssets: Asset[] = [];
  warrantyDataByGroup: WarrantyGroup[] = []; // Stores the fully processed and grouped data
  filteredWarrantyData: WarrantyGroup[] = []; // Stores the data after applying all filters

  isLoading: boolean = false;
  error: string | null = null;

  // Search and Filter properties
  searchQuery: string = '';
  availableCostCenters: string[] = [];
  selectedCostCenter: string = ''; // Default to 'All Cost Centers'

  expandedGroups: { [groupKey: string]: boolean } = {}; // Manages expansion state for each group

  private dataSubscription: Subscription | undefined;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.fetchAndProcessAssets();
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  fetchAndProcessAssets(): void {
    this.isLoading = true;
    this.error = null;
    this.allAssets = [];
    this.warrantyDataByGroup = [];
    this.filteredWarrantyData = [];

    // Fetch all assets. The grouping and filtering will be done client-side.
    this.dataSubscription = this.dashboardService.getAssets().subscribe({
      next: (assets: Asset[]) => {
        this.allAssets = assets;
        this.populateCostCenters(); // Populate the dropdown list
        this.processAssetsByGroup(assets);
        this.applyFilters(); // Apply initial filters (if any are set by default)
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching assets:', err);
        this.error = 'Failed to load asset data. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  populateCostCenters(): void {
    // Extract unique Cost Centers from all assets
    const costCenters = new Set<string>();
    this.allAssets.forEach(asset => {
      if (asset.CostCenter) {
        costCenters.add(asset.CostCenter);
      }
    });
    this.availableCostCenters = Array.from(costCenters).sort(); // Sort them alphabetically
  }

  processAssetsByGroup(assets: Asset[]): void {
    const groupedData: { [groupKey: string]: { withWarranty: Asset[], withoutWarranty: Asset[] } } = {};

    assets.forEach(asset => {
      // Group by CostCenter, fallback to AgileReleaseTrain if CostCenter is missing, then to 'Unassigned'
      const groupKey = asset.CostCenter || asset.AgileReleaseTrain || 'Unassigned';
      const isUnderWarranty = this.isAssetUnderWarranty(asset);

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = { withWarranty: [], withoutWarranty: [] };
      }

      if (isUnderWarranty) {
        groupedData[groupKey].withWarranty.push(asset);
      } else {
        groupedData[groupKey].withoutWarranty.push(asset);
      }
    });

    this.warrantyDataByGroup = Object.keys(groupedData).map(groupKey => ({
      train: groupKey, // 'train' property in the HTML template refers to the group key
      assetsWithWarranty: groupedData[groupKey].withWarranty,
      assetsWithoutWarranty: groupedData[groupKey].withoutWarranty,
    }));

    this.initializeExpandedState();
  }

  isAssetUnderWarranty(asset: Asset): boolean {
    if (!asset.Warranty) {
      return false;
    }
    try {
      const warrantyEndDate = new Date(asset.Warranty);
      const now = new Date();
      // Normalize dates to compare just the date part, ignoring time
      warrantyEndDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      return warrantyEndDate >= now;
    } catch (e) {
      console.error(`Invalid date format for asset ${asset.AssetTag}: ${asset.Warranty}`, e);
      return false;
    }
  }

  toggleTrainExpansion(groupKey: string): void {
    this.expandedGroups[groupKey] = !this.expandedGroups[groupKey];
  }

  initializeExpandedState(): void {
    // Initialize all groups to be expanded by default
    this.warrantyDataByGroup.forEach(group => {
      this.expandedGroups[group.train] = true;
    });
  }

  // This method is no longer used directly for displaying the status icon in the list,
  // but could be used elsewhere. The HTML directly uses the logic.
  // getWarrantyStatusIndicator(asset: Asset): { icon: any, class: string } {
  //   const underWarranty = this.isAssetUnderWarranty(asset);
  //   return {
  //     icon: underWarranty ? this.faCheckCircle : this.faExclamationTriangle,
  //     class: underWarranty ? 'status-good' : 'status-bad'
  //   };
  // }

  refreshData(): void {
    this.fetchAndProcessAssets();
  }

  applyFilters(): void {
    // Start with all processed data
    let intermediateData = [...this.warrantyDataByGroup];

    // 1. Apply Cost Center Filter
    if (this.selectedCostCenter) {
      intermediateData = intermediateData.filter(group => group.train === this.selectedCostCenter);
    }

    // 2. Apply Search Query Filter
    if (this.searchQuery.trim()) {
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      const matchesQuery = (text: string | null | undefined) =>
        text && text.toLowerCase().includes(lowerCaseQuery);

      intermediateData = intermediateData.map(group => {
        // Create a new group with only the matching assets
        const filteredGroup: WarrantyGroup = {
          train: group.train,
          assetsWithWarranty: group.assetsWithWarranty.filter(asset =>
            matchesQuery(asset.AssetTag) ||
            matchesQuery(asset.Description) ||
            matchesQuery(asset.SerialNumber) ||
            matchesQuery(asset.CostCenter) || // Search by CostCenter within the asset details
            matchesQuery(asset.AgileReleaseTrain) // Search by AgileReleaseTrain within the asset details
          ),
          assetsWithoutWarranty: group.assetsWithoutWarranty.filter(asset =>
            matchesQuery(asset.AssetTag) ||
            matchesQuery(asset.Description) ||
            matchesQuery(asset.SerialNumber) ||
            matchesQuery(asset.CostCenter) ||
            matchesQuery(asset.AgileReleaseTrain)
          )
        };
        return filteredGroup;
      }).filter(group => // Remove groups that now have no matching assets
        group.assetsWithWarranty.length > 0 || group.assetsWithoutWarranty.length > 0
      );
    }

    this.filteredWarrantyData = intermediateData;
  }
}
