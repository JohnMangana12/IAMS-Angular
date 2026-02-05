import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Add this import


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    standalone: false
})
export class DashboardComponent {
  isLoadingModules: boolean = false;
  private readonly MIN_LOADING_DURATION_MS = 1500; // Set your desired minimum duration
   // Footer year
   currentYear: number = new Date().getFullYear();

 ngOnInit(): void {
    this.isLoadingModules = true;
    setTimeout(() => {
      this.isLoadingModules = false;
    }, this.MIN_LOADING_DURATION_MS);

  }
}
