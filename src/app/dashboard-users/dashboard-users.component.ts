import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../auth.service'; // Import AuthService

@Component({
  selector: 'app-dashboard-users',
  standalone: false,
  templateUrl: './dashboard-users.component.html',
  styleUrl: './dashboard-users.component.scss'
})
export class DashboardUsersComponent {
  isLoadingModules: boolean = false;
  private readonly MIN_LOADING_DURATION_MS = 1500;
  currentYear: number = new Date().getFullYear();

  // Inject AuthService
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoadingModules = true;
    // Simulate loading modules, actual data fetching is done by child components
    setTimeout(() => {
      this.isLoadingModules = false;
    }, this.MIN_LOADING_DURATION_MS);
  }

  // Method to get the user's Agile Release Train (optional, if you want to display it)
  getUserAgileTrain(): string | null {
    return this.authService.currentUserAgileTrain;
  }
}
