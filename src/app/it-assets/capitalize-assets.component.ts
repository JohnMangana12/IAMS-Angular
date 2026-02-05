import { Component, OnInit, ViewChild } from '@angular/core';
// Import your modal components if they are different for capitalize assets
// If they are the same, keep the imports from asset-list.component.ts
import { AddAssetsComponent } from '../add-assets/add-assets.component'; // Adjust if needed
import { AssetService } from '../services/asset.service';
import * as XLSX from 'xlsx';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formatDate } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssetDetailsComponent } from '../asset-details/asset-details.component'; // Adjust if needed
import {
  faBox,
  faEdit,
  faTrash,
  faBoxesStacked, // This is used for the main asset title in asset-list
  faDownload,
  faUpload,
  faPlus,
  faSort,
  faSortUp,
  faSortDown,
  faMagnifyingGlass,
  faComputer,
} from '@fortawesome/free-solid-svg-icons';
import { AssetEditModalComponent } from "../asset-edit-modal/asset-edit-modal.component"; // Adjust if needed
import { ChangeDetectorRef } from '@angular/core';
import { ImportConfirmationModalComponent } from '../import-confirmation-modal/import-confirmation-modal.component'; // Adjust if needed
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

@Component({
  selector: 'app-capitalize-assets',
  standalone: false, // Assuming it's not standalone
  templateUrl: './capitalize-assets.component.html',
  styleUrl: './capitalize-assets.component.scss'
})
export class CapitalizeAssetsComponent implements OnInit {

  // Font Awesome Icons - Match those in asset-list.component.ts
  faBox = faBox;
  faEdit = faEdit;
  faTrash = faTrash;
  faBoxesStacked = faBoxesStacked; // Using this icon for the main asset view title
  faDownload = faDownload;
  faUpload = faUpload;
  faPlus = faPlus;
  faSort = faSort;
  faSortUp = faSortUp;
  faSortDown = faSortDown;
  faMagnifyingGlass = faMagnifyingGlass;
  faComputer = faComputer;

  dataSource: any[] = [];
  displayedData: any[] = [];

  // Columns displayed in the table (excluding 'id' and 'Action' from the table header for sorting)
  // Make sure these match the keys in your asset objects from the API
  displayableColumns: string[] = [
    'AssetTag',
    'Description',
    'SerialNumber',
    'CostCenter',
    'Warranty',
    'PoNumber',
    // Add others here if you want them to be sortable and visible in headers
    // 'Specification', 'DateAcquired', 'AssetCondition', etc.
  ];

  page = 1;
  pageSize: number | 'all' = 10; // Initial page size, can be 'all'
  totalPages = 1;
  filterText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading: boolean = false; // For file uploads/downloads
  isLoadingModules: boolean = false; // For initial data load

  // For pagination visual control
  readonly maxPagesToShow = 5;
  readonly MIN_LOADING_DURATION_MS = 1500; // Minimum time to show loading indicator

  constructor(
    private _assetService: AssetService,
    private _snackBar: MatSnackBar,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // This method should fetch and filter data specific to 'Capitalize Assets'
    // If 'Capitalize Assets' refers to assets with GroupAssetCategory === 'Computer Assets',
    // then your existing logic is correct. If it's a different category, adjust the filter.
    this.getCapitalizeAssetsData();
  }

  getCapitalizeAssetsData() {
    this.isLoadingModules = true; // Start loading modules
    this._assetService.getAssetList().pipe(
      map(assets => {
        // !!! IMPORTANT: VERIFY THIS FILTERING LOGIC !!!
        // If 'Capitalize Assets' means assets belonging to the 'Computer Assets' group,
        // your current filter is correct.
        // If 'Capitalize Assets' is another distinct category, change 'Computer Assets' below.
        // For example, if there's a category named 'Capitalizable':
        // return assets.filter(asset => asset.GroupAssetCategory === 'Capitalizable');

        // If you want to replicate the exact EXCLUSION filtering of asset-list.component.ts,
        // you would use that logic here, but that would likely show non-capitalized assets.
        // Assuming you want to show *only* capitalized assets:
        const filteredAssets = assets.filter(asset =>
          asset.GroupAssetCategory === 'Computer Assets' // <-- ADJUST THIS LINE IF NEEDED
        );
        return filteredAssets;
      }),
      finalize(() => {
        // Ensure isLoadingModules is false after a minimum delay, even if API returns fast
        setTimeout(() => {
          this.isLoadingModules = false;
        }, this.MIN_LOADING_DURATION_MS);
      })
    ).subscribe({
      next: (res) => {
        this.dataSource = res;
        this.updateTotalPages(); // Calculate total pages based on current data and pageSize
        this.updateDisplayedData(); // Apply initial sorting/filtering/pagination
        console.log('Capitalize Assets data loaded and filtered.', this.dataSource);
      },
      error: (err) => {
        console.error('Error fetching capitalize assets:', err);
        this._snackBar.open('Failed to load Capitalize Assets. Please try again later.', 'Close', { duration: 5000 });
      }
    });
  }

  applyFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.filterText = inputElement.value.trim().toLowerCase();
    this.page = 1; // Reset to the first page on filter change
    this.updateDisplayedData();
  }

  deleteAsset(id: number) {
    // You might want to add a confirmation modal here before deleting
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }
    this._assetService.deleteAssetList(id).subscribe({
      next: () => {
        this._snackBar.open('Asset Deleted!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
        // Re-fetch the list to update the displayed data
        this.getCapitalizeAssetsData();
      },
      error: (err) => {
        console.error('Error deleting asset:', err);
        this._snackBar.open('Failed to delete asset.', 'Close', { duration: 3000, verticalPosition: 'bottom' });
      }
    });
  }

  openAssetDetailsModal(asset: any) {
    // Ensure you have AssetDetailsComponent available and imported, or use AssetEditModalComponent if it serves the same purpose
    const modalRef = this.modalService.open(AssetDetailsComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.asset = asset;
  }

  openAddEditAssetsForm(data?: any) {
    // Use the same modal component as asset-list for adding/editing
    // Assuming AddAssetsComponent is the correct one for general asset creation/editing
    const modalRef = this.modalService.open(AddAssetsComponent, { size: 'lg', centered: true });
    if (data) {
      modalRef.componentInstance.dataToEdit = data; // Assuming AddAssetsComponent has a property like dataToEdit
    }

    modalRef.result.then((result) => {
      if (result === 'success') { // Assuming your modal emits 'success' on save
        this._snackBar.open('Asset saved successfully!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
        this.getCapitalizeAssetsData(); // Refresh list
      }
    }, (reason) => {
      console.log(`Modal dismissed: ${reason}`);
    });
  }

  openEditAssetsForm(row: any) {
    // Use the same edit modal component as asset-list
    const modalRef = this.modalService.open(AssetEditModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.data = row; // Pass the row data to the edit modal

    modalRef.result.then((result) => {
      if (result === 'success') { // Assuming your modal emits 'success' on save
        this._snackBar.open('Asset updated successfully!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
        this.getCapitalizeAssetsData(); // Refresh list
      }
    }, (reason) => {
      console.log(`Edit modal dismissed: ${reason}`);
    });
  }

  onFileChange(event: any) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length !== 1) {
      this._snackBar.open('Please select only one file.', 'Close', { duration: 3000 });
      return;
    }
    this.isLoading = true; // Show loading spinner for upload process
    const file: File = target.files[0];

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const binaryString: string = e.target.result;
        const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary', cellDates: true }); // Read dates as Date objects
        const sheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
        const data: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Pre-process data for import
        const processedData = data.map(item => this.preprocessAssetData(item));

        this.importAssets(processedData);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        this._snackBar.open('Error reading Excel file. Please ensure it is a valid .xlsx or .xls file.', 'Close', { duration: 5000 });
      } finally {
        // Clear the file input value to allow re-uploading the same file
        target.value = '';
        // isLoading will be reset in importAssets finalize or error handling
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      this._snackBar.open('Error reading file.', 'Close', { duration: 3000 });
      this.isLoading = false;
      target.value = '';
    };
    reader.readAsBinaryString(file);
  }

  // Helper to preprocess data from Excel
  preprocessAssetData(item: any): any {
    const processedItem: any = {};
    // Map Excel columns to your asset model properties - ensure these keys match your Excel headers
    processedItem.AssetTag = item['Asset Tag'] || item['AssetTag']; // Handle variations
    processedItem.Description = item['Description'] || item['description'];
    processedItem.SerialNumber = item['Serial Number'] || item['SerialNumber'];
    processedItem.CostCenter = item['Cost Center'] || item['CostCenter'];
    processedItem.Warranty = item['Warranty'] ? this.formatDateForAPI(item['Warranty']) : null;
    processedItem.PoNumber = item['PO Number'] || item['PoNumber'];
    processedItem.Specification = item['Specification'] || item['specification'];
    processedItem.DateAcquired = item['Date Acquired'] ? this.formatDateForAPI(item['Date Acquired']) : null;
    processedItem.AssetCondition = item['Asset Condition'] || item['AssetCondition'];
    processedItem.AssetCategory = item['Asset Category'] || item['AssetCategory'];
    processedItem.GroupAssetCategory = item['Group Asset Category'] || item['GroupAssetCategory'];
    processedItem.ScrumTeam = item['Scrum Team'] || item['ScrumTeam'];
    processedItem.AgileReleaseTrain = item['Agile Release Train'] || item['AgileReleaseTrain'];
    processedItem.CheckoutTo = item['Checkout To'] || item['CheckoutTo'];
    processedItem.Location = item['Location'] || item['location'];
    // Add any other relevant fields based on your Excel headers

    // Ensure specific fields are trimmed if they are strings
    if (processedItem.AssetTag && typeof processedItem.AssetTag === 'string') processedItem.AssetTag = processedItem.AssetTag.trim();
    if (processedItem.SerialNumber && typeof processedItem.SerialNumber === 'string') processedItem.SerialNumber = processedItem.SerialNumber.trim();
    // Add trimming for other relevant string fields if necessary

    return processedItem;
  }

  // Helper to format dates consistently for API
  formatDateForAPI(date: any): string | null {
    if (!date) return null;
    try {
      // If XLSX.read with cellDates: true is used, it might already be a Date object
      if (date instanceof Date) {
        return formatDate(date, 'yyyy-MM-dd', 'en-US');
      }
      // Fallback for string dates if they were not parsed as Date objects by reader
      return formatDate(new Date(date), 'yyyy-MM-dd', 'en-US');
    } catch (e) {
      console.error("Could not format date:", date, e);
      return null; // Return null if date formatting fails
    }
  }


  importAssets(assets: any[]) {
    if (assets.length === 0) {
      this._snackBar.open('No data found in the Excel file to import.', 'Close', { duration: 3000 });
      this.isLoading = false;
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    const importResults: Array<{ asset: any, status: string, message?: string }> = [];

    // Create an array of observables for each asset import
    const importObservables = assets.map(asset => {
      // Ensure required fields are present before attempting to add
      // Adjust these validation rules based on your actual requirements
      if (!asset.AssetTag || !asset.Description) {
        failedCount++;
        importResults.push({ asset, status: 'failed', message: 'Missing required fields (Asset Tag or Description).' });
        return of(null); // Return an observable that completes immediately
      }

      return this._assetService.addAsset(asset).pipe(
        map(() => {
          successCount++;
          importResults.push({ asset, status: 'success' });
          return { asset, status: 'success' };
        }),
        catchError(err => {
          failedCount++;
          const errorMessage = err.error?.message || err.message || 'Unknown error';
          console.error('Error importing asset entry:', asset, err);
          importResults.push({ asset, status: 'failed', message: errorMessage });
          // Return an observable that emits a specific error object, so forkJoin can continue
          return of({ asset, status: 'failed', error: err });
        })
      );
    });

    // Use forkJoin to wait for all observables to complete
    forkJoin(importObservables).pipe(
      finalize(() => {
        this.isLoading = false; // Hide loading spinner
        this.getCapitalizeAssetsData(); // Refresh the asset list
        this.openImportConfirmationModal(successCount, failedCount, importResults); // Open final confirmation modal with detailed results
      })
    ).subscribe({
      next: (results) => {
        console.log('All import operations processed.');
      },
      error: (err) => {
        console.error('An unexpected error occurred during bulk import processing:', err);
        this._snackBar.open('An unexpected error occurred during import.', 'Close', { duration: 5000 });
      }
    });
  }

  // New method to open the import confirmation modal
  openImportConfirmationModal(success: number, failed: number, results: Array<{ asset: any, status: string, message?: string }>) {
    // Ensure ImportConfirmationModalComponent is imported and available
    const modalRef = this.modalService.open(ImportConfirmationModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.successCount = success;
    modalRef.componentInstance.failedCount = failed;
    modalRef.componentInstance.results = results; // Pass detailed results for the modal to display
  }

  exportToExcel(): void {
    try {
      // Use the full dataSource for export, not just displayedData
      const dataToExport = [...this.dataSource];

      if (!dataToExport || dataToExport.length === 0) {
        this._snackBar.open('No data to export!', 'Close', { duration: 3000 });
        return;
      }

      // Define columns to export and their display names for the Excel header
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
      ];

      const transformedData = dataToExport.map(item => {
        const exportedItem: any = {};
        exportConfig.forEach(col => {
          const value = item[col.key];
          if (col.key === 'Warranty' || col.key === 'DateAcquired') {
            exportedItem[col.header] = value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : '';
          } else {
            exportedItem[col.header] = value !== undefined && value !== null ? value : '';
          }
        });
        return exportedItem;
      });

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(transformedData, { header: exportConfig.map(c => c.header) });

      // Apply header styling
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
      // Adjust width calculation for better fitting
      worksheet['!cols'] = exportConfig.map(col => {
        // Find the max length for the column's values and header
        let maxLength = col.header.length;
        transformedData.forEach(row => {
          const cellValue = row[col.header] ? String(row[col.header]) : '';
          maxLength = Math.max(maxLength, cellValue.length);
        });
        return { wch: maxLength + 2 }; // Add a little extra padding
      });


      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Capitalize Assets'); // CHANGED SHEET NAME
      XLSX.writeFile(workbook, 'Capitalize_Assets_Export.xlsx'); // CHANGED FILENAME

      this._snackBar.open('Export successful!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this._snackBar.open('Error exporting to Excel!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
    }
  }

  updateDisplayedData() {
    let data = [...this.dataSource];

    // Apply Filter
    if (this.filterText) {
      data = data.filter(item => {
        // Check all string properties for the filter text
        return Object.values(item).some(value =>
          value && typeof value === 'string' && value.toLowerCase().includes(this.filterText)
        );
      });
    }

    // Apply Sorting
    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        const aValue = a[this.sortColumn];
        const bValue = b[this.sortColumn];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return this.sortDirection === 'asc' ? 1 : -1; // Nulls at the end for asc
        if (bValue == null) return this.sortDirection === 'asc' ? -1 : 1; // Nulls at the end for asc

        const comparison = String(aValue).localeCompare(String(bValue));
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    // Apply Pagination
    if (typeof this.pageSize === 'number') {
      const startIndex = (this.page - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.displayedData = data.slice(startIndex, endIndex);
    } else {
      this.displayedData = data; // Show all data if pageSize is 'all'
    }
  }

  onPageChange(newPage: number) {
    // Ensure newPage is within valid bounds
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.updateDisplayedData();
    }
  }

  onPageSizeChange() {
    this.page = 1; // Reset to the first page when page size changes
    this.updateTotalPages(); // Recalculate total pages based on new size
    this.updateDisplayedData(); // Update displayed data
  }

  sortData(columnName: string) {
    if (!this.displayableColumns.includes(columnName)) {
      console.warn(`Column "${columnName}" is not configured for sorting.`);
      return; // Only allow sorting on specified columns
    }

    if (this.sortColumn === columnName) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnName;
      this.sortDirection = 'asc'; // Default to ascending for new columns
    }
    this.page = 1; // Reset to first page on sort
    this.updateDisplayedData();
  }

  // Helper to get the correct sort icon
  getSortIcon(columnName: string) {
    if (this.sortColumn !== columnName) {
      return this.faSort; // Default sort icon
    }
    return this.sortDirection === 'asc' ? this.faSortUp : this.faSortDown;
  }

  updateTotalPages() {
    if (typeof this.pageSize === 'number') {
      // Calculate total pages based on the filtered dataSource length
      this.totalPages = Math.ceil(this.dataSource.length / this.pageSize);
    } else {
      this.totalPages = 1; // If "All" is selected, there's effectively one page
    }
  }

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

  // Method to handle clicks on page links, especially the ellipsis
  handlePageLinkClick(pageNumberOrEllipsis: number | string): void {
    if (typeof pageNumberOrEllipsis === 'number') {
      this.onPageChange(pageNumberOrEllipsis);
    }
    // If it's '...', do nothing, or you could implement logic to jump to a specific page
    // based on context, but for now, it's just a visual indicator.
  }
}
