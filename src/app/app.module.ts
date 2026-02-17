import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { MainComponent } from './main/main.component';
import { TopWidgetsComponent } from './dashboard-top-widgets/top-widgets.component';
import { AssetsByMonthComponent } from './dashboard-total-assets-monthly/assets-by-month.component';
import { AssetsByCategoryComponent } from './dashboard-assets-condition/assets-by-category.component';
import { LastFewTransactionsComponent } from './last-few-transactions/last-few-transactions.component';
// import { DashboardWarrantyComponent } from './dashboard-warranty/dashboard-warranty.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChartModule } from 'angular-highcharts';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {AddAssetsComponent} from './add-assets/add-assets.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LayoutComponent } from './layout/layout.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import {MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AssetDetailsComponent } from './asset-details/asset-details.component';
import { NgbModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'; // Import MatSnackBarModule
import { FormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
import { AssetEditModalComponent } from "./asset-edit-modal/asset-edit-modal.component";
import { LicensesComponent } from './licenses/licenses.component';
import { CapitalizeAssetsComponent } from './it-assets/capitalize-assets.component';
import { WarrantyMonitoringComponent } from './warranty-monitoring/warranty-monitoring.component';
import { ThirdPartyItemsComponent } from './third-party-items/third-party-items.component';
import { SpareItemsComponent } from './spare-items/spare-items.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { ImportConfirmationModalComponent } from './import-confirmation-modal/import-confirmation-modal.component';
import { DashboardUsersComponent } from './dashboard-users/dashboard-users.component';
import { SideNavUsersComponent } from './side-nav-users/side-nav-users.component';
import { AccountManagementComponent } from './account-management/account-management.component';
import { UserFormModalComponent } from './user-form-modal/user-form-modal.component';
import { DashboardAssetsAllComponent } from './dashboard-assets-all/dashboard-assets-all.component';
import { MyAssetsComponent } from './my-assets/my-assets.component';
import { ScrumTeamAssetsComponent } from './scrum-team-assets/scrum-team-assets.component';
import { AmberAssetsComponent } from './amber-assets/amber-assets.component';
import { GreenAssetsComponent } from './green-assets/green-assets.component';
import { SpareItemsUsersComponent } from './spare-items-users/spare-items-users.component';
import { LoadingModulesComponent } from './loading-modules/loading-modules.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {WarrantyMonitoringUsersComponent} from "./warranty-monitoring-users/warranty-monitoring-users.component";
import  {DashboardWarrantyComponent} from "./dashboard-warranty/dashboard-warranty.component";
import { ChangePasswordComponent } from './change-password/change-password.component';
import { LicenseFormModalComponent } from './license-form-modal/license-form-modal.component';
import { LicenseDetailsModalComponent } from './license-details-modal/license-details-modal.component';
import { ResetPasswordConfirmComponent } from './reset-password-confirm/reset-password-confirm.component';
















@NgModule({
  declarations: [
    LoginComponent,
    AppComponent,
    HeaderComponent,
    SideNavComponent,
    MainComponent,
    TopWidgetsComponent,
    AssetsByMonthComponent,

    LastFewTransactionsComponent,
    AssetsByCategoryComponent,
    DashboardWarrantyComponent,
    DashboardComponent,
    AssetListComponent,
    AddAssetsComponent,
    LayoutComponent,
    AssetDetailsComponent,
    AssetEditModalComponent,
    LicensesComponent,
    CapitalizeAssetsComponent,
    WarrantyMonitoringComponent,
    ThirdPartyItemsComponent,
    SpareItemsComponent,
    LoadingSpinnerComponent,
    ImportConfirmationModalComponent,
    DashboardUsersComponent,
    SideNavUsersComponent,
    AccountManagementComponent,
    UserFormModalComponent,
    DashboardAssetsAllComponent,
    MyAssetsComponent,
    ScrumTeamAssetsComponent,
    AmberAssetsComponent,
    GreenAssetsComponent,
    SpareItemsUsersComponent,
    LoadingModulesComponent,
    WarrantyMonitoringComponent,
    WarrantyMonitoringUsersComponent,
    ChangePasswordComponent,
    LicenseFormModalComponent,
    LicenseDetailsModalComponent,
    ResetPasswordConfirmComponent,












  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ChartModule,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatSnackBarModule,
    NgbModule,
    FormsModule,
    NgbTypeaheadModule,
    JsonPipe,
    BrowserAnimationsModule,









    RouterModule.forRoot([
      { path: '', component: LoginComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'asset-list', component: AssetListComponent },
      { path: 'licenses', component: LicensesComponent },
      { path: 'capitalize-assets', component: CapitalizeAssetsComponent },
      { path: 'warranty-monitoring', component: WarrantyMonitoringComponent },
      { path: 'third-party-items', component: ThirdPartyItemsComponent },
      { path: 'spare-items', component: SpareItemsComponent },
      { path: 'account-management', component: AccountManagementComponent },
      { path: 'my-assets', component: MyAssetsComponent },
      { path: 'scrum-team-assets', component: ScrumTeamAssetsComponent },
      { path: 'amber-assets', component: AmberAssetsComponent },
      { path: 'green-assets', component: GreenAssetsComponent },
      { path: 'spare-items-users', component: SpareItemsUsersComponent },
      { path: 'warranty-monitoring-users', component: WarrantyMonitoringUsersComponent },

    ]),
                NgbModule
  ],
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(withFetch()), // Add this line

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
