import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset } from '../models/asset.model'; // Assuming you have this

@Injectable({
  providedIn: 'root'
})
export class AssetService {
   private apiUrl = 'http://localhost:3000/assets';

  constructor(private http: HttpClient) { }

  getAssetList(
    groupAssetCategory?: string,
    checkoutTo?: string | null,
    scrumTeam?: string | null, // Added scrumTeam filter
    agileReleaseTrain?: string | null, // Added agileReleaseTrain filter
    assetCondition?: string,
  ): Observable<Asset[]> {
    let params = new HttpParams();

    if (groupAssetCategory) {
      params = params.set('GroupAssetCategory', groupAssetCategory);
    }
    if (checkoutTo !== undefined && checkoutTo !== null) {
      params = params.set('CheckoutTo', checkoutTo);
    }
    // Add ScrumTeam filter if provided
    if (scrumTeam !== undefined && scrumTeam !== null) {
      params = params.set('ScrumTeam', scrumTeam);
    }
    // Add AgileReleaseTrain filter if provided
    if (agileReleaseTrain !== undefined && agileReleaseTrain !== null) {
      params = params.set('AgileReleaseTrain', agileReleaseTrain);
    }
    // Add AssetCondition and display it on third-party-items component
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
}
