import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core'; // Added TemplateRef, ViewChild
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Import NgbModal

// If you are using NgbTypeahead, ensure you have imported NgbModule
// in your AppModule or the module where this component is declared.
// For example, if this is a standalone component:
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule } from '@angular/forms';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  // If this is a standalone component, uncomment the 'imports' array:
  // imports: [CommonModule, ReactiveFormsModule, NgbModule],
   standalone: false, // Or false if declared in a module
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  // Consider fetching usernames from an API for typeahead if possible, otherwise keep this static list
  usernames: string[] = ['admin@emerson.com', 'viewer@emerson.com', 'johnnoel.mangana@emerson.com', 'user1']; // Static list for typeahead
  model: any; // For typeahead, not directly used in login logic
  // Variable for the reset password modal input
  resetUsernameStr: string = '';


  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar, // Inject MatSnackBar
    private modalService: NgbModal // Inject NgbModal
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // If user is already logged in, redirect them to the correct dashboard based on role
    if (this.authService.isLoggedIn) {
      this.redirectToCorrectDashboard();
    }
  }

  login() {
    if (this.form.invalid) {
      // Optionally show a snackbar for incomplete form
      this.snackBar.open('Please fill in both username and password.', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return; // Prevent login if form is invalid
    }

    this.form.disable(); // Disable form to prevent multiple submissions

    this.authService.login(
      this.form.value.username,
      this.form.value.password
    ).pipe(
      catchError(err => {
        console.error('Login observable error:', err);
        this.snackBar.open('An error occurred during login. Please try again later.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.form.enable(); // Re-enable form on error
        return of(false); // Ensure the observable completes with a value
      })
    ).subscribe(success => {
      if (success) {
        this.redirectToCorrectDashboard();
      } else {
        this.snackBar.open('Invalid username or password', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.form.enable(); // Re-enable form on error
      }
    });
  }
  // *** NEW METHODS FOR RESET PASSWORD ***

  openResetModal(content: TemplateRef<any>) {
    this.resetUsernameStr = ''; // Clear previous input
    this.modalService.open(content, { centered: true });
  }

  confirmReset(modal: any) {
    if (!this.resetUsernameStr) {
      this.snackBar.open('Please enter a username.', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    this.authService.resetUserPassword(this.resetUsernameStr).pipe(
      catchError(err => {
        console.error('Reset error', err);
        const errorMsg = err.error && err.error.error ? err.error.error : 'Failed to reset password.';
        this.snackBar.open(errorMsg, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        // Close the modal
        modal.close();

        // Show success message (In a real app, you'd say "Check your email".
        // Here we show the temp password for demonstration/internal usage).
        alert(response.message);
      }
    });
  }


  private redirectToCorrectDashboard(): void {
    // *** NEW CHECK: Redirect to change password component if required ***
    if (this. authService.requiresPasswordChange) {
      this.router.navigateByUrl('/change-password');
      return;

    }
    // *** END NEW CHECK ***
    const userRole = this.authService.currentUserRole;
    if (userRole === 'admin') {
      this.router.navigateByUrl('/dashboard');
    } else if (userRole === 'viewer' || userRole === 'user') {
      this.router.navigateByUrl('/dashboard-users');
    } else {
      console.warn('Login successful but unexpected user role:', userRole);
      this.snackBar.open('Your role is not recognized. Please contact support.', 'Close', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
      this.authService.logout(); // Log out if role is invalid
    }
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? []
        : this.usernames.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
}
