import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetService } from '../services/asset.service';
import { NgbActiveModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  faCube, faEdit, faTag, faBarcode, faAlignLeft, faLayerGroup,
  faLaptop, faMicrochip, faHeartbeat, faMapMarkerAlt, faUser,
  faBuilding, faUsers, faTrain, faFileInvoice, faCalendarCheck,
  faShieldAlt, faSave, faHashtag, faStickyNote // <--- ADDED ICONS HERE
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-add-assets',
    templateUrl: './add-assets.component.html',
    styleUrls: ['./add-assets.component.scss'],
    standalone: false,
})
export class AddAssetsComponent implements OnInit {
    @Input() public data: any;

    assetAddForm: FormGroup;
    assetId: number | null = null;
    isLoading: boolean = false;

    // FontAwesome Icons
    faCube = faCube;
    faEdit = faEdit;
    faTag = faTag;
    faBarcode = faBarcode;
    faAlignLeft = faAlignLeft;
    faLayerGroup = faLayerGroup;
    faLaptop = faLaptop;
    faMicrochip = faMicrochip;
    faHeartbeat = faHeartbeat;
    faMapMarkerAlt = faMapMarkerAlt;
    faUser = faUser;
    faBuilding = faBuilding;
    faUsers = faUsers;
    faTrain = faTrain;
    faFileInvoice = faFileInvoice;
    faCalendarCheck = faCalendarCheck;
    faShieldAlt = faShieldAlt;
    faSave = faSave;
    faHashtag = faHashtag;      // <--- ADDED
    faStickyNote = faStickyNote;// <--- ADDED

    // Dropdown Data
    condition: string[] = ['Good','Defective','Borrowed','Spare','Disposed Assets','Missing','For Disposal','Offsite'];
    GroupCategory: string[] = ['3rd Party Devices', 'Delta V Hardware', 'Non-Emerson Assets','Computer Assets'];
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

    constructor(
        private _fb: FormBuilder,
        private _addAsset: AssetService,
        public activeModal: NgbActiveModal,
        private _snackBar: MatSnackBar,
        private router: Router,
    ) {
        this.assetAddForm = this._fb.group({
            AssetTag: [''],
            Description: [''],
            Location: [''],
            SerialNumber: [''],
            AssetCondition: ['Good'],
            Specification: [''],
            GroupAssetCategory: [''],
            PoNumber: [''],
            Warranty: [''],
            DateAcquired: [''],
            CheckoutTo: [''],
            AssetCategory: [''],
            CostCenter: [''],
            ScrumTeam: [''],
            AgileReleaseTrain: [''],
            Comments: [''], // <--- ADDED
            EmersonPartNumber: [''] // <--- ADDED
        });
    }

    ngOnInit(): void {
        if (this.data) {
            this.assetId = this.data.id;
            this.assetAddForm.patchValue(this.data);
        }
    }

    onFormSubmit() {
        if (this.assetAddForm.invalid) {
             return;
        }

        this.isLoading = true;

        const warrantyDate: NgbDateStruct = this.assetAddForm.get('Warranty')?.value;
        const dateAcquired: NgbDateStruct = this.assetAddForm.get('DateAcquired')?.value;

        const formData = {
            ...this.assetAddForm.value,
            Warranty: this.formatDate(warrantyDate),
            DateAcquired: this.formatDate(dateAcquired),
        };

        const request$ = this.assetId
            ? this._addAsset.updateAsset(this.assetId, formData)
            : this._addAsset.addAsset(formData);

        request$.subscribe({
            next: (res) => {
                this.isLoading = false;
                this.openSnackBar(this.assetId ? 'Asset updated successfully!' : 'Asset added successfully!', 'OK');
                this.activeModal.close(true);
            },
            error: (err) => {
                console.error(err);
                this.isLoading = false;
                this.openSnackBar('Error saving asset information.', 'Retry');
            }
        });
    }

    private formatDate(date: NgbDateStruct): string | null {
        if (!date) return null;
        return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
        });
    }
}
