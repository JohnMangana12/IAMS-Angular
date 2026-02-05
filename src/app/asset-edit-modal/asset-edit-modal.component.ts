import { AssetService } from './../services/asset.service';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Asset {
    id: number;
    AssetTag: string;
    Description: string;
    SerialNumber: string;
    CostCenter: string;
    Warranty?: string;  // Or Date if it's a Date object
    PoNumber: string;
    [key: string]: any; // Allow other properties
}

@Component({
    selector: 'app-asset-edit-modal',
    templateUrl: './asset-edit-modal.component.html',
    styleUrls: ['./asset-edit-modal.component.scss'],
    standalone: false,
})
export class AssetEditModalComponent implements OnInit {
  condition: string[] = ['Good','Defective','Borrowed','Spare','Disposed Assets','Missing','For Disposal','Offsite'];
    GroupCategory: string[] = ['3rd Party Devices', 'Delta V Hardware', 'Non-Emerson Assets', 'Computer Assets',];
    Category: string[] = ['Monitor','Media Converter','M-Series: Card, Virtual IO Module','Charm: Power','M-Series: Zone Items','S-Series: Cables',
      'S-Series: Card, VIOM','S-Series: Card, Pulse Count Input','Domain Knowledge','Rosemount','Fisher','Control Technique','3rd Party Devices',
      'DeltaV Dongle License','MSDN License','Desktop','Workstation', 'Laptop', 'Rack Type Server', 'Tower Type Server','M-Series: Controller',
      'Network Switch', 'M-Series: ASI', 'M-Series: Card, Devicenet','M-Series: Card, DI', 'M-Series: Card, Discrete In', 'M-Series: Power Supply',
      'M-Series: Card, RTD', 'M-Series: Card, Serial','M-Series: SLS 1508', 'M-Series: SISNet Repeater', 'M-Series: Card, Fieldbus H1', 'M-Series: Card, Multifunction',
      'M-Series: Card, Analog In','M-Series: Card, Analog Out', 'M-Series: Card, SOE', 'M-Series: Extender', 'M-Series: Card, Discrete Out', 'M-Series: Card, Isolated Input',
      'S-Series: Controller', 'S-Series: Card, AI', 'S-Series: Card, AO', 'S-Series: Card, DI', 'S-Series: Card, DO', 'S-Series: Card, DeviceNet',
      'S-Series: Card, Fieldbus H1', 'S-Series: Card, IO', 'S-Series: Card, AS-I', 'S-Series: Card, DeviceNet', 'S-Series: Card, Profibus', 'S-Series: Power Supply',
      'S-Series: Card, Serial', 'S-Series: Card, SOE', 'S-Series: Card, Wireless IO', 'Firewall', 'Charm: AI', 'Charm: AO', 'Charm: DI', 'Charm: DO', 'Charm: RTD',
      'Charm: Scanner Module','Charm: CSLS Controller', 'Charm: CSLS Carrier', 'Charm: CSLS Power Module', 'Charm: DVC', 'Charm: BP Terminator', 'Charm: Baseplate',
      'Charm: Gateway','Power Supply','Profibus','Profinet','Signal Module','Rosemount','M-Series: Card, Thermocouple','S-Series: Card, RTD','M-Series: Card, AS-I', 'Fisher'];
    CostCenter: string[] = ['5301-Tenny Hao','5305-Management','5308-Product Owner','5311-Ryan Valderama','5314-Morris Bongas','5315-Arlene Gutierrez','5318-Clint David','5329-Geraldine Geneta','5330-Emmy Amadeo','5331-Patrick Natividad','5336-Emmy Amadeo'];
    ScrumTeam: String[] = ['Luna','Helios', 'TTP', 'System Architect', 'EdgeOps', 'Hydra', 'Diwata', 'Wyvern', 'SI', 'Infra', 'DevOps', 'Atlantis', 'Guardian', 'MSP', 'SE', 'Alliance', 'UX', 'CyberSecurity', 'Tech Docs', 'Scrum Leader', 'Product Owner', 'Release Train Leader', 'Manager', 'Director'];
    AgileReleaseTrain: String[] = ['Amber','Green','Shared Services'];
    assetAddForm: FormGroup;
    assetId: number | null = null;


    @Input() public data: any;


    constructor(
        private _fb: FormBuilder,
        private _assetService: AssetService,
        public activeModal: NgbActiveModal,
        private _snackBar: MatSnackBar
    ) {
        this.assetAddForm = this._fb.group({
            AssetTag: ['', Validators.required],
            Description: [''],
            Location: [''],
            SerialNumber: [''],
            AssetCondition: [''],
            Specification: [''],
            GroupAssetCategory: [''],
            PoNumber: [''],
            Warranty: [''],
            DateAcquired: [''],
            CheckoutTo: [''],
            AssetCategory: [''],
            CostCenter: [''],
            ScrumTeam: [''],  // Add ScrumTeam to the form
            AgileReleaseTrain: [''],
        });
    }

    ngOnInit(): void {
        if (this.data) {
            this.assetId = this.data.id;
            //This first patchValue sets all non-date string/number values
            this.assetAddForm.patchValue(this.data);

            // Now, we specifically handle the date fields

            // --- Handle Warranty Date ---
            if (this.data.Warranty) {
                const warrantyDate = new Date(this.data.Warranty);
                const ngbWarrantyDate: NgbDateStruct = {
                      year: warrantyDate.getFullYear(),
                      month: warrantyDate.getMonth() +1, // Month is 0-indexed in JavaScript
                      day: warrantyDate.getDate()

                };
                // Use patchValue to update just the Warranty control
                this.assetAddForm.patchValue({ Warranty:ngbWarrantyDate});
            }

            // --- ADD THIS BLOCK: Handle Date Acquired ---
            if (this.data.DateAcquired) {
                const acquiredDate = new Date (this.data.DateAcquired);
                const ngbAcquiredDate: NgbDateStruct = {
                    year: acquiredDate.getFullYear(),
                    month: acquiredDate.getMonth() + 1, // Month is 0-indexed in JavaScript
                    day: acquiredDate.getDate()
                };
                // Use patchValue to update just the DateAcquired control
                this.assetAddForm.patchValue({ DateAcquired: ngbAcquiredDate });
            }

          }
    }

    onFormSubmit() {
          if (this.assetAddForm.valid){
              // Get the date objects from the form
              const warrantyDate: NgbDateStruct = this.assetAddForm.get('Warranty')?.value;
              const acquiredDate: NgbDateStruct = this.assetAddForm.get('DateAcquired')?.value;

              let formattedWarrantyDate: string | null = null;
              let formattedDateAcquired: string | null = null;


              // Format the Warranty date if it exists
              if (warrantyDate && warrantyDate.year) {
              formattedWarrantyDate = `${warrantyDate.year}-${String(warrantyDate.month).padStart(2, '0')}-${String(warrantyDate.day).padStart(2, '0')}`;
              }

               // Format the Date Acquired if it exists
               if (acquiredDate && acquiredDate.year) {
                   formattedDateAcquired = `${acquiredDate.year}-${String(acquiredDate.month).padStart(2, '0')}-${String(acquiredDate.day).padStart(2, '0')}`;
               }
               // Create the final payload with BOTH formatted dates
               const formData: Asset = {
                   ...this.assetAddForm.value,
                   Warranty: formattedWarrantyDate,
                   DateAcquired: formattedDateAcquired,
               };




            if (this.assetId) {
                this._assetService.updateAsset(this.assetId, formData).subscribe({
                    next: (value) => {
                        this.openSnackBar('Asset detail updated!', 'OK');
                        this.activeModal.close(true);
                    },
                    error: (err) => {
                        console.error(err);
                        this.openSnackBar('Error updating asset!', 'OK');
                    }
                });
            } else {
                this._assetService.addAsset(formData).subscribe({
                    next: (value) => {
                        this.openSnackBar('Asset Added Successfully', 'OK');
                        this.activeModal.close(true);
                    },
                    error: (err) => {
                        console.error(err);
                        this.openSnackBar('Error adding asset!', 'OK');
                    }
                });
            }
        } else {
            this.openSnackBar("Please fill the form correctly", "OK")
        }
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
        });
    }
}
