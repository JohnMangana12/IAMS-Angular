import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common'; // For *ngIf

@Component({
  selector: 'app-import-confirmation-modal',
  standalone: false,

  templateUrl: './import-confirmation-modal.component.html',
  styleUrls: ['./import-confirmation-modal.component.scss']
})
export class ImportConfirmationModalComponent {
  @Input() successCount: number = 0;
  @Input() failedCount: number = 0;
  @Input() errorMessage: string | null = null;

  constructor(public activeModal: NgbActiveModal) {}
}
