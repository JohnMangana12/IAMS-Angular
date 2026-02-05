import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Subscription, tap } from 'rxjs'; // Import tap
import { timer } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'PSS Tech IMS';
    isLoading: boolean = true;
    private loadingSubscription: Subscription | undefined;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.loadingSubscription = this.authService.isLoading$.subscribe(loading => {
            console.log('AuthService isLoading:', loading); // <-- Add this
            if (!loading) {
                // Start a 2-second timer to hide the loader
                timer(500).subscribe(() => {
                    console.log('Hiding loader after .5 seconds'); // <-- Add this
                    this.isLoading = false;
          });
            } else {
              this.isLoading = true; // Ensure it's shown if auth service says so
            }
});
    }

    ngOnDestroy(): void {
        if (this.loadingSubscription) {
            this.loadingSubscription.unsubscribe();
        }
    }
}
