import { Component, OnInit } from '@angular/core';
import {
  faDriversLicense,
  faEdit,
  faTrash,
  faDownload,
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
import { AssetEditModalComponent } from "../asset-edit-modal/asset-edit-modal.component";
import { finalize, map } from 'rxjs/operators';

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
  faSort = faSort;
  faSortUp = faSortUp;
  faSortDown = faSortDown;
  faMagnifyingGlass = faMagnifyingGlass;

  dataSource: any[] = [];
  displayedData: any[] = [];

  // Columns displayed in the table
  displayableColumns: string[] = [
    'AssetTag',
    'Description',
    'SerialNumber',
    'CostCenter',
    'Warranty',
    'PoNumber',
  ];

  page = 1;
  pageSize: number | 'all' = 10;
  totalPages = 1;
  filterText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
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

  getLicenseAssets(): void {
    this.isLoadingModules = true;
    this.assetService.getAssetList('License Assets').pipe(
      map(assets => {
        return assets;
      }),
      finalize(() => {
        setTimeout(() => {
          this.isLoadingModules = false;
        }, this.MIN_LOADING_DURATION_MS);
      })
    ).subscribe({
      next: (res) => {
        this.dataSource = res;
        this.updateTotalPages();
        this.updateDisplayedData();
        console.log('License Assets data loaded.', this.dataSource);
      },
      error: (err) => {
        console.error('Error fetching license assets:', err);
        this._snackBar.open('Failed to load License Assets. Please try again later.', 'Close', { duration: 5000 });
      }
    });
  }

  applyFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.filterText = inputElement.value.trim().toLowerCase();
    this.page = 1;
    this.updateDisplayedData();
  }

  deleteAsset(id: number) {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }
    this.assetService.deleteAssetList(id).subscribe({
      next: () => {
        this._snackBar.open('Asset Deleted!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
        this.getLicenseAssets();
      },
      error: (err) => {
        console.error('Error deleting asset:', err);
        this._snackBar.open('Failed to delete asset.', 'Close', { duration: 3000, verticalPosition: 'bottom' });
      }
    });
  }

  openAssetDetailsModal(asset: any) {
    const modalRef = this.modalService.open(AssetDetailsComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.asset = asset;
  }

  openEditAssetsForm(row: any) {
    const modalRef = this.modalService.open(AssetEditModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.data = row;

    modalRef.result.then((result) => {
      if (result === 'success') {
        this._snackBar.open('Asset updated successfully!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
        this.getLicenseAssets();
      }
    }, (reason) => {
      console.log(`Edit modal dismissed: ${reason}`);
    });
  }

  exportToExcel(): void {
    try {
      const dataToExport = [...this.dataSource];

      if (!dataToExport || dataToExport.length === 0) {
        this._snackBar.open('No data to export!', 'Close', { duration: 3000 });
        return;
      }

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

      const headerCellStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "0070C0" } },
        alignment: { horizontal: 'center' }
      };

      const range = XLSX.utils.decode_range(worksheet['!ref']!);
      for (let col = range.s.c; col <= range.e.c; ++col) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = headerCellStyle;
        }
      }

      worksheet['!cols'] = exportConfig.map(col => {
        let maxLength = col.header.length;
        transformedData.forEach(row => {
          const cellValue = row[col.header] ? String(row[col.header]) : '';
          maxLength = Math.max(maxLength, cellValue.length);
        });
        return { wch: maxLength + 2 };
      });

      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Licenses');
      XLSX.writeFile(workbook, 'Licenses_Export.xlsx');

      this._snackBar.open('Export successful!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this._snackBar.open('Error exporting to Excel!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
    }
  }

  updateDisplayedData() {
    let data = [...this.dataSource];

    if (this.filterText) {
      data = data.filter(item => {
        return Object.values(item).some(value =>
          value && typeof value === 'string' && value.toLowerCase().includes(this.filterText)
        );
      });
    }

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

    if (typeof this.pageSize === 'number') {
      const startIndex = (this.page - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.displayedData = data.slice(startIndex, endIndex);
    } else {
      this.displayedData = data;
    }
  }

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
