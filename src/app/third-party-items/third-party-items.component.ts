import { Component, OnInit } from '@angular/core';
// Import necessary Font Awesome icons and other dependencies
import {
  faComputer, // Using for title icon for consistency
  faEdit,
  faTrash,
  faDownload,
  faMagnifyingGlass,
  faSort,
  faSortUp,
  faSortDown,
  faPeopleRoof,
} from '@fortawesome/free-solid-svg-icons';
import { AssetService } from '../services/asset.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangeDetectorRef } from '@angular/core';
import { AssetEditModalComponent } from "../asset-edit-modal/asset-edit-modal.component"; // Assuming this is your shared modal
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';
import { AssetDetailsComponent } from "../asset-details/asset-details.component"; // If you have a separate details component

@Component({
  selector: 'app-third-party-items',
  standalone: false, // Set to false if you are not using standalone components globally
  templateUrl: './third-party-items.component.html',
  styleUrl: './third-party-items.component.scss'
})
export class ThirdPartyItemsComponent implements OnInit {

  // Font Awesome Icons - Matching capitalize-assets component
  faComputer = faComputer; // For the title icon
  faEdit = faEdit;
  faTrash = faTrash;
  faDownload = faDownload; // For the export button
  faMagnifyingGlass = faMagnifyingGlass; // For the search input
  faSort = faSort;       // Default sort icon
  faSortUp = faSortUp;   // Ascending sort icon
  faSortDown = faSortDown; // Descending sort icon
  faPeopleRoof = faPeopleRoof; // For third-party assets

  dataSource: any[] = []; // Holds all fetched assets
  displayedData: any[] = []; // Holds data for the current page after filtering/sorting

  // Columns displayed in the table and sortable. Match these with your asset properties.
  displayableColumns: string[] = [
    'AssetTag',
    'Description',
    'SerialNumber',
    'CostCenter',
    'Warranty',
    'PoNumber',
  ];

  // Pagination properties
  page = 1;
  pageSize: number | 'all' = 10; // Initial page size, can be 'all'
  totalPages = 1;

  // Filtering and Sorting properties
  filterText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Loading states
  isLoading: boolean = false; // For file uploads/downloads or specific actions
  isLoadingModules: boolean = false; // For initial data load
  readonly MIN_LOADING_DURATION_MS = 1500; // Minimum time to show loading indicator

  constructor(
    private _assetService: AssetService,
    private _snackBar: MatSnackBar,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getThirdPartyAssets();
  }

  getThirdPartyAssets(): void {
    this.isLoadingModules = true; // Start loading
    this._assetService.getAssetList().subscribe({
      next: (assets) => {
        // Filter the assets specifically for '3rd Party Devices'
        this.dataSource = assets.filter(asset =>
          asset.GroupAssetCategory === '3rd Party Devices'
        );
        console.log('Third Party Assets data loaded:', this.dataSource);
        this.updateTotalPages(); // Calculate total pages based on current data and pageSize
        this.updateDisplayedData(); // Apply initial sorting/filtering/pagination
        this.cdr.detectChanges(); // Manually trigger change detection if needed

        // Set to false after a short delay to ensure the loading indicator is visible for a minimum time
        setTimeout(() => {
          this.isLoadingModules = false;
        }, this.MIN_LOADING_DURATION_MS);
      },
      error: (error) => {
        console.error('Error fetching Third Party assets:', error);
        this._snackBar.open('Error loading Third Party Assets. Please try again.', 'Close', { duration: 3000 });
        // Ensure loading state is turned off on error
        setTimeout(() => {
          this.isLoadingModules = false;
        }, this.MIN_LOADING_DURATION_MS);
      },
    });
  }

  // --- Pagination, Filtering, and Sorting Methods ---

  // Method to update displayed data based on current filters, sort, and pagination
  updateDisplayedData() {
    let data = [...this.dataSource]; // Work with a copy

    // 1. Apply Filter
    if (this.filterText) {
      data = data.filter(item => {
        // Check all string properties for the filter text
        return Object.values(item).some(value =>
          value && typeof value === 'string' && value.toLowerCase().includes(this.filterText)
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

  // Opens the edit/details modal for a given asset
  openEditAssetsForm(asset: any) {
    // Using AssetEditModalComponent for consistency, assuming it can handle display/edit
    const modalRef = this.modalService.open(AssetEditModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.data = asset; // Pass the asset data

    // Handle modal result (e.g., if the asset was updated)
    modalRef.result.then((result) => {
      if (result === 'success') { // Assuming your modal emits 'success' on save
        this._snackBar.open('Asset updated successfully!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
        this.getThirdPartyAssets(); // Refresh the list
      }
    }, (reason) => {
      console.log(`Edit modal dismissed: ${reason}`);
    });
  }

  // Opens a modal for asset details (if a separate component exists or using edit modal)
  openAssetDetailsModal(asset: any) {
    // Ensure you have AssetDetailsComponent available and imported, or use AssetEditModalComponent if it serves the same purpose
    const modalRef = this.modalService.open(AssetDetailsComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.asset = asset;
  }

  // Deletes an asset
  deleteAsset(id: number) {
    // Add a confirmation dialog for safety
    if (!confirm('Are you sure you want to delete this Third Party Asset?')) {
      return;
    }
    this._assetService.deleteAssetList(id).subscribe({
      next: () => {
        this._snackBar.open('Asset Deleted!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
        // Re-fetch the list to update the displayed data
        this.getThirdPartyAssets();
      },
      error: (err) => {
        console.error('Error deleting asset:', err);
        this._snackBar.open('Failed to delete asset.', 'Close', { duration: 3000, verticalPosition: 'bottom' });
      }
    });
  }

  // Exports the current data to an Excel file
  exportToExcel(): void {
    try {
      // Use the full dataSource for export, not just displayedData
      const dataToExport = [...this.dataSource];

      if (!dataToExport || dataToExport.length === 0) {
        this._snackBar.open('No data to export!', 'Close', { duration: 3000 });
        return;
      }

      // Define columns to export and their display names for the Excel header
      // Match these keys with your asset object properties and desired Excel headers
      const exportConfig = [
        { key: 'AssetTag', header: 'Asset Tag' },
        { key: 'Description', header: 'Description' },
        { key: 'SerialNumber', header: 'Serial Number' },
        { key: 'CostCenter', header: 'Cost Center' },
        { key: 'Warranty', header: 'Warranty' },
        { key: 'PoNumber', header: 'PO Number' },
        { key: 'Specification', header: 'Specification' },
        { key: 'DateAcquired', header: 'Date Acquired' },
        { key: 'CheckoutTo', header: 'Checkout To' },
        { key: 'Location', header: 'Location' },
        { key: 'AssetCondition', header: 'Asset Condition' },
        { key: 'AssetCategory', header: 'Asset Category' },
        { key: 'GroupAssetCategory', header: 'Group Asset Category' },
        { key: 'ScrumTeam', header: 'Scrum Team' },
        { key: 'AgileReleaseTrain', header: 'Agile Release Train' },
        // Add any other relevant fields you want to export
      ];

      const transformedData = dataToExport.map(item => {
        const exportedItem: any = {};
        exportConfig.forEach(col => {
          const value = item[col.key];
          // Format dates if necessary
          if (col.key === 'Warranty') {
            exportedItem[col.header] = value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : '';
          } else {
            // Ensure value is not null/undefined before assigning
            exportedItem[col.header] = value !== undefined && value !== null ? value : '';
          }
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

      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      // Use a consistent filename
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Third Party Assets');
      XLSX.writeFile(workbook, 'Third_Party_Assets_Export.xlsx');

      this._snackBar.open('Export successful!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this._snackBar.open('Error exporting to Excel!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
    }
  }
}
