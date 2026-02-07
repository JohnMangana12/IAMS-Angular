import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AssetService } from '../services/asset.service';
import { faSave, faTimes, faCalendar, faKey, faTag, faBuilding, faFileSignature } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-license-form-modal',
  standalone: false,
  templateUrl: './license-form-modal.component.html',
  styleUrls: ['./license-form-modal.component.scss']
})
export class LicenseFormModalComponent implements OnInit {
  @Input() dataToEdit: any = null; // Passed from parent if editing

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
    // Initialize Form with validation
    this.licenseForm = this.fb.group({
      product_name: ['', Validators.required],
      license_key: ['', Validators.required],
      license_type: ['Subscription', Validators.required], // Default value
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
    // We need to format the date specifically for the HTML date input (yyyy-MM-dd)
    const formData = { ...this.dataToEdit };
    if (formData.contract_date) {
      try {
        formData.contract_date = formatDate(formData.contract_date, 'yyyy-MM-dd', 'en-US');
      } catch (e) {
        console.error('Date parsing error', e);
      }
    }
    this.licenseForm.patchValue(formData);
  }

  onSubmit() {
    if (this.licenseForm.invalid) {
      this.licenseForm.markAllAsTouched(); // Trigger validation UI
      return;
    }

    this.isLoading = true;
    const formData = this.licenseForm.value;

    if (this.isEditMode) {
      // UPDATE Operation
      // Assuming your service has an updateLicense method, or generic update with table name
      this.assetService.updateLicense(this.dataToEdit.id, formData).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.activeModal.close('success');
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          alert('Error updating license');
        }
      });
    } else {
      // CREATE Operation
      this.assetService.addLicense(formData).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.activeModal.close('success');
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          alert('Error creating license');
        }
      });
    }
  }
}
