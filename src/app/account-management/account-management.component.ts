import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Import ChangeDetectorRef
import { faPeopleGroup, faUserPlus, faEdit, faTrash,faUser } from '@fortawesome/free-solid-svg-icons';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Import NgbModal
import { UserFormModalComponent } from '../user-form-modal/user-form-modal.component'; // Import the new modal component
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar

@Component({
  selector: 'app-account-management',
  standalone: false, // Assuming your component is standalone
  templateUrl: './account-management.component.html',
  styleUrl: './account-management.component.scss'
})
export class AccountManagementComponent implements OnInit {
  isLoadingModules: boolean = false;
  private readonly MIN_LOADING_DURATION_MS = 1500; // Set your desired minimum duration

  // Font Awesome Icons
  faPeopleGroup = faPeopleGroup;
  faUserPlus = faUserPlus;
  faEdit = faEdit;
  faTrash = faTrash;
  faUser = faUser;

  // User Management Properties
  allUsers: User[] = []; // Holds all fetched users
  displayedUsers: User[] = []; // Holds users for the current page after filtering/sorting/pagination

  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Pagination Properties - Mirroring SpareItemsComponent
  userPage = 1;
  userPageSize: number | 'all' = 10; // Initial page size, can be 'all'
  userTotalPages = 1;

  // Columns displayed in the table and sortable. Match these with your user properties.
  // Ensure these properties exist in your user objects.
  displayableUserColumns: string[] = [
    'username',
    'email',
    'first_name',
    'last_name',
    'role',
    'agile_train',
    'scrum_team',
    'status'
    // Add/remove other relevant columns for users here
  ];

  // Sorting properties
  sortUserColumn = '';
  sortUserDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private userService: UserService,
    private modalService: NgbModal, // Inject NgbModal
    private snackBar: MatSnackBar, // Inject MatSnackBar
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.isLoadingModules = true; // Set to true when fetching starts
    this.isLoading = true;
    this.errorMessage = null; // Clear previous list-level error
    this.successMessage = null; // Clear previous list-level success

    this.userService.getUsers().subscribe({
      next: (data) => {
        this.allUsers = data; // Store all users
        this.updateUserTotalPages(); // Calculate total pages based on current data and pageSize
        this.updateDisplayedUsers(); // Apply initial sorting/filtering/pagination
        this.cdr.detectChanges(); // Manually trigger change detection if needed

        // Set to false after a short delay to ensure the loading indicator is visible for a minimum time
        setTimeout(() => {
          this.isLoadingModules = false;
        }, this.MIN_LOADING_DURATION_MS);
      },
      error: (err) => {
        console.error('Failed to fetch users:', err);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.snackBar.open(this.errorMessage, 'Dismiss', { duration: 5000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
        setTimeout(() => {
          this.isLoadingModules = false;
        }, this.MIN_LOADING_DURATION_MS);
      },
      // Use 'add(() => ...)' to ensure isLoading is always set to false at the end
    }).add(() => {
      this.isLoading = false;
    });
  }

  // --- Pagination, Filtering, and Sorting Methods for Users ---

  // Method to update displayed users based on current filters, sort, and pagination
  updateDisplayedUsers() {
    let data = [...this.allUsers]; // Work with a copy

    // 1. Apply Filter (Add a filter property if needed, otherwise it uses all users)
    // For now, we'll skip filtering to keep it simple and focus on pagination/sorting.
    // If you want filtering, you'd add a filterText property and apply it here.

    // 2. Apply Sorting
    if (this.sortUserColumn) {
      data.sort((a: any, b: any) => {
        const aValue = a[this.sortUserColumn];
        const bValue = b[this.sortUserColumn];

        // Handle null/undefined values gracefully: put them at the end
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return this.sortUserDirection === 'asc' ? 1 : -1;
        if (bValue == null) return this.sortUserDirection === 'asc' ? -1 : 1;

        // Perform comparison
        const comparison = String(aValue).localeCompare(String(bValue));
        return this.sortUserDirection === 'asc' ? comparison : -comparison;
      });
    }

    // 3. Apply Pagination
    if (typeof this.userPageSize === 'number') {
      const startIndex = (this.userPage - 1) * this.userPageSize;
      const endIndex = startIndex + this.userPageSize;
      this.displayedUsers = data.slice(startIndex, endIndex);
    } else {
      this.displayedUsers = data; // Show all data if userPageSize is 'all'
    }
  }

  // Handles sorting logic for a given user column
  sortUsers(columnName: string) {
    // Only allow sorting on columns defined in displayableUserColumns
    if (!this.displayableUserColumns.includes(columnName)) {
      console.warn(`Column "${columnName}" is not configured for sorting.`);
      return;
    }

    if (this.sortUserColumn === columnName) {
      // If same column, toggle direction
      this.sortUserDirection = this.sortUserDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // If new column, set to ascending
      this.sortUserColumn = columnName;
      this.sortUserDirection = 'asc';
    }
    this.userPage = 1; // Reset to first page on sort
    this.updateDisplayedUsers();
  }

  // Navigates to a different user page
  onUserPageChange(newPage: number) {
    // Ensure newPage is within valid bounds
    if (newPage >= 1 && newPage <= this.userTotalPages) {
      this.userPage = newPage;
      this.updateDisplayedUsers();
    }
  }

  // Recalculates total pages based on allUsers length and userPageSize
  updateUserTotalPages() {
    if (typeof this.userPageSize === 'number') {
      this.userTotalPages = Math.ceil(this.allUsers.length / this.userPageSize);
    } else {
      this.userTotalPages = 1; // If "All" is selected, there's effectively one page
    }
  }

  // Handles changes in items per page dropdown for users
  onUserPageSizeChange() {
    this.userPage = 1; // Reset to the first page when page size changes
    this.updateUserTotalPages(); // Recalculate total pages based on new size
    this.updateDisplayedUsers(); // Update displayed data
  }

  // Helper method to get the correct sort icon for users
  getUserSortIcon(columnName: string) {
    if (this.sortUserColumn !== columnName) {
      return faUser; // Replace with a default sort icon, e.g., faSort from font-awesome
    }
    return this.sortUserDirection === 'asc' ? faUser : faUser; // Replace with faSortUp/faSortDown
  }

  // --- Pagination Ellipsis Logic for Users ---
  // Controls how many page numbers are shown around the current page
  readonly maxUserPagesToShow = 5;

  // Generates the array of page numbers and ellipses for the user pagination component
  getUserPages(): (number | string)[] {
    if (typeof this.userPageSize !== 'number') {
      return [1]; // Show only '1' for 'All'
    }

    const totalPages = this.userTotalPages;
    const currentPage = this.userPage;
    const pages: (number | string)[] = [];

    // If total pages are few, show all
    if (totalPages <= this.maxUserPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page plus surrounding pages
      const halfMaxPages = Math.floor(this.maxUserPagesToShow / 2);
      let startPage = Math.max(1, currentPage - halfMaxPages);
      let endPage = Math.min(totalPages, currentPage + halfMaxPages);

      // Adjust if we are near the beginning or end to maintain maxPagesToShow
      if (startPage === 1 && endPage < this.maxUserPagesToShow) {
        endPage = this.maxUserPagesToShow;
      } else if (endPage === totalPages && startPage > totalPages - this.maxUserPagesToShow + 1) {
        startPage = totalPages - this.maxUserPagesToShow + 1;
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

  // Handles clicks on user page links, especially the ellipsis
  handleUserPageLinkClick(pageNumberOrEllipsis: number | string): void {
    if (typeof pageNumberOrEllipsis === 'number') {
      this.onUserPageChange(pageNumberOrEllipsis);
    }
    // If it's '...', do nothing for now.
  }


  // Open the UserFormModal in "add" mode
  openAddUserForm(): void {
    const modalRef = this.modalService.open(UserFormModalComponent, { size: 'lg', centered: true });
    // No need to pass 'data' or 'isEditMode' for adding, as it defaults to add mode in the modal.

    modalRef.result.then(
      (result) => {
        // This block is executed when the modal is closed with data (e.g., after successful save)
        if (result === true) { // Check if the modal indicated a successful operation
          this.getUsers(); // Refresh user list after successful add
        }
      },
      (reason) => {
        // This block is executed when the modal is dismissed
        console.log(`Modal dismissed with: ${reason}`);
      }
    );
  }

  // Open the UserFormModal in "edit" mode
  editUser(user: User): void {
    const modalRef = this.modalService.open(UserFormModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.data = user; // Pass the user object to the modal for editing

    modalRef.result.then(
      (result) => {
        if (result === true) {
          this.getUsers(); // Refresh user list after successful edit
        }
      },
      (reason) => {
        console.log(`Modal dismissed with: ${reason}`);
      }
    );
  }

  // Delete a user (this remains largely the same)
  deleteUser(id: number | undefined): void {
    if (id === undefined || !confirm('Are you sure you want to delete this user?')) {
      return;
    }
    // Keep isLoading for the delete action itself
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.snackBar.open('User deleted successfully!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
        this.getUsers(); // Refresh list
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        this.errorMessage = err.error?.message || err.message || 'Failed to delete user.';
        this.snackBar.open(this.errorMessage ?? 'An error occurred.', 'Dismiss', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    }).add(() => {
      this.isLoading = false; // Ensure isLoading is false after the operation
    });
  }
}
