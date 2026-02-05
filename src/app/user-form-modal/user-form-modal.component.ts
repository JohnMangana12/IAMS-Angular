import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../models/user'; // Adjust path as per your project structure
import { UserService } from '../services/user.service'; // Adjust path
import { CommonModule } from '@angular/common'; // Needed for *ngIf, pipe
import { MatSnackBar } from '@angular/material/snack-bar'; // For snackbar messages

@Component({
  selector: 'app-user-form-modal',
  standalone: false,
  templateUrl: './user-form-modal.component.html',
  styleUrl: './user-form-modal.component.scss'
})
export class UserFormModalComponent implements OnInit {
  @Input() data: User | null = null; // Input to receive user data for editing
  userForm: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  roles: string[] = ['user', 'admin'];
  statuses: string[] = ['active', 'inactive', 'suspended'];
  scrumTeams: string[] = ['Luna', 'TTP', 'System Architect', 'EdgeOps', 'Hydra', 'Diwata', 'Wyvern', 'SI', 'Infra', 'DevOps', 'Atlantis', 'Guardian', 'MSP', 'SE', 'Alliance', 'UX', 'CyberSecurity', 'Tech Docs', 'Scrum Leader', 'Product Owner', 'Release Train Leader', 'Manager', 'Director'];
  agileReleaseTrains: string[] = ['Amber', 'Green', 'Orange', 'Shared Services'];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      role: ['user', Validators.required],
      agile_train: ['', Validators.required],
      scrum_team: ['', Validators.required],
      status: ['active', Validators.required],
      // Add password field for creation. For editing, you might not want to show/edit this.
      // We'll handle it such that it's only sent if it's being set during creation.
      password: ['', Validators.required] // Initially empty, can add validators like MinLength if needed
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      // Patch the form with the received data for editing
      // Do NOT patch the password here if you don't want to display it for editing.
      this.userForm.patchValue({
        username: this.data.username,
        email: this.data.email,
        first_name: this.data.first_name,
        last_name: this.data.last_name,
        role: this.data.role,
        agile_train: this.data.agile_train,
        scrum_team: this.data.scrum_team,
        status: this.data.status,
      });
      // Disable the password field if editing, as it's not intended to be changed here
      this.userForm.get('password')?.disable();
    }
  }

  saveUser(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.userForm.invalid) {
      this.errorMessage = 'Please fill in all required fields and ensure the email is valid.';
      this.snackBar.open(this.errorMessage, 'Dismiss', { duration: 3000, panelClass: ['error-snackbar'] });
      this.isLoading = false;
      return;
    }

    const userData: User = this.userForm.value;

    if (this.isEditMode && this.data?.id !== undefined) {
      // Update existing user
      const userToUpdate: User = { ...userData, id: this.data.id };
      // When updating, we typically don't send the password unless it's a password change endpoint
      delete userToUpdate.password; // Remove password from update payload

      this.userService.updateUser(userToUpdate).subscribe({
        next: () => {
          this.snackBar.open('User updated successfully!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
          this.activeModal.close(true);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || err.message || 'Failed to update user.';
          this.snackBar.open(this.errorMessage ?? 'An error occurred.', 'Dismiss', { duration: 5000, panelClass: ['error-snackbar'] });
          console.error('Failed to update user:', err);
          this.isLoading = false;
        }
      });
    } else {
      // Create new user
      // Only send the password if it has a value and is not disabled (i.e., during creation)
      const newUser: User = { ...userData };
      if (!this.userForm.get('password')?.disabled && newUser.password) {
        // The backend will hash the password
      } else {
        delete newUser.password; // Remove password if not provided during creation or if form is in edit mode
      }

      this.userService.createUser(newUser).subscribe({
        next: () => {
          this.snackBar.open('User created successfully!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
          this.activeModal.close(true);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || err.message || 'Failed to create user.';
          this.snackBar.open(this.errorMessage ?? 'An error occurred.', 'Dismiss', { duration: 5000, panelClass: ['error-snackbar'] });
          console.error('Failed to create user:', err);
          this.isLoading = false;
        }
      });
    }
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }
}
