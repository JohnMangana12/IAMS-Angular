import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  faList, // Keep faList if you still want it in the toolbar
  faEdit, // If you implement edit functionality
  faTrash, // If you implement delete functionality
  faDownload,
  faMagnifyingGlass,
  faSort,
  faSortUp,
  faSortDown,
  faBoxesStacked,
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../auth.service';
import { AssetService } from '../services/asset.service';
import { Asset } from '../models/asset.model';
import { UserService } from '../services/user.service';

// For Modals and Notifications
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';

// For Excel Export
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';

// Import your modal components if you'll use them for details
 import { AssetDetailsComponent } from "../asset-details/asset-details.component"; // Uncomment if you have this

@Component({
  selector: 'app-scrum-team-assets',
  standalone: false, // Set to true if it's a standalone component
  templateUrl: './scrum-team-assets.component.html',
  styleUrls: ['./scrum-team-assets.component.scss'] // Use styleUrls
})
export class ScrumTeamAssetsComponent implements OnInit {
  // Font Awesome Icons
  faList = faList; // Icon for the toolbar title
  faEdit = faEdit; // If you implement edit functionality
  faTrash = faTrash; // If you implement delete functionality
  faDownload = faDownload;
  faMagnifyingGlass = faMagnifyingGlass;
  faSort = faSort;
  faSortUp = faSortUp;
  faSortDown = faSortDown;
  faBoxesStacked = faBoxesStacked;

  // Data management
  dataSource: Asset[] = []; // Holds all fetched assets for the team
  displayedData: Asset[] = []; // Holds data for the current page after filtering/sorting

  // Columns that are displayable and sortable in the table
  // Make sure these properties exist in your Asset model and backend data
  displayableColumns: string[] = [
    'AssetTag',
    'Description',
    'Location',
    'SerialNumber',
    'AssetCategory',
    'CheckoutTo',
    'ScrumTeam', // Include team and ART for context
    'AgileReleaseTrain'
    // Add other relevant columns from your Asset model if you want them sortable
  ];

  // Pagination properties
  page = 1;
  pageSize: number | 'all' = 10; // Initial page size, can be 'all'
  totalPages = 1;
  error: string = '';
  errorMessage: string = '';

  // Filtering and Sorting properties
  filterText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Loading states
  isLoading: boolean = false; // For file uploads/downloads or specific actions
  isLoadingModules: boolean = false; // For initial data load
  readonly MIN_LOADING_DURATION_MS = 1500; // Minimum time to show loading indicator

  // User specific data, fetched from auth/user services
  currentUserScrumTeam: string | null = null;
  currentUserAgileTrain: string | null = null;

  // Footer year
  currentYear: number = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private assetService: AssetService,
    private userService: UserService,
    private _snackBar: MatSnackBar, // For notifications

    private modalService: NgbModal, // For modals
    private cdr: ChangeDetectorRef // To manually trigger change detection if needed
  ) {}

  ngOnInit(): void {
    // We will fetch assets based on the logged-in user's team context
    this.loadUserAndTeamAssets();
  }

  loadUserAndTeamAssets(): void {
    const currentUserUsername = this.authService.currentUsername;

    if (currentUserUsername) {
      // Fetch user details to get their Scrum Team and Agile Release Train
      this.isLoadingModules = true; // Start loading user details
      // Assuming userService.getUsers() fetches all users. You might have a getUserByName method for efficiency.
      this.userService.getUsers().subscribe({
        next: (users) => {
          const currentUser = users.find(user => user.username === currentUserUsername);
          if (currentUser) {
            this.currentUserScrumTeam = currentUser.scrum_team || null;
            this.currentUserAgileTrain = currentUser.agile_train || null;

            if (this.currentUserScrumTeam) {
              this.fetchTeamAssets(); // Now fetch assets for this team
            } else {
              this.handleError('Your Scrum Team is not specified. Cannot load assets.');
              this.isLoadingModules = false;
            }
          } else {
            this.handleError('User details not found.');
            this.isLoadingModules = false;
          }
        },
        error: (err) => {
          console.error('Error fetching user details:', err);
          this.handleError('Could not load user details. Please try again.');
          this.isLoadingModules = false;
        }
      });
    } else {
      this.handleError('Please log in to view Scrum Team assets.');
      this.isLoadingModules = false;
    }
  }

  fetchTeamAssets(): void {
    // Fetch assets using the team and train identified from the logged-in user
    this.assetService.getAssetList(
      undefined, // No GroupAssetCategory filter needed for this view
      null,      // No CheckoutTo filter needed for this view
      this.currentUserScrumTeam,
      this.currentUserAgileTrain
    ).subscribe({
      next: (assets: Asset[]) => {
        this.dataSource = assets; // Use all assets fetched for the team/train
        console.log('Team Assets loaded:', this.dataSource);

        this.updateTotalPages(); // Calculate total pages based on current data and pageSize
        this.updateDisplayedData(); // Apply initial sorting/filtering/pagination

        // Use a minimum duration for the loading indicator
        setTimeout(() => {
          this.isLoadingModules = false;
        }, this.MIN_LOADING_DURATION_MS);
      },
      error: (err) => {
        console.error(`Error fetching assets for Scrum Team "${this.currentUserScrumTeam}":`, err);
        this.handleError(`Could not load assets for Scrum Team "${this.currentUserScrumTeam}". Please try again later.`);
        setTimeout(() => {
          this.isLoadingModules = false;
        }, this.MIN_LOADING_DURATION_MS);
      }
    });
  }

  // --- Data Handling Methods (Filtering, Sorting, Pagination) ---

  // Updates displayed data based on current filters, sort, and pagination
  updateDisplayedData() {
    let data = [...this.dataSource]; // Work with a copy

    // 1. Apply Filter
    if (this.filterText) {
      data = data.filter(item => {
        // Check all relevant string properties for the filter text
        return (
          (item.AssetTag && item.AssetTag.toLowerCase().includes(this.filterText)) ||
          (item.Description && item.Description.toLowerCase().includes(this.filterText)) ||
          (item.Location && item.Location.toLowerCase().includes(this.filterText)) ||
          (item.SerialNumber && item.SerialNumber.toLowerCase().includes(this.filterText)) ||
          (item.AssetCategory && item.AssetCategory.toLowerCase().includes(this.filterText)) ||
          (item.CheckoutTo && item.CheckoutTo.toLowerCase().includes(this.filterText)) ||
          (item.ScrumTeam && item.ScrumTeam.toLowerCase().includes(this.filterText)) ||
          (item.AgileReleaseTrain && item.AgileReleaseTrain.toLowerCase().includes(this.filterText))
          // Add other string properties to check here if needed
        );
      });
    }

    // 2. Apply Sorting
    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        const aValue = a[this.sortColumn];
        const bValue = b[this.sortColumn];

        // Handle null/undefined values gracefully: put them at the end
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return this.sortDirection === 'asc' ? 1 : -1;
        if (bValue == null) return this.sortDirection === 'asc' ? -1 : 1;

        // Perform comparison
        // Handle non-string types for comparison if necessary (e.g., numbers, dates)
        const comparison = String(aValue).localeCompare(String(bValue));
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    // 3. Apply Pagination
    if (typeof this.pageSize === 'number') {
      const startIndex = (this.page - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.displayedData = data.slice(startIndex, endIndex);
    } else {
      this.displayedData = data; // Show all data if pageSize is 'all'
    }
  }

  // Applies filter text from the input field
  applyFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.filterText = inputElement.value.trim().toLowerCase();
    this.page = 1; // Reset to the first page on filter change
    this.updateDisplayedData();
  }

  // Handles sorting logic for a given column
  sortData(columnName: string) {
    // Only allow sorting on columns defined in displayableColumns
    if (!this.displayableColumns.includes(columnName)) {
      console.warn(`Column "${columnName}" is not configured for sorting.`);
      return;
    }

    if (this.sortColumn === columnName) {
      // If same column, toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // If new column, set to ascending
      this.sortColumn = columnName;
      this.sortDirection = 'asc';
    }
    this.page = 1; // Reset to first page on sort
    this.updateDisplayedData();
  }

  // Navigates to a different page
  onPageChange(newPage: number) {
    // Ensure newPage is within valid bounds
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.updateDisplayedData();
    }
  }

  // Recalculates total pages based on dataSource length and pageSize
  updateTotalPages() {
    if (typeof this.pageSize === 'number') {
      this.totalPages = Math.ceil(this.dataSource.length / this.pageSize);
    } else {
      this.totalPages = 1; // If "All" is selected, there's effectively one page
    }
  }

  // Handles changes in items per page dropdown
  onPageSizeChange() {
    this.page = 1; // Reset to the first page when page size changes
    this.updateTotalPages(); // Recalculate total pages based on new size
    this.updateDisplayedData(); // Update displayed data
  }

  // Helper method to get the correct sort icon (up, down, or default)
  getSortIcon(columnName: string) {
    if (this.sortColumn !== columnName) {
      return this.faSort; // Default sort icon
    }
    return this.sortDirection === 'asc' ? this.faSortUp : this.faSortDown;
  }

  // --- Pagination Ellipsis Logic ---
  // Controls how many page numbers are shown around the current page
  readonly maxPagesToShow = 5;

  // Generates the array of page numbers and ellipses for the pagination component
  getPages(): (number | string)[] {
    if (typeof this.pageSize !== 'number') {
      return [1]; // Show only '1' for 'All'
    }

    const totalPages = this.totalPages;
    const currentPage = this.page;
    const pages: (number | string)[] = [];

    // If total pages are few, show all
    if (totalPages <= this.maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page plus surrounding pages
      const halfMaxPages = Math.floor(this.maxPagesToShow / 2);
      let startPage = Math.max(1, currentPage - halfMaxPages);
      let endPage = Math.min(totalPages, currentPage + halfMaxPages);

      // Adjust if we are near the beginning or end to maintain maxPagesToShow
      if (startPage === 1 && endPage < this.maxPagesToShow) {
        endPage = this.maxPagesToShow;
      } else if (endPage === totalPages && startPage > totalPages - this.maxPagesToShow + 1) {
        startPage = totalPages - this.maxPagesToShow + 1;
      }

      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      // Add pages in the calculated range
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    return pages;
  }

  // Handles clicks on page links, especially the ellipsis
  handlePageLinkClick(pageNumberOrEllipsis: number | string): void {
    if (typeof pageNumberOrEllipsis === 'number') {
      this.onPageChange(pageNumberOrEllipsis);
    }
    // If it's '...', do nothing, or you could implement logic to jump to a specific page
    // based on context, but for now, it's just a visual indicator.
  }

  // --- Action Methods ---

  // Example: Opens a modal for asset details.
  // You'll need to have an AssetDetailsComponent and register it with NgbModal.
  openAssetDetailsModal(asset: Asset) {
    // Uncomment and adjust if you have an AssetDetailsComponent

    const modalRef = this.modalService.open(AssetDetailsComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.asset = asset;

    // For now, let's just log it or you could open a simple alert
    console.log('Opening details for asset:', asset);
    // alert(`Details for ${asset.AssetTag}: ${asset.Description}`);
  }

  // --- Export Method ---
  exportToExcel(): void {
    this.isLoading = true; // Indicate export is in progress
    try {
      // Use the full dataSource for export, not just displayedData
      const dataToExport = [...this.dataSource];

      if (!dataToExport || dataToExport.length === 0) {
        this._snackBar.open('No data to export!', 'Close', { duration: 3000 });
        this.isLoading = false;
        return;
      }

      // Define columns to export and their display names for the Excel header
      // Match these keys with your asset object properties and desired Excel headers
      const exportConfig = [
        { key: 'AssetTag', header: 'Asset Tag' },
        { key: 'Description', header: 'Description' },
        { key: 'Location', header: 'Location' },
        { key: 'SerialNumber', header: 'Serial Number' },
        { key: 'AssetCategory', header: 'Asset Category' },
        { key: 'CheckoutTo', header: 'Checkout To' },
        // Include team and ART in export for context
        { key: 'ScrumTeam', header: 'Scrum Team' },
        { key: 'AgileReleaseTrain', header: 'Agile Release Train' },
        // Add any other relevant fields you want to export from your Asset model
        // Example: { key: 'AssetCondition', header: 'Asset Condition' },
      ];

      const transformedData = dataToExport.map(item => {
        const exportedItem: any = {};
        exportConfig.forEach(col => {
          // Ensure the property exists and handle potential undefined/null values
          const value = item[col.key as keyof Asset];
          exportedItem[col.header] = value !== undefined && value !== null ? value : '';
        });
        return exportedItem;
      });

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(transformedData, { header: exportConfig.map(c => c.header) });

      // Apply header styling (similar to capitalize-assets)
      const headerCellStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "0070C0" } }, // Blue fill
        alignment: { horizontal: 'center' }
      };

      const range = XLSX.utils.decode_range(worksheet['!ref']!);
      for (let col = range.s.c; col <= range.e.c; ++col) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = headerCellStyle;
        }
      }

      // Auto-fit columns
      worksheet['!cols'] = exportConfig.map(col => {
        let maxLength = col.header.length;
        transformedData.forEach(row => {
          const cellValue = row[col.header] ? String(row[col.header]) : '';
          maxLength = Math.max(maxLength, cellValue.length);
        });
        return { wch: maxLength + 2 }; // Add a little extra padding
      });

      // Create a workbook and append the worksheet
            const workbook: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'ScrumAssets'); // Sheet name

            // Define the filename, including the user's context for clarity
            const filename = `ScrumTeamAssets_${this.currentUserScrumTeam ? this.currentUserScrumTeam : 'Export'}_${formatDate(new Date(), 'yyyyMMdd_HHmmss', 'en-US')}.xlsx`;
            XLSX.writeFile(workbook, filename);

      this._snackBar.open('Export successful!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this._snackBar.open('Error exporting to Excel!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
    } finally {
      this.isLoading = false; // Ensure loading is turned off
    }
  }

  // --- Helper for Error Handling ---
  private handleError(message: string): void {
    this.errorMessage = message;
    this._snackBar.open(message, 'Close', { duration: 4000, verticalPosition: 'bottom' });
    // Clear assets and reset pagination/sorting if an error occurs during data load
    this.dataSource = [];
    this.displayedData = [];
    this.page = 1;
    this.totalPages = 1;
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.isLoadingModules = false; // Ensure loading is off
  }
}
