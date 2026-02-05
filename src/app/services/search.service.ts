// search.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable, debounceTime, distinctUntilChanged, switchMap, tap, of, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http'; // Import HttpClient

export interface Asset {
  id: number; // Assuming your assets have an ID
  AssetTag: string;
  Description: string;
  SerialNumber: string;
  Location: string;
  AssetCondition: string;
  Specification: string;
  GroupAssetCategory: string;
  PoNumber: string;
  Warranty: Date;
  DateAcquired: Date;
  CheckoutTo: string;
  AssetCategory: string;
  CostCenter: string;
  ScrumTeam: string;
  AgileReleaseTrain: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchTermSubject = new Subject<string>();
  private searchResultsSubject = new Subject<Asset[]>();

  searchTerm$: Observable<string> = this.searchTermSubject.asObservable();
  searchResults$: Observable<Asset[]> = this.searchResultsSubject.asObservable();

  private apiUrl = 'http://localhost:3000/assets';

  constructor(private http: HttpClient) {
    this.searchTermSubject
      .pipe(
        debounceTime(300), // Wait for 300ms pause in typing
        distinctUntilChanged(), // Only emit if the term has changed
        switchMap(term => { // Switch to a new observable for each term, canceling previous requests
          if (!term.trim()) {
            return of([]); // Emit an empty array immediately
          }
          // Call the performSearch method with the term
          // We'll be sending a parameter that the backend can interpret to search multiple fields.
          return this.performSearch(term);
        }),
        catchError(error => { // Catch any errors from the stream (e.g., API errors)
          console.error('Error in search stream:', error);
          // Emit a specific error message to the header component
          this.searchResultsSubject.error({ message: 'Failed to load search results. Please try again.' });
          return of([]); // Return an empty array on error to prevent breaking the stream
        })
      )
      .subscribe(results => {
        this.searchResultsSubject.next(results); // Emit the fetched results
      });
  }

  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  clearSearchTerm(): void {
    this.searchTermSubject.next('');
    this.searchResultsSubject.next([]);
  }

  private performSearch(term: string): Observable<Asset[]> {
    // *** MODIFICATION HERE ***
    // We are now sending a 'search' query parameter.
    // The backend will be responsible for searching across AssetTag, Description, and SerialNumber.
    return this.http.get<Asset[]>(`${this.apiUrl}?search=${encodeURIComponent(term)}`).pipe(
      tap(results => console.log(`Search results for "${term}":`, results)), // Log results for debugging
      catchError(error => { // Handle API call specific errors
        console.error(`Error fetching search results for "${term}":`, error);
        // You can return a more specific error here if needed
        // For now, we'll let the main catchError in the pipe handle the error notification
        return of([]); // Return empty array on API error
      })
    );
  }

  getAssetById(assetId: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.apiUrl}/${assetId}`);
  }
}
