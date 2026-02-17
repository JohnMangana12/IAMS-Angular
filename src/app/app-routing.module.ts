import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard'; // Used to check if user is logged in
import { ChangePasswordComponent } from './change-password/change-password.component'; // <--- NEW IMPORT

// Import your two main dashboard shell components
import { DashboardComponent } from './dashboard/dashboard.component'; // For admin
import { DashboardUsersComponent } from './dashboard-users/dashboard-users.component'; // For viewer/user

// Import the new guard
import { ArtGuard } from './services/art.guard';

// Import your specific asset components
import { AmberAssetsComponent } from './amber-assets/amber-assets.component';
import { GreenAssetsComponent } from './green-assets/green-assets.component';

import { AssetListComponent } from './asset-list/asset-list.component';
import { LayoutComponent } from './layout/layout.component';
import { MyAssetsComponent } from './my-assets/my-assets.component';

// --- Import your Asset Detail Component ---
import { AssetDetailsComponent } from './asset-details/asset-details.component';
import { ResetPasswordConfirmComponent } from './reset-password-confirm/reset-password-confirm.component';

const routes: Routes = [
  { path: 'reset-password-confirm', component: ResetPasswordConfirmComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // *** NEW ROUTE FOR PASSWORD CHANGE ***
  { path: 'change-password', component: ChangePasswordComponent },
  // *** END NEW ROUTE ***

  // Admin Dashboard Branch
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      // ... admin children ...
    ]
  },

  // Viewer/User Dashboard Branch
  {
    path: 'dashboard-users',
    component: DashboardUsersComponent,
    canActivate: [AuthGuard], // Main guard for the shell
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Default child path for viewer/user

      // --- Add the new routes as children here ---
      {
        path: 'amber-assets',
        component: AmberAssetsComponent,
        canActivate: [ArtGuard],
        data: { expectedArt: 'Amber' }
      },
      {
        path: 'green-assets',
        component: GreenAssetsComponent,
        canActivate: [ArtGuard],
        data: { expectedArt: 'Green' }
      },

      // --- NEW ROUTE FOR ASSET DETAIL ---
      // This route will capture either an asset ID or an asset tag.
      // We'll use AssetTag for the header search link as per the previous suggestion.
      // Make sure your AssetDetailComponent handles either an ID or AssetTag,
      // or create a specific route if you only intend to use one.
      // Using AssetTag in the route for header search:
      {
        path: 'assets/view/:assetTag', // Route to view a specific asset by its Tag
        component: AssetDetailsComponent,
        canActivate: [AuthGuard] // Ensure the user is logged in to view asset details
      },
      // If you want to fetch by ID instead, you'd use:
      // {
      //   path: 'assets/view/:assetId',
      //   component: AssetDetailComponent,
      //   canActivate: [AuthGuard]
      // },
      // --- END OF NEW ROUTE ---

      // Other user dashboard children like 'asset-list', 'my-assets', etc. would go here.
      // { path: 'asset-list', component: AssetListComponent },
      // { path: 'my-assets', component: MyAssetsComponent },
    ]
  },
  // If you have other top-level routes that are not inside a dashboard shell,
  // they would go here directly.
  // e.g., { path: 'some-other-page', component: SomeOtherComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
