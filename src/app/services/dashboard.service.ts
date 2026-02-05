import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Existing interface
export interface DashboardStats {
  servers: number;
  desktops: number;
  deltaV: number;
  laptops: number;
}

// Interface for the data returned by the new endpoint
export interface AssetConditionData {
  name: string; // e.g., 'Good', 'Defective'
  y: number;    // The count
}

// NEW INTERFACE for our chart data (if you want to strictly type it)
export interface AssetMonthlyData {
  servers: number[];
  desktops: number[];
  deltaV: number[];
}

// NEW Interface for individual category warranty counts
export interface WarrantyCategoryCounts {
    hasWarranty: number,
    noWarranty: number,
}

//NEW Interface for WarrantyCounts(MODIFIED)
export interface WarrantyCounts {
  laptop: WarrantyCategoryCounts;
  desktop: WarrantyCategoryCounts;
  workstation: WarrantyCategoryCounts;
  server: WarrantyCategoryCounts;

}


//New interface for yearly asset data
export interface AssetYearlyData {
  years: {
    year: number;
    totalCount: number;
    // Add other counts if your new endpoint returns them, e.g.:
    // serverCount?: number;
    // desktopCount?: number;
    // deltaVCount?: number;
  }[];
}
// NEW Interface for a single Asset, matching your asset.model.ts
export interface Asset {
  id: number;
  AssetTag: string;
  Description: string | null; // Allow null as per your models, though your model has string
  Location: string | null; // Allow null as per your models
  SerialNumber: string | null; // Allow null
  AssetCondition: string;
  Specification: string;
  GroupAssetCategory: string;
  PoNumber: string;
  Warranty: string | null; // Date string or null
  DateAcquired: string | null;
  CheckoutTo: string | null;
  AssetCategory: string;
  CostCenter: string;
  ScrumTeam: string | null; // Allow null based on your User interface and general data
  AgileReleaseTrain: string | null; // Allow null
  // Add any other properties your assets have that are relevant
}




@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/assets/summary`);
  }

  getAssetsByMonth(): Observable<AssetMonthlyData> {
    return this.http.get<AssetMonthlyData>(`${this.baseUrl}/assets/by-month`);
  }

  getAssetsByCondition(): Observable<AssetConditionData[]> {
    return this.http.get<AssetConditionData[]>(`${this.baseUrl}/assets/by-condition`);
  }

  // NEW METHOD to get warranty counts  - return type is now the modified WarrantyCounts
  getWarrantyStatus(): Observable<WarrantyCounts> {
      return this.http.get<WarrantyCounts>(`${this.baseUrl}/assets/warranty-status`);
  }
   // NEW METHOD to get assets by year
  getAssetsByYear(): Observable<AssetYearlyData> {
    return this.http.get<AssetYearlyData>(`${this.baseUrl}/assets/by-year`); // New endpoint
  }
   // NEW METHOD: To fetch all assets or filter them.
  getAssets(agileReleaseTrain?: string): Observable<Asset[]> {
    let url = `${this.baseUrl}/assets`;
    if (agileReleaseTrain) {
      url += `?AgileReleaseTrain=${encodeURIComponent(agileReleaseTrain)}`;
    }
    return this.http.get<Asset[]>(url);
  }


}

