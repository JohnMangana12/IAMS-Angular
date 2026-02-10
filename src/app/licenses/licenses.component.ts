import { Component, OnInit } from '@angular/core';
import {
  faDriversLicense,
  faEdit,
  faTrash,
  faDownload,
  faUpload,
  faPlus,
  faSort,
  faSortUp,
  faSortDown,
  faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons';
import { AssetService } from '../services/asset.service';
import * as XLSX from 'xlsx';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formatDate } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssetDetailsComponent } from '../asset-details/asset-details.component';
import { AddAssetsComponent } from '../add-assets/add-assets.component'; // Using your generic Add/Edit component
import { ImportConfirmationModalComponent } from '../import-confirmation-modal/import-confirmation-modal.component';
import { finalize, map, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { LicenseDetailsModalComponent } from '../license-details-modal/license-details-modal.component';
import { LicenseFormModalComponent } from '../license-form-modal/license-form-modal.component';

@Component({
  selector: 'app-licenses',
  standalone: false,
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.scss']
})
export class LicensesComponent implements OnInit {
  // Font Awesome Icons
  faDriversLicense = faDriversLicense;
  faEdit = faEdit;
  faTrash = faTrash;
  faDownload = faDownload;
  faUpload = faUpload;
  faPlus = faPlus;
  faSort = faSort;
  faSortUp = faSortUp;
  faSortDown = faSortDown;
  faMagnifyingGlass = faMagnifyingGlass;

  // Data Sources
  dataSource: any[] = [];
  displayedData: any[] = [];

  // UPDATED: Columns matching your new PostgreSQL Table
  displayableColumns: string[] = [
    'product_name',
    'license_key',
    'serial_number',
    'cost_center',
    'vendor',
    'contract_date',
    'license_type' // This handles the "Another type"
  ];

  // Pagination & Filtering
  page = 1;
  pageSize: number | 'all' = 10;
  totalPages = 1;

  filterText = '';
  selectedCategory = 'All'; // For the License Type Dropdown

  // Sorting
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Loading States
  isLoading: boolean = false;
  isLoadingModules: boolean = false;

  readonly maxPagesToShow = 5;
  private readonly MIN_LOADING_DURATION_MS = 1500;

  constructor(
    private assetService: AssetService,
    private _snackBar: MatSnackBar,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getLicenseAssets();
  }

  // --- Data Fetching ---
  getLicenseAssets(): void {
    this.isLoadingModules = true;

    // CHANGE HERE: Use 'getLicenses()' instead of 'getAssetList()'
    // This tells the app to look at the 'licenses' table, not 'assets'
    this.assetService.getLicenses().pipe(
      finalize(() => {
        setTimeout(() => {
          this.isLoadingModules = false;
        }, this.MIN_LOADING_DURATION_MS);
      })
    ).subscribe({
      next: (res) => {
        // The backend returns the rows directly
        this.dataSource = res;
        this.updateTotalPages();
        this.updateDisplayedData();
        console.log('License Assets data loaded:', this.dataSource);
      },
      error: (err) => {
        console.error('Error fetching license assets:', err);
        this._snackBar.open('Failed to load License Assets.', 'Close', { duration: 5000 });
      }
    });
  }

  // --- Filtering Logic ---

  // 1. Text Search
  applyFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.filterText = inputElement.value.trim().toLowerCase();
    this.page = 1;
    this.updateDisplayedData();
  }

  // 2. Dropdown Filter (License Type)
  applyCategoryFilter(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCategory = selectElement.value;
    this.page = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    let data = [...this.dataSource];

    // Filter by Text (Product Name, Serial, Key, etc.)
    if (this.filterText) {
      data = data.filter(item => {
        return Object.values(item).some(value =>
          value && typeof value === 'string' && value.toLowerCase().includes(this.filterText)
        );
      });
    }

    // Filter by Type (Subscription, Perpetual, etc.)
    if (this.selectedCategory !== 'All') {
      data = data.filter(item => item.license_type === this.selectedCategory);
    }

    // Sort
    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        const aValue = a[this.sortColumn];
        const bValue = b[this.sortColumn];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return this.sortDirection === 'asc' ? 1 : -1;
        if (bValue == null) return this.sortDirection === 'asc' ? -1 : 1;

        const comparison = String(aValue).localeCompare(String(bValue));
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    // Paginate
    if (typeof this.pageSize === 'number') {
      const startIndex = (this.page - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.displayedData = data.slice(startIndex, endIndex);
    } else {
      this.displayedData = data;
    }
  }

  // --- CRUD Operations ---

  deleteAsset(id: number) {
    if (!confirm('Are you sure you want to delete this license?')) {
      return;
    }
    this.assetService.deleteLicense(id).subscribe({
      next: () => {
        this._snackBar.open('License Deleted!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
        this.getLicenseAssets(); // Refresh list
      },
      error: (err) => {
        console.error('Error deleting license:', err);
        this._snackBar.open('Failed to delete license.', 'Close', { duration: 3000, verticalPosition: 'bottom' });
      }
    });
  }

 // REPLACED: openAssetDetailsModal
  openAssetDetailsModal(row: any) {
    const modalRef = this.modalService.open(LicenseDetailsModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.license = row; // Passing 'license' input
  }

  // REPLACED: openAddEditAssetsForm
  openAddEditAssetsForm(row?: any) {
    const modalRef = this.modalService.open(LicenseFormModalComponent, { size: 'lg', centered: true });

    if (row) {
      modalRef.componentInstance.dataToEdit = row; // Edit Mode
    }
    // No else needed, default is Add Mode

    modalRef.result.then((result) => {
      if (result === 'success') {
        this._snackBar.open(row ? 'License updated successfully!' : 'License added successfully!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
        this.getLicenseAssets(); // Refresh Table
      }
    }, (reason) => {
      console.log(`Modal dismissed`);
    });
  }

  // --- Import (Excel) Logic ---

  onFileChange(event: any) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length !== 1) {
      this._snackBar.open('Please select only one file.', 'Close', { duration: 3000 });
      return;
    }
    this.isLoading = true;
    const file: File = target.files[0];

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const binaryString: string = e.target.result;
        const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary', cellDates: true });
        const sheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
        const data: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Pre-process data to match new DB columns
        const processedData = data.map(item => this.preprocessAssetData(item));

        this.importAssets(processedData);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        this._snackBar.open('Error reading Excel file.', 'Close', { duration: 5000 });
      } finally {
        target.value = ''; // Reset input
      }
    };
    reader.readAsBinaryString(file);
  }

  // Map Excel Headers to New DB Columns
  preprocessAssetData(item: any): any {
    const processedItem: any = {};

    // Left side: DB Column. Right side: Excel Header variations.
    processedItem.product_name = item['Product Name'] || item['product_name'] || item['Asset Tag'];
    processedItem.license_key = item['License Key'] || item['license_key'] || item['Description'];
    processedItem.serial_number = item['Serial Number'] || item['serial_number'];
    processedItem.cost_center = item['Cost Center'] || item['cost_center'];
    processedItem.vendor = item['Vendor'] || item['vendor'] || item['Warranty'];
    processedItem.contract_date = this.formatDateForAPI(item['Contract Date'] || item['contract_date'] || item['PO Number']);
    processedItem.license_type = item['Type'] || item['license_type'] || item['Asset Category'];

    return processedItem;
  }

  formatDateForAPI(date: any): string | null {
    if (!date) return null;
    try {
      if (date instanceof Date) {
        return formatDate(date, 'yyyy-MM-dd', 'en-US');
      }
      return formatDate(new Date(date), 'yyyy-MM-dd', 'en-US');
    } catch (e) {
      console.error("Date error", e);
      return null;
    }
  }

  importAssets(assets: any[]) {
    if (assets.length === 0) {
      this._snackBar.open('No data found to import.', 'Close', { duration: 3000 });
      this.isLoading = false;
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    const importResults: Array<{ asset: any, status: string, message?: string }> = [];

    const importObservables = assets.map(asset => {
      // Basic Validation for the new table
      if (!asset.product_name) {
        failedCount++;
        importResults.push({ asset, status: 'failed', message: 'Missing Product Name' });
        return of(null);
      }

      return this.assetService.addAsset(asset).pipe(
        map(() => {
          successCount++;
          importResults.push({ asset, status: 'success' });
          return { asset, status: 'success' };
        }),
        catchError(err => {
          failedCount++;
          importResults.push({ asset, status: 'failed', message: err.message });
          return of({ asset, status: 'failed', error: err });
        })
      );
    });

    forkJoin(importObservables).pipe(
      finalize(() => {
        this.isLoading = false;
        this.getLicenseAssets();
        this.openImportConfirmationModal(successCount, failedCount, importResults);
      })
    ).subscribe();
  }

  openImportConfirmationModal(success: number, failed: number, results: any[]) {
    const modalRef = this.modalService.open(ImportConfirmationModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.successCount = success;
    modalRef.componentInstance.failedCount = failed;
    modalRef.componentInstance.results = results;
  }

  // --- Export (Excel) Logic ---

  exportToExcel(): void {
    try {
      const dataToExport = [...this.dataSource];

      if (!dataToExport || dataToExport.length === 0) {
        this._snackBar.open('No data to export!', 'Close', { duration: 3000 });
        return;
      }

      // Map NEW DB columns to Friendly Excel Headers
      const exportConfig = [
        { key: 'product_name', header: 'Product Name' },
        { key: 'license_key', header: 'License Key' },
        { key: 'serial_number', header: 'Serial Number' },
        { key: 'cost_center', header: 'Cost Center' },
        { key: 'vendor', header: 'Vendor' },
        { key: 'license_type', header: 'Type' },
        { key: 'contract_date', header: 'Contract Date' },
      ];

      const transformedData = dataToExport.map(item => {
        const exportedItem: any = {};
        exportConfig.forEach(col => {
          const value = item[col.key];
          if (col.key === 'contract_date') {
            exportedItem[col.header] = value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : '';
          } else {
            exportedItem[col.header] = value !== undefined && value !== null ? value : '';
          }
        });
        return exportedItem;
      });

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(transformedData);

      // Optional: Style Headers (Basic Auto-width)
      const wscols = exportConfig.map(c => ({ wch: c.header.length + 5 }));
      worksheet['!cols'] = wscols;

      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Licenses');
      XLSX.writeFile(workbook, 'Licenses_Export.xlsx');

      this._snackBar.open('Export successful!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this._snackBar.open('Error exporting to Excel!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
    }
  }

  // --- Pagination & Sorting Helpers ---

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.updateDisplayedData();
    }
  }

  onPageSizeChange() {
    this.page = 1;
    this.updateTotalPages();
    this.updateDisplayedData();
  }

  sortData(columnName: string) {
    if (!this.displayableColumns.includes(columnName)) {
      console.warn(`Column "${columnName}" is not configured for sorting.`);
      return;
    }

    if (this.sortColumn === columnName) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnName;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.updateDisplayedData();
  }

  getSortIcon(columnName: string) {
    if (this.sortColumn !== columnName) {
      return this.faSort;
    }
    return this.sortDirection === 'asc' ? this.faSortUp : this.faSortDown;
  }

  updateTotalPages() {
    if (typeof this.pageSize === 'number') {
      this.totalPages = Math.ceil(this.dataSource.length / this.pageSize);
    } else {
      this.totalPages = 1;
    }
  }

  getPages(): (number | string)[] {
    if (typeof this.pageSize !== 'number') {
      return [1];
    }

    const totalPages = this.totalPages;
    const currentPage = this.page;
    const pages: (number | string)[] = [];

    if (totalPages <= this.maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfMaxPages = Math.floor(this.maxPagesToShow / 2);
      let startPage = Math.max(1, currentPage - halfMaxPages);
      let endPage = Math.min(totalPages, currentPage + halfMaxPages);

      if (startPage === 1 && endPage < this.maxPagesToShow) {
        endPage = this.maxPagesToShow;
      } else if (endPage === totalPages && startPage > totalPages - this.maxPagesToShow + 1) {
        startPage = totalPages - this.maxPagesToShow + 1;
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    return pages;
  }

  handlePageLinkClick(pageNumberOrEllipsis: number | string): void {
    if (typeof pageNumberOrEllipsis === 'number') {
      this.onPageChange(pageNumberOrEllipsis);
    }
  }
}
