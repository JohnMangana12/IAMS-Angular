import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetService } from '../services/asset.service';
import { NgbActiveModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
import {Router} from '@angular/router';

@Component({
    selector: 'app-add-assets',
    templateUrl: './add-assets.component.html',
    styleUrls: ['./add-assets.component.scss'],
    standalone: false,
})
export class AddAssetsComponent implements OnInit {
    condition: string[] = ['Good','Defective','Borrowed','Spare','Disposed Assets','Missing','For Disposal','Offsite'];
    GroupCategory: string[] = ['3rd Party Devices', 'Delta V Hardware', 'Non-Emerson Assets','Computer Assets',];
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
    CostCenter: string[] = ['5301-Tenny Hao','5305-Release Leader','5308-Product Owner/SL','5311-Ryan Valderama','5314-Morris Bongas','5315-Arlene Gutierrez','5318-Clint David','5329-Geraldine Geneta','5330-Emmy Amadeo','5331-Patrick Natividad','5336-Emmy Amadeo'];
    ScrumTeam: String[] = ['Luna','Helios', 'TTP', 'System Architect', 'EdgeOps', 'Hydra', 'Diwata', 'Wyvern', 'SI', 'Infra', 'DevOps', 'Atlantis', 'Guardian', 'MSP', 'SE', 'Alliance', 'UX', 'CyberSecurity', 'Tech Docs', 'Scrum Leader', 'Product Owner', 'Release Train Leader', 'Manager', 'Director'];
    AgileReleaseTrain: String[] = ['Amber', 'Green','Shared Services'];

    assetAddForm: FormGroup;
    assetId: number | null = null; // Store the ID for updates

    @Input() public data: any; // Declare an input property to receive data

    constructor(
        private _fb: FormBuilder,
        private _addAsset: AssetService,
        public activeModal: NgbActiveModal,
        private _snackBar: MatSnackBar,
        private router: Router, // Inject the Router

    ) {
        this.assetAddForm = this._fb.group({
            AssetTag: '',
            Description: '',
            Location: '',
            SerialNumber: '',
            AssetCondition: '',
            Specification: '',
            GroupAssetCategory: '',
            PoNumber: '',
            Warranty: '',
            DateAcquired: '',
            CheckoutTo: '',
            AssetCategory: '',
            CostCenter: '',
            ScrumTeam: '',
            AgileReleaseTrain: '',
        });
    }

    ngOnInit(): void {
        // Check if data is passed (for editing)
        if (this.data) { // Access data via this.data
            this.assetId = this.data.id;  // Store the ID for updates
            this.assetAddForm.patchValue(this.data);
        }
    }

    onFormSubmit() {
        console.log ('Form Value before formatting:', this.assetAddForm.value); //Debugging
        if (this.assetAddForm.valid) {
          // Get the date objects from the form
              const warrantyDate: NgbDateStruct = this.assetAddForm.get ('Warranty')?.value;
              const dateAcquired: NgbDateStruct = this.assetAddForm.get ('DateAcquired')?.value;

              let formattedWarrantyDate: string | null = null;
              let formattedDateAcquired: string | null = null;

              //Format the Warranty date if it exists
              if (warrantyDate){
                formattedWarrantyDate = `${warrantyDate.year}-${String (warrantyDate.month).padStart(2, '0')}-${String(warrantyDate.day).padStart(2, '0')}`;
              }

              //Format the Date Acquired date if it exists
              if (dateAcquired){
                formattedDateAcquired = `${dateAcquired.year}-${String (dateAcquired.month).padStart(2, '0')}-${String(dateAcquired.day).padStart(2, '0')}`;
              }
              // Create the final payload with the formatted dates
              const formData = {
                ...this.assetAddForm.value,
                Warranty:formattedWarrantyDate,
                DateAcquired:formattedDateAcquired,
              };
               console.log('API Payload:', formData); // Debugging

            if (this.assetId) { // If assetId exists, it's an update
                this._addAsset.updateAsset(this.assetId, formData).subscribe({
                    next: (value: any) => {
                        this.openSnackBar('Asset detail updated!', 'OK');
                        this.activeModal.close(true); // Close the modal, passing back 'true'
                    },
                    error: (err: any) => {
                        console.error(err);
                        this.openSnackBar('Error updating asset!', 'OK');
                    }
                });
            } else {
                this._addAsset.addAsset(formData).subscribe({
                    next: (value: any) => {
                        this.openSnackBar('Asset Added Successfully', 'OK');
                        this.activeModal.close(true); // Close the modal, passing back 'true'
                    },
                    error: (err: any) => {
                        console.error(err);
                        this.openSnackBar('Error adding asset!', 'OK');
                    }
                });
            }
        }
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
        });
    }
}
