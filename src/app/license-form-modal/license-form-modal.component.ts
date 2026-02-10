import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AssetService } from '../services/asset.service';
import {
  faSave,
  faTimes,
  faCalendar,
  faKey,
  faTag,
  faBuilding,
  faFileSignature
} from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-license-form-modal',
  standalone: false,
  templateUrl: './license-form-modal.component.html',
  styleUrls: ['./license-form-modal.component.scss']
})
export class LicenseFormModalComponent implements OnInit {
  @Input() dataToEdit: any = null;

  licenseForm: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;

  // Icons
  faSave = faSave;
  faTimes = faTimes;
  faCalendar = faCalendar;
  faKey = faKey;
  faTag = faTag;
  faBuilding = faBuilding;
  faFileSignature = faFileSignature;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private assetService: AssetService
  ) {
    this.licenseForm = this.fb.group({
      product_name: ['', Validators.required],
      license_key: ['', Validators.required],
      license_type: ['Subscription', Validators.required],
      serial_number: [''],
      cost_center: [''],
      vendor: ['', Validators.required],
      contract_date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.dataToEdit) {
      this.isEditMode = true;
      this.patchFormValues();
    }
  }

  patchFormValues() {
    const formData = { ...this.dataToEdit };
    if (formData.contract_date) {
      try {
        formData.contract_date = formatDate(formData.contract_date, 'yyyy-MM-dd', 'en-US');
      } catch (e) {
        console.warn('Invalid date format:', formData.contract_date);
      }
    }
    this.licenseForm.patchValue(formData);
  }

  onSubmit() {
    if (this.licenseForm.invalid) {
      this.licenseForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.licenseForm.value;

    const request$ = this.isEditMode
      ? this.assetService.updateLicense(this.dataToEdit.id, formData)
      : this.assetService.addLicense(formData);

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.activeModal.close('success');
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        // Ideally, show a toast notification here instead of alert
        alert('An error occurred while saving the license.');
      }
    });
  }
}
