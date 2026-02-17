import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password-confirm',
  standalone: false, // Set to true if this is a standalone component
  template: `
    <div class="container d-flex align-items-center justify-content-center vh-100">
      <div class="card w-100" style="max-width: 400px;">
        <div class="card-body p-4">
          <h2 class="text-center text-primary mb-4">Set New Password</h2>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label class="form-label">New Password</label>
              <input type="password" class="form-control" formControlName="password" placeholder="Enter new password">
            </div>
            <div class="mb-3">
              <label class="form-label">Confirm Password</label>
              <input type="password" class="form-control" formControlName="confirmPassword" placeholder="Confirm new password">
            </div>

            <div class="d-grid">
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
                {{ loading ? 'Resetting...' : 'Reset Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordConfirmComponent implements OnInit {
  form: FormGroup;
  token: string = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Get token from URL
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.snackBar.open('Invalid password reset link.', 'Close', { duration: 5000 });
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.snackBar.open('Passwords do not match.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.authService.confirmPasswordReset(this.token, this.form.value.password).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'Close', { duration: 5000 });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.error || 'Error resetting password.';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      }
    });
  }
}
