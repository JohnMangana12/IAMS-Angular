import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faTimes, faDriversLicense } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-license-details-modal',
  standalone: false,
  templateUrl: './license-details-modal.component.html',
  styleUrls: ['./license-details-modal.component.scss']
})
export class LicenseDetailsModalComponent {
  @Input() license: any; // Data passed from parent

  faTimes = faTimes;
  faDriversLicense = faDriversLicense;

  constructor(public activeModal: NgbActiveModal) {}
}
