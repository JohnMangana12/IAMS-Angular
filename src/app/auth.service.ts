import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from './models/user'; // <--- Ensure correct path to your User model

// IMPORTANT: Adjust UserResponse to use the imported User model.
interface UserResponse {
  message: string;
  user?: User; // Use the imported User interface
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isLoggedIn = false;
  private _currentUserRoleSubject = new BehaviorSubject<string | null>(null);
  public currentUserRole$: Observable<string | null> = this._currentUserRoleSubject.asObservable();

  private _currentUsername: string | null = null;
  private _currentUserAgileTrain: string | null = null;

  // *** NEW PROPERTY ***
  private _requiresPasswordChange = false;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    if (typeof localStorage !== 'undefined') {
      const storedRole = localStorage.getItem('userRole');
      const storedLoggedIn = localStorage.getItem('isLoggedIn');
      const storedUsername = localStorage.getItem('username');
      const storedAgileTrain = localStorage.getItem('userAgileTrain');
      // *** NEW: Load password change flag from localStorage ***
      const storedPasswordChange = localStorage.getItem('requiresPasswordChange');
      this._requiresPasswordChange = storedPasswordChange === 'true';

      // Check for valid session data
      if (storedLoggedIn === 'true' && storedRole && storedUsername && storedAgileTrain !== null) {
        this._isLoggedIn = true;
        this._currentUserRoleSubject.next(storedRole);
        this._currentUsername = storedUsername;
        this._currentUserAgileTrain = storedAgileTrain === 'null' ? null : storedAgileTrain;
        console.log('AuthService: Initializing with stored role:', storedRole);
      } else {
        console.log('AuthService: No valid session found in localStorage.');
        this._isLoggedIn = false;
        this._currentUserRoleSubject.next(null);
        this._currentUsername = null;
        this._currentUserAgileTrain = null;
        this._requiresPasswordChange = false; // Reset the flag too
      }
    }
  }

  get isLoggedIn(): boolean {
    return this._isLoggedIn;
  }

  // *** NEW GETTER ***
  get requiresPasswordChange(): boolean {
    return this._requiresPasswordChange;
  }

  // Direct getter for currentUserRole for backward compatibility
  get currentUserRole(): string | null {
    return this._currentUserRoleSubject.value;
  }

  get currentUsername(): string | null {
    return this._currentUsername;
  }

  get currentUserAgileTrain(): string | null {
    return this._currentUserAgileTrain === 'null' ? null : this._currentUserAgileTrain;
  }

 // *** UPDATED METHOD: Added http://localhost:3000 ***
  changePassword(username: string, currentPassword: string, newPassword: string): Observable<any> {
    const body = { username, currentPassword, newPassword };

    // FIX: Point to the backend port 3000
    return this.http.post('http://localhost:3000/change-password', body)
      .pipe(
        map(response => {
          this._requiresPasswordChange = false;
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('requiresPasswordChange', 'false');
          }
          return response;
        })
      );
  }
// *** END NEW METHOD ***


 // *** UPDATED METHOD: Added http://localhost:3000 ***
  login(username: string, password: string): Observable<boolean> {
    this.loadingSubject.next(true);

    // FIX: Point to the backend port 3000
    return this.http.post<UserResponse>('http://localhost:3000/login', { username, password })
      .pipe(
        map(response => {
          if (response.user) {
            this._isLoggedIn = true;
            this._currentUserRoleSubject.next(response.user.role || null);
            this._currentUsername = response.user.username;
            this._currentUserAgileTrain = response.user.agile_train || null;
            this._requiresPasswordChange = response.user.requiresPasswordChange === true;

            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('userRole', response.user.role || '');
              localStorage.setItem('username', response.user.username);
              localStorage.setItem('userAgileTrain', response.user.agile_train === null ? 'null' : response.user.agile_train || '');
              localStorage.setItem('requiresPasswordChange', this._requiresPasswordChange.toString());
            }
            this.loadingSubject.next(false);
            return true;
          } else {
            this.logout();
            this.loadingSubject.next(false);
            return false;
          }
        }),
        catchError((error) => {
          console.error('Login API error:', error);
          this.logout();
          this.loadingSubject.next(false);
          return of(false);
        })
      );
  }

  logout(): void {
    this._isLoggedIn = false;
    this._currentUserRoleSubject.next(null);
    this._currentUsername = null;
    this._currentUserAgileTrain = null;
    this._requiresPasswordChange = false; // Always reset on logout

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      localStorage.removeItem('userAgileTrain');
      localStorage.removeItem('requiresPasswordChange'); // Remove the flag
    }
    this.router.navigate(['/login']);
  }
}
