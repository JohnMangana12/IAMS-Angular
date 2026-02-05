import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service'; // Adjust path as necessary
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {

  changePasswordForm: FormGroup;
  username: string | null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.username = this.authService.currentUsername;

    // Safety check: Ensure the user is logged in AND requires a password change
    if (!this.authService.isLoggedIn || !this.authService.requiresPasswordChange || !this.username) {
      // Redirect to dashboard or login if conditions aren't met
      if(this.authService.isLoggedIn) {
        this.router.navigate(['/dashboard']); // or /dashboard-users
      } else {
        this.router.navigate(['/login']);
      }
    }

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required], // This is the OTP/default password
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const newPass = form.get('newPassword');
    const confirmPass = form.get('confirmPassword');

    if (newPass!.value && confirmPass!.value && newPass!.value !== confirmPass!.value) {
      confirmPass?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      confirmPass?.setErrors(null);
      return null;
    }
  }

  changePassword() {
    this.changePasswordForm.markAllAsTouched();
    if (this.changePasswordForm.invalid) {
      this.snackBar.open('Please check your entries. New passwords must match and be at least 8 characters.', 'Close', { duration: 3000, panelClass: ['warning-snackbar'] });
      return;
    }

    this.changePasswordForm.disable();

    const currentPassword = this.changePasswordForm.value.currentPassword;
    const newPassword = this.changePasswordForm.value.newPassword;

    this.authService.changePassword(this.username!, currentPassword, newPassword)
      .pipe(
        catchError(err => {
          console.error('Password change error:', err);
          let errorMessage = 'Failed to change password. Check your current password (OTP) or if the new password meets security requirements.';
          if (err.error && err.error.error) {
             errorMessage = err.error.error;
          }
          this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          this.changePasswordForm.enable();
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.snackBar.open('Password changed successfully! Redirecting to dashboard.', 'Close', { duration: 5000, panelClass: ['success-snackbar'] });
          // Redirect to the appropriate dashboard after successful change
          const userRole = this.authService.currentUserRole;
          if (userRole === 'admin') {
            this.router.navigateByUrl('/dashboard');
          } else {
            this.router.navigateByUrl('/dashboard-users');
          }
        }
      });
  }
}
