import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset } from '../models/asset.model'; // Assuming you have this

@Injectable({
  providedIn: 'root'
})
export class AssetService {
   private apiUrl = 'http://localhost:3000/assets';
   private licensesUrl = 'http://localhost:3000/licenses';

  constructor(private http: HttpClient) { }

  getAssetList(
    groupAssetCategory?: string,
    checkoutTo?: string | null,
    scrumTeam?: string | null,
    agileReleaseTrain?: string | null,
    assetCondition?: string,
  ): Observable<Asset[]> {
    let params = new HttpParams();

    if (groupAssetCategory) {
      params = params.set('GroupAssetCategory', groupAssetCategory);
    }
    if (checkoutTo !== undefined && checkoutTo !== null) {
      params = params.set('CheckoutTo', checkoutTo);
    }
    if (scrumTeam !== undefined && scrumTeam !== null) {
      params = params.set('ScrumTeam', scrumTeam);
    }
    if (agileReleaseTrain !== undefined && agileReleaseTrain !== null) {
      params = params.set('AgileReleaseTrain', agileReleaseTrain);
    }
    if (assetCondition) {
      params = params.set('AssetCondition', assetCondition);
    }

    return this.http.get<Asset[]>(this.apiUrl, { params: params });
  }

  getAssetListById(id: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.apiUrl}/${id}`);
  }

  addAsset(asset: any): Observable<any> {
    return this.http.post(this.apiUrl, asset);
  }

  updateAsset(id: number, asset: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, asset);
  }

  deleteAssetList(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ==========================================================
  // NEW LICENSE METHODS (Use these in your LicensesComponent)
  // ==========================================================

  /**
   * Fetch data from the new 'licenses' table
   */
  getLicenses(licenseType?: string): Observable<any[]> {
    let params = new HttpParams();
    if (licenseType && licenseType !== 'All') {
      params = params.set('license_type', licenseType);
    }
    return this.http.get<any[]>(this.licensesUrl, { params });
  }

  /**
   * Add a new row to the 'licenses' table
   */
  addLicense(data: any): Observable<any> {
    return this.http.post(this.licensesUrl, data);
  }

  /**
   * Update a specific row in 'licenses' table
   */
  updateLicense(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.licensesUrl}/${id}`, data);
  }

  /**
   * Delete a row from 'licenses' table
   */
  deleteLicense(id: number): Observable<any> {
    return this.http.delete(`${this.licensesUrl}/${id}`);
  }
}
