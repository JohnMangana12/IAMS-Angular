import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { faList, faEdit, faTrash, faDownload, faMagnifyingGlass, faSort, faSortUp, faSortDown, faBoxesStacked } from '@fortawesome/free-solid-svg-icons';
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

// Import your modal components if you'll use them for editing/details
//import { AssetEditModalComponent } from "../asset-edit-modal/asset-edit-modal.component";
import { AssetDetailsComponent } from "../asset-details/asset-details.component";

@Component({
  selector: 'app-my-assets',
  standalone: false, // Set to true if it's a standalone component
  templateUrl: './my-assets.component.html',
  styleUrl: './my-assets.component.scss'
})
export class MyAssetsComponent implements OnInit {
  // --- Font Awesome Icons ---
   faList = faList;
   faEdit = faEdit;
   faTrash = faTrash;
   faDownload = faDownload;
   faMagnifyingGlass = faMagnifyingGlass;
   faSort = faSort;
   faSortUp = faSortUp;
   faSortDown = faSortDown;
   faBoxesStacked = faBoxesStacked;

   // --- Data Management ---
   dataSource: Asset[] = [];       // Holds all fetched assets (filtered by user)
   displayedData: Asset[] = [];    // Holds data for the current page after filtering/sorting

   // Define columns that are displayable and sortable in the table.
   // Ensure these properties exist in your Asset model and backend data.
   displayableColumns: string[] = [
     'AssetTag',
     'Description',
     'Location',
     'SerialNumber',
     'AssetCategory',
     'CheckoutTo',        // This column is crucial for filtering
     'ScrumTeam',         // Kept for context, even if not used for filtering here
     'AgileReleaseTrain'  // Kept for context, even if not used for filtering here
   ];

   // --- Pagination Properties ---
   page = 1;
   pageSize: number | 'all' = 10; // Initial page size, can be 'all'
   totalPages = 1;
   errorMessage: string = ''; // To display error messages

   // --- Filtering and Sorting Properties ---
   filterText = '';
   sortColumn = '';
   sortDirection: 'asc' | 'desc' = 'asc';

   // --- Loading States ---
   isLoading: boolean = false;          // For file uploads/downloads or specific actions
   isLoadingModules: boolean = false;   // For initial data load (fetching assets)
   readonly MIN_LOADING_DURATION_MS = 1500; // Minimum time to show loading indicator for a smoother UX

   // --- User Specific Data ---
   // We will store the logged-in user's username to use for filtering.
   // Other user details like ScrumTeam and AgileTrain might be fetched if needed for
   // displaying context, but are NOT used for filtering assets in THIS specific view.
   currentUserUsername: string | null = null;
   currentUserScrumTeam: string | null = null; // For context display if needed
   currentUserAgileTrain: string | null = null; // For context display if needed

   // --- Footer Year ---
   currentYear: number = new Date().getFullYear();

   constructor(
     private authService: AuthService,         // Service to get current user's details
     private assetService: AssetService,       // Service to fetch asset data
     private userService: UserService,       // If you need user details for other purposes
     private _snackBar: MatSnackBar,         // For showing user notifications (e.g., errors)
     private modalService: NgbModal,         // For opening modal dialogs (e.g., asset details)
     private cdr: ChangeDetectorRef          // To manually trigger change detection if needed
   ) {}

   ngOnInit(): void {
     // 1. Get the logged-in user's username
     this.currentUserUsername = this.authService.currentUsername;

     // 2. Validate that a user is logged in
     if (!this.currentUserUsername) {
       this.handleError('You need to be logged in to view your assets.');
       // No further action needed if user is not logged in
       return;
     }

     // 3. Fetch the assets specific to this user
     this.loadUserAssets();

     // OPTIONAL: If you also need to display the user's team/train in the UI
     // for context (e.g., in a header or sidebar), you can fetch that here.
     // However, it's NOT used for filtering the assets in this component for this requirement.
     // this.loadUserContextDetails();
   }

   // --- Data Loading Methods ---

   /**
    * Fetches assets specifically checked out to the current logged-in user.
    * This is the core of the "view his assets" functionality.
    */
   loadUserAssets(): void {
     this.isLoadingModules = true; // Start the main data loading indicator

     // Call the AssetService, passing the logged-in user's username to the 'checkoutTo' filter.
     // We pass null for scrumTeam and agileReleaseTrain because the requirement is
     // to see *only* assets checked out to the user, not all assets from their team/train.
     this.assetService.getAssetList(
       undefined, // groupAssetCategory (not used for this view)
       this.currentUserUsername, // *** THIS IS THE KEY: Filtering by the logged-in user ***
       null, // scrumTeam (not filtering by team for this specific user-centric view)
       null  // agileReleaseTrain (not filtering by train for this specific user-centric view)
       // assetCondition (not used for this view)
     ).subscribe({
       next: (assets: Asset[]) => {
         this.dataSource = assets; // Store all assets returned (which are already filtered by checkoutTo)
         console.log(`Fetched ${assets.length} assets for user: ${this.currentUserUsername}`);

         // Once data is loaded, update pagination and display
         this.updateTotalPages();
         this.updateDisplayedData(); // Apply initial sort/filter (if any) and pagination

         // Ensure the loading indicator stays visible for a minimum duration for better UX
         setTimeout(() => {
           this.isLoadingModules = false;
         }, this.MIN_LOADING_DURATION_MS);
       },
       error: (err) => {
         console.error(`Error fetching assets for user ${this.currentUserUsername}:`, err);
         this.handleError(`Could not load your assets. Please try again later.`); // Show error to user

         // Ensure loading indicator is turned off even on error
         setTimeout(() => {
           this.isLoadingModules = false;
         }, this.MIN_LOADING_DURATION_MS);
       }
     });
   }

   // OPTIONAL: Method to load user's team/train for context display
   /*
   loadUserContextDetails(): void {
     if (!this.currentUserUsername) return; // Should not happen due to check in ngOnInit

     // Assuming UserService.getUsers() fetches all users, or you have a method like getUserByName
     this.userService.getUsers().subscribe({ // Consider optimizing to fetch just the current user
       next: (users) => {
         const currentUser = users.find(user => user.username === this.currentUserUsername);
         if (currentUser) {
           this.currentUserScrumTeam = currentUser.scrum_team || null;
           this.currentUserAgileTrain = currentUser.agile_train || null;
           console.log(`User context: Team=${this.currentUserScrumTeam}, Train=${this.currentUserAgileTrain}`);
           // You might need to manually trigger change detection if these are used in the template
           // this.cdr.detectChanges();
         }
       },
       error: (err) => {
         console.error('Error fetching user context details:', err);
         // Handle error, maybe show a subtle message if context fails to load
       }
     });
   }
   */


   // --- Data Handling Methods (Filtering, Sorting, Pagination) ---
   // These methods operate on the `dataSource` which is already filtered
   // to contain only the current user's assets.

   /**
    * Updates the `displayedData` array based on the current filterText, sortColumn, sortDirection,
    * and the current page number and pageSize.
    */
   updateDisplayedData() {
     let data = [...this.dataSource]; // Work with a copy of the current user's assets

     // 1. Apply Filter
     if (this.filterText) {
       data = data.filter(item => {
         // Check relevant string properties for the filter text
         return (
           (item.AssetTag && item.AssetTag.toLowerCase().includes(this.filterText)) ||
           (item.Description && item.Description.toLowerCase().includes(this.filterText)) ||
           (item.Location && item.Location.toLowerCase().includes(this.filterText)) ||
           (item.SerialNumber && item.SerialNumber.toLowerCase().includes(this.filterText)) ||
           (item.AssetCategory && item.AssetCategory.toLowerCase().includes(this.filterText)) ||
           (item.CheckoutTo && item.CheckoutTo.toLowerCase().includes(this.filterText)) || // Important: Filter by CheckoutTo too, if it was fetched
           (item.ScrumTeam && item.ScrumTeam.toLowerCase().includes(this.filterText)) ||
           (item.AgileReleaseTrain && item.AgileReleaseTrain.toLowerCase().includes(this.filterText))
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
         if (aValue == null) return this.sortDirection === 'asc' ? 1 : -1; // Nulls go to end for ASC, start for DESC
         if (bValue == null) return this.sortDirection === 'asc' ? -1 : 1; // Nulls go to end for ASC, start for DESC

         // Perform comparison. Convert to string for consistent comparison,
         // though you might want specific type handling for numbers/dates.
         const comparison = String(aValue).localeCompare(String(bValue));
         return this.sortDirection === 'asc' ? comparison : -comparison;
       });
     }

     // 3. Apply Pagination
     if (typeof this.pageSize === 'number') {
       const startIndex = (this.page - 1) * this.pageSize;
       const endIndex = startIndex + this.pageSize;
       this.displayedData = data.slice(startIndex, endIndex);
     } else { // pageSize is 'all'
       this.displayedData = data; // Show all filtered data
     }
   }

   /**
    * Handles the input event from the search bar to update the filter text and re-display data.
    */
   applyFilter(event: Event) {
     const inputElement = event.target as HTMLInputElement;
     this.filterText = inputElement.value.trim().toLowerCase();
     this.page = 1; // Reset to the first page when filter changes
     this.updateDisplayedData();
   }

   /**
    * Handles clicks on table headers to sort the data.
    */
   sortData(columnName: string) {
     // Only allow sorting on columns defined in displayableColumns
     if (!this.displayableColumns.includes(columnName)) {
       console.warn(`Column "${columnName}" is not configured for sorting.`);
       return;
     }

     if (this.sortColumn === columnName) {
       // If the same column is clicked, toggle the sort direction
       this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
     } else {
       // If a new column is clicked, set it as the sort column and default to ascending
       this.sortColumn = columnName;
       this.sortDirection = 'asc';
     }
     this.page = 1; // Reset to the first page on sorting
     this.updateDisplayedData();
   }

   /**
    * Handles navigation to a different page.
    */
   onPageChange(newPage: number) {
     // Ensure the requested page number is valid
     if (newPage >= 1 && newPage <= this.totalPages) {
       this.page = newPage;
       this.updateDisplayedData();
     }
   }

   /**
    * Recalculates the total number of pages based on the current `dataSource` length and `pageSize`.
    */
   updateTotalPages() {
     if (typeof this.pageSize === 'number') {
       this.totalPages = Math.ceil(this.dataSource.length / this.pageSize);
     } else { // pageSize is 'all'
       this.totalPages = 1; // If "All" is selected, there's effectively one page
     }
   }

   /**
    * Handles changes in the "Items per page" dropdown. Resets to the first page
    * and recalculates pagination.
    */
   onPageSizeChange() {
     this.page = 1; // Always reset to the first page when page size changes
     this.updateTotalPages(); // Recalculate total pages based on new size
     this.updateDisplayedData(); // Refresh the displayed data with new pagination
   }

   /**
    * Helper method to get the correct Font Awesome sort icon for a column header.
    */
   getSortIcon(columnName: string): any { // Return type should be IconDefinition from @fortawesome/free-solid-svg-icons
     if (this.sortColumn !== columnName) {
       return this.faSort; // Default sort icon (e.g., sort Arrows)
     }
     return this.sortDirection === 'asc' ? this.faSortUp : this.faSortDown;
   }

   // --- Pagination Ellipsis Logic ---
   // Controls how many page numbers are shown around the current page in the pagination control.
   readonly maxPagesToShow = 5; // Example: 1 ... 3 4 [5] 6 7 ... 20

   /**
    * Generates the array of page numbers and ellipses ('...') to display in the pagination component.
    * This creates a user-friendly pagination UI.
    */
   getPages(): (number | string)[] {
     if (typeof this.pageSize !== 'number') {
       return [1]; // If 'All' is selected, just show '1' page.
     }

     const totalPages = this.totalPages;
     const currentPage = this.page;
     const pages: (number | string)[] = [];

     // If total pages are fewer than or equal to our display limit, show all page numbers.
     if (totalPages <= this.maxPagesToShow) {
       for (let i = 1; i <= totalPages; i++) {
         pages.push(i);
       }
     } else {
       // Calculate how many pages to show before and after the current page.
       const halfMaxPages = Math.floor(this.maxPagesToShow / 2);
       let startPage = Math.max(1, currentPage - halfMaxPages);
       let endPage = Math.min(totalPages, currentPage + halfMaxPages);

       // Adjust start and end pages if we are too close to the beginning or end of the total pages
       // to ensure we always show `maxPagesToShow` pages if possible.

       // If the range starts at page 1 and doesn't reach maxPagesToShow, extend the end.
       if (startPage === 1 && endPage < this.maxPagesToShow) {
         endPage = this.maxPagesToShow;
       }
       // If the range ends at the last page and doesn't start early enough to show maxPagesToShow,
       // pull the start page earlier.
       else if (endPage === totalPages && startPage > totalPages - this.maxPagesToShow + 1) {
         startPage = totalPages - this.maxPagesToShow + 1;
       }

       // Add the first page and an ellipsis if the start page is not 1.
       if (startPage > 1) {
         pages.push(1); // Add the first page
         if (startPage > 2) {
           pages.push('...'); // Add ellipsis if there's a gap before the first displayed page
         }
       }

       // Add the pages within the calculated range.
       for (let i = startPage; i <= endPage; i++) {
         pages.push(i);
       }

       // Add an ellipsis and the last page if the end page is not the last page.
       if (endPage < totalPages) {
         if (endPage < totalPages - 1) {
           pages.push('...'); // Add ellipsis if there's a gap after the last displayed page
         }
         pages.push(totalPages); // Add the very last page
       }
     }
     return pages;
   }

   /**
    * Handles clicks on page number links in the pagination.
    * If an ellipsis ('...') is clicked, nothing happens (it's a visual indicator).
    */
   handlePageLinkClick(pageNumberOrEllipsis: number | string): void {
     if (typeof pageNumberOrEllipsis === 'number') {
       this.onPageChange(pageNumberOrEllipsis);
     }
     // If pageNumberOrEllipsis is '...', do nothing.
   }

   // --- Action Methods ---

   /**
    * Example: Opens a modal for asset details.
    * You'll need to have an `AssetDetailsComponent` and register it with NgbModal.
    */
   openAssetDetailsModal(asset: Asset) {
     // Uncomment and adjust if you have an AssetDetailsComponent
      const modalRef = this.modalService.open(AssetDetailsComponent, { size: 'lg', centered: true });
      modalRef.componentInstance.asset = asset;

     // For now, let's just log it or you could open a simple alert
     console.log('Opening details for asset:', asset);
     // alert(`Details for ${asset.AssetTag}: ${asset.Description}`);
   }

   /**
    * Exports the currently displayed assets (which are filtered for the user) to an Excel file.
    */
   exportToExcel(): void {
     this.isLoading = true; // Indicate export is in progress
     try {
       // Use the `dataSource` for export, as it contains all assets fetched for the user.
       const dataToExport = [...this.dataSource];

       if (!dataToExport || dataToExport.length === 0) {
         this._snackBar.open('No data to export!', 'Close', { duration: 3000 });
         this.isLoading = false;
         return;
       }

       // Define the columns to export and their desired header names in the Excel file.
       // These keys MUST match the properties in your Asset model.
       const exportConfig = [
         { key: 'AssetTag', header: 'Asset Tag' },
         { key: 'Description', header: 'Description' },
         { key: 'Location', header: 'Location' },
         { key: 'SerialNumber', header: 'Serial Number' },
         { key: 'AssetCategory', header: 'Asset Category' },
         { key: 'CheckoutTo', header: 'Checkout To' }, // Displaying CheckoutTo is fine here
         { key: 'ScrumTeam', header: 'Scrum Team' },
         { key: 'AgileReleaseTrain', header: 'Agile Release Train' },
         // Add any other relevant fields from your Asset model you want to export
         // Example: { key: 'AssetCondition', header: 'Asset Condition' },
       ];

       // Transform the data into a format suitable for XLSX.utils.json_to_sheet
       const transformedData = dataToExport.map(item => {
         const exportedItem: { [key: string]: any } = {}; // Use an index signature for flexibility
         exportConfig.forEach(col => {
           // Get the value from the asset item. Handle potential undefined/null gracefully.
           const value = item[col.key as keyof Asset];
           exportedItem[col.header] = value !== undefined && value !== null ? value : ''; // Set to empty string if null/undefined
         });
         return exportedItem;
       });

       // Create a worksheet from the transformed data
       const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(transformedData, {
         header: exportConfig.map(c => c.header) // Use the custom headers
       });

       // --- Optional: Apply header styling (similar to what you might have in your app) ---
       const headerCellStyle = {
         font: { bold: true, color: { rgb: "FFFFFF" } }, // White text
         fill: { fgColor: { rgb: "0070C0" } }, // A blue fill color
         alignment: { horizontal: 'center' } // Center align text
       };

       // Apply styling to the header row
       const range = XLSX.utils.decode_range(worksheet['!ref']!);
       for (let col = range.s.c; col <= range.e.c; ++col) {
         const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
         if (worksheet[cellAddress]) {
           worksheet[cellAddress].s = headerCellStyle;
         }
       }

       // --- Optional: Auto-fit columns ---
       worksheet['!cols'] = exportConfig.map(col => {
         let maxLength = col.header.length; // Start with header length
         transformedData.forEach(row => {
           const cellValue = row[col.header] ? String(row[col.header]) : '';
           maxLength = Math.max(maxLength, cellValue.length);
         });
         return { wch: maxLength + 2 }; // wch is column width in characters, add some padding
       });
       // --- End Optional Styling ---

       // Create a workbook and append the worksheet
       const workbook: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(workbook, worksheet, 'UserAssets'); // Sheet name

       // Define the filename, including the user's context for clarity
       const filename = `MyAssets_${this.currentUserUsername ? this.currentUserUsername : 'Export'}_${formatDate(new Date(), 'yyyyMMdd_HHmmss', 'en-US')}.xlsx`;
       XLSX.writeFile(workbook, filename);

       this._snackBar.open('Export successful!', 'Close', { duration: 3000, verticalPosition: 'bottom' });

     } catch (error) {
       console.error('Error exporting to Excel:', error);
       this._snackBar.open('Error exporting to Excel!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
     } finally {
       this.isLoading = false; // Ensure loading is turned off after export attempt
     }
   }

   // --- Helper for Error Handling ---
   /**
    * Handles displaying an error message to the user via a snackbar and clearing data.
    */
   private handleError(message: string): void {
     this.errorMessage = message; // Store message for potential template use
     this._snackBar.open(message, 'Close', { duration: 4000, verticalPosition: 'bottom' });

     // Clear assets and reset pagination/sorting if an error occurs during data load
     this.dataSource = [];
     this.displayedData = [];
     this.page = 1;
     this.totalPages = 1;
     this.sortColumn = '';
     this.sortDirection = 'asc';
     this.isLoadingModules = false; // Ensure loading is turned off on error
   }
 }
