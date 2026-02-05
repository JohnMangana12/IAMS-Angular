import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

  // === NEW LOGIC: Check for mandatory password change first ===
    // This check is the most critical part of the new flow.
    if (this.authService.isLoggedIn && this.authService.requiresPasswordChange) {
        // Allow access to the /change-password route itself
        if (state.url.includes('/change-password')) {
            return true;
        }

        // Redirect to /change-password if logged in, flag is set, and trying to access any other route
        console.warn('Access denied: Mandatory password change required.');
        return this.router.createUrlTree(['/change-password']);
    }
    // ==========================================================

    if (this.authService.isLoggedIn) {
      // If we reach this point, the user is logged in AND does NOT require a password change.

      // Optionally, check for required roles for this route
      const requiredRoles = route.data['roles'] as Array<string>;
      if (requiredRoles && requiredRoles.length > 0) {
        if (this.authService.currentUserRole && requiredRoles.includes(this.authService.currentUserRole)) {
          return true; // User is logged in and has the required role
        } else {
          // User is logged in but doesn't have the required role
          console.warn('Access denied: Role mismatch');
          // Redirect to a general dashboard or an error page
          if (this.authService.currentUserRole === 'admin') {
            return this.router.createUrlTree(['/dashboard']); // Example: Admin dashboard
          } else {
            return this.router.createUrlTree(['/dashboard-users']); // Example: User dashboard
          }
        }
      }
      return true; // User is logged in and no specific role is required for this route
    } else {
      // Not logged in, redirect to login page
      this.router.navigate(['login']);
      return false;
    }
  }
}
