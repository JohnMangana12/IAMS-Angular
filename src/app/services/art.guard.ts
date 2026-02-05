import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ArtGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Get the expected ART from the route data
    const expectedArt = route.data['expectedArt'] as string; // e.g., 'Amber' or 'Green'

    // First, ensure the user is logged in. If not, redirect to login.
    if (!this.authService.isLoggedIn) {
      return this.router.createUrlTree(['http://localhost:3000/login']);
    }

    const currentUserArt = this.authService.currentUserAgileTrain;

    // Check if the user's ART matches the ART required for this route
    if (currentUserArt === expectedArt) {
      // User's ART matches the expected ART for this route, allow access
      return true;
    } else {
      // User's ART does not match.
      // Redirect them to a safe page where they have access, or a default page.
      console.warn(`User ART mismatch: Expected ${expectedArt}, but got ${currentUserArt}. Redirecting.`);

      // Redirect to a default ART view, or a general dashboard/asset list.
      // For instance, if they are 'Amber' and try to go to Green, redirect them to Amber.
      if (currentUserArt) {
          return this.router.createUrlTree([`/${currentUserArt.toLowerCase()}-assets`]);
      } else {
          // If for some reason currentUserArt is null/undefined, redirect to a safe default.
          return this.router.createUrlTree(['/assets']); // Or some other fallback
      }
    }
  }
}
