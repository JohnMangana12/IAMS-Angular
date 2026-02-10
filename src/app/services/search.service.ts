import { Injectable } from '@angular/core';
import { Subject, Observable, debounceTime, distinctUntilChanged, switchMap, tap, of, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Asset {
  id: number;
  AssetTag: string;
  Description: string;
  SerialNumber: string;
  EmersonPartNumber: string; // Added
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
  Comments: string; // Added
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
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
          if (!term.trim()) {
            return of([]);
          }
          return this.performSearch(term);
        }),
        catchError(error => {
          console.error('Error in search stream:', error);
          this.searchResultsSubject.error({ message: 'Failed to load search results. Please try again.' });
          return of([]);
        })
      )
      .subscribe(results => {
        this.searchResultsSubject.next(results);
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
    return this.http.get<Asset[]>(`${this.apiUrl}?search=${encodeURIComponent(term)}`).pipe(
      tap(results => console.log(`Search results for "${term}":`, results)),
      catchError(error => {
        console.error(`Error fetching search results for "${term}":`, error);
        return of([]);
      })
    );
  }

  getAssetById(assetId: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.apiUrl}/${assetId}`);
  }
}
