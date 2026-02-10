import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  faTimes,
  faDriversLicense,
  faKey,
  faCopy,
  faCheck,
  faBuilding,
  faCalendar,
  faBarcode,
  faTag
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-license-details-modal',
  standalone: false,
  templateUrl: './license-details-modal.component.html',
  styleUrls: ['./license-details-modal.component.scss']
})
export class LicenseDetailsModalComponent {
  @Input() license: any;

  // Icons
  faTimes = faTimes;
  faDriversLicense = faDriversLicense;
  faKey = faKey;
  faCopy = faCopy;
  faCheck = faCheck;
  faBuilding = faBuilding;
  faCalendar = faCalendar;
  faBarcode = faBarcode;
  faTag = faTag;

  // State for copy button feedback
  isCopied = false;

  constructor(public activeModal: NgbActiveModal) {}

  copyToClipboard(text: string) {
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      this.isCopied = true;
      // Revert icon back to copy after 2 seconds
      setTimeout(() => {
        this.isCopied = false;
      }, 2000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }
}
