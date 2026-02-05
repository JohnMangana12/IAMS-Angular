import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service'; // Adjust path as necessary
import { Router } from '@angular/router';
import { SearchService, Asset } from '../services/search.service'; // Adjust path as necessary
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'; // Import both NgbModal and NgbModalRef
import { AssetDetailsComponent } from '../asset-details/asset-details.component'; // Adjust path as necessary
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  searchResults: Asset[] = [];
  private searchSubscription: Subscription | undefined;
  private blurTimeout: any;
  isLoading: boolean = false;
  searchError: string | null = null;

  isInputFocused: boolean = false; // New: To track input focus for animation

  private currentModalRef: NgbModalRef | null = null;

  constructor(
    public authService: AuthService,
    private searchService: SearchService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchService.searchResults$.subscribe(
      (results) => {
        this.searchResults = results;
        this.isLoading = false;
        this.searchError = null;
      },
      (error) => {
        console.error('Error fetching search results:', error);
        this.searchError = 'Failed to load search results. Please try again.';
        this.searchResults = [];
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
    if (this.currentModalRef) {
      this.currentModalRef.close();
      this.currentModalRef = null;
    }
  }

  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement.value;

    if (!this.searchTerm.trim()) {
      this.searchService.clearSearchTerm();
      this.searchResults = [];
      this.isLoading = false;
      this.searchError = null;
    } else {
      this.isLoading = true;
      this.searchError = null;
      this.searchService.setSearchTerm(this.searchTerm.trim().toLowerCase());
    }
  }

  onSearchInputBlur(event: FocusEvent): void {
    this.isInputFocused = false; // Lose focus

    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
    this.blurTimeout = setTimeout(() => {
      const relatedTarget = event.relatedTarget as HTMLElement;
      const searchResultsDropdown = document.querySelector('.search-results-dropdown') as HTMLElement;

      if (
        relatedTarget &&
        searchResultsDropdown &&
        !searchResultsDropdown.contains(relatedTarget)
      ) {
        this.searchResults = [];
        // Optionally clear the searchTerm and service state
        // this.searchTerm = '';
        // this.searchService.clearSearchTerm();
      } else if (!relatedTarget) {
        // Focus is completely lost
        this.searchResults = [];
        // this.searchTerm = '';
        // this.searchService.clearSearchTerm();
      }
    }, 150);
  }

  onSearchInputFocus(): void {
    this.isInputFocused = true; // Gain focus
  }

  onResultMouseDown(): void {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
  }

  openAssetDetails(asset: Asset): void {
    if (this.currentModalRef) {
      this.currentModalRef.close();
    }

    this.searchResults = [];
    this.searchTerm = '';
    this.searchService.clearSearchTerm();

    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }

    const modalRef = this.modalService.open(AssetDetailsComponent, { size: 'lg', centered: true });
    const assetDetailsComponentInstance = modalRef.componentInstance as AssetDetailsComponent;
    assetDetailsComponentInstance.asset = asset;
    this.currentModalRef = modalRef;

    this.currentModalRef.result.then(
      () => {},
      () => {}
    ).finally(() => {
      if (this.currentModalRef === modalRef) {
        this.currentModalRef = null;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
