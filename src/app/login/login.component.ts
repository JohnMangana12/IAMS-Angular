import { Component, OnInit, TemplateRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false; // Added loading state for button feedback
  hidePassword = true; // Toggle for password visibility
  resetUsernameStr: string = '';

  // Data for Autocomplete
  usernames: string[] = []; // Example usernames, ideally fetched from an API
  filteredUsernames!: Observable<string[]>;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private modalService: NgbModal
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.redirectToCorrectDashboard();
    }

    // Setup Material Autocomplete filter logic
    this.filteredUsernames = this.form.get('username')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  // Filter logic for Autocomplete
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.usernames.filter(option => option.toLowerCase().includes(filterValue));
  }

  login() {
    if (this.form.invalid) return;

    this.loading = true; // Start loading
    this.form.disable();

    this.authService.login(
      this.form.value.username,
      this.form.value.password
    ).pipe(
      catchError(err => {
        console.error('Login error:', err);
        this.showSnack('An error occurred. Please try again.', 'error');
        this.form.enable();
        this.loading = false;
        return of(false);
      })
    ).subscribe(success => {
      this.loading = false;
      if (success) {
        this.redirectToCorrectDashboard();
      } else {
        this.showSnack('Invalid username or password', 'error');
        this.form.enable();
      }
    });
  }

  openResetModal(content: TemplateRef<any>) {
    this.resetUsernameStr = '';
    this.modalService.open(content, { centered: true, backdropClass: 'light-backdrop' });
  }

  confirmReset(modal: any) {
    if (!this.resetUsernameStr) {
      this.showSnack('Please enter a username.', 'warning');
      return;
    }

    this.authService.requestPasswordReset(this.resetUsernameStr).pipe(
      catchError(err => {
        const errorMsg = err.error?.error || 'Failed to send reset link.';
        this.showSnack(errorMsg, 'error');
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        modal.close();
        this.showSnack(response.message, 'success');
      }
    });
  }

  private redirectToCorrectDashboard(): void {
    if (this.authService.requiresPasswordChange) {
      this.router.navigateByUrl('/change-password');
      return;
    }

    const userRole = this.authService.currentUserRole;
    if (userRole === 'admin') {
      this.router.navigateByUrl('/dashboard');
    } else if (userRole === 'viewer' || userRole === 'user') {
      this.router.navigateByUrl('/dashboard-users');
    } else {
      this.showSnack('Role not recognized. Contact support.', 'warning');
      this.authService.logout();
    }
  }

  // Helper for cleaner snackbar calls
  private showSnack(message: string, type: 'success' | 'error' | 'warning') {
    let panelClass = ['mat-toolbar'];
    if (type === 'error') panelClass.push('mat-warn');
    if (type === 'success') panelClass.push('mat-primary');
    if (type === 'warning') panelClass.push('mat-accent'); // or custom css

    this.snackBar.open(message, 'Close', {
      duration: 5000,
      verticalPosition: 'top',
      panelClass: panelClass
    });
  }
}
