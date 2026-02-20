import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password-confirm',
  standalone: false,
  templateUrl: './reset-password-confirm.component.html',
  styleUrls: ['./reset-password-confirm.component.scss']
})
export class ResetPasswordConfirmComponent implements OnInit {
  form: FormGroup;
  token: string = '';
  loading = false;

  // UI States for password visibility toggles
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Initialize form with a custom validator at the group level
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];

    // Slight UX improvement: don't redirect immediately, show the error state on the screen
    // or disable the form, but redirection works too.
    if (!this.token) {
      this.showSnack('Invalid or missing reset token.', 'error');
      this.router.navigate(['/login']);
    }
  }

  // Custom Validator for matching passwords
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      // Set error on the logic, but usually we want to display it on the confirm field
      return { notSame: true };
    }
    return null;
  };

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    // Disable form while loading
    this.form.disable();

    this.authService.confirmPasswordReset(this.token, this.form.value.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.showSnack(res.message || 'Password reset successful!', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.form.enable();
        const msg = err.error?.error || 'Error resetting password. Link may have expired.';
        this.showSnack(msg, 'error');
      }
    });
  }

  // Helper for consistent snackbar styling
  private showSnack(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: type === 'error' ? ['mat-toolbar', 'mat-warn'] : ['mat-toolbar', 'mat-primary'],
      verticalPosition: 'top'
    });
  }
}
