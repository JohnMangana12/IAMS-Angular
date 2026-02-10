import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Asset } from '../services/search.service';
import {
  faInfoCircle, faTag, faBarcode, faMicrochip, faLayerGroup,
  faLaptop, faMapMarkerAlt, faUser, faBuilding, faUsers,
  faTrain, faFileInvoice, faCalendarCheck, faShieldAlt,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-asset-details',
  standalone: false,
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss']
})
export class AssetDetailsComponent implements OnInit {

  @Input() asset!: Asset;

  // Icons
  faInfoCircle = faInfoCircle;
  faTag = faTag;
  faBarcode = faBarcode;
  faMicrochip = faMicrochip;
  faLayerGroup = faLayerGroup;
  faLaptop = faLaptop;
  faMapMarkerAlt = faMapMarkerAlt;
  faUser = faUser;
  faBuilding = faBuilding;
  faUsers = faUsers;
  faTrain = faTrain;
  faFileInvoice = faFileInvoice;
  faCalendarCheck = faCalendarCheck;
  faShieldAlt = faShieldAlt;
  faExclamationTriangle = faExclamationTriangle;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    if (!this.asset) {
      console.error('Asset details component initialized without an asset!');
    }
  }

  closeModal(): void {
    this.activeModal.dismiss('User clicked close');
  }

    // Helper to visually flag expired warranties
  // Update the parameter type to accept string OR Date
  isWarrantyExpired(val?: string | Date): boolean {
    if (!val) return false;

    // The Date constructor works with both date strings and Date objects
    const warranty = new Date(val);
    const today = new Date();

    // Check if the date is valid before comparing
    if (isNaN(warranty.getTime())) return false;

    return warranty < today;
  }
}
