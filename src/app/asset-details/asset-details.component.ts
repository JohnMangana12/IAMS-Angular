import { Component, Input, OnInit } from '@angular/core'; // Import Input and OnInit
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Asset } from '../services/search.service';

@Component({
  selector: 'app-asset-details', // Used by NgbModal to create the component
  // If your app is fully standalone, set this to true. Otherwise, ensure it's declared in an NgModule.
  // standalone: true,
  standalone: false, // Keep false if declared in an NgModule
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss'] // Use styleUrls for an array
})
export class AssetDetailsComponent implements OnInit { // Implement OnInit

  // The @Input() decorator is essential for receiving data from the parent component
  // (in this case, HeaderComponent, via modalService.open).
  // Using the specific 'Asset' type for strong typing. The '!' asserts it will be defined.
  @Input() asset!: Asset;

  constructor(
    public activeModal: NgbActiveModal // Inject NgbActiveModal to control the modal instance
  ) {}

  ngOnInit(): void {
    // This method is called after the component's inputs have been initialized.
    // It's a good place to check if the asset data was actually received.
    if (!this.asset) {
      console.error('Asset details component initialized without an asset!');
      // Optionally, you can dismiss the modal if asset data is mandatory.
      // this.activeModal.dismiss('Asset data missing');
    }
    // console.log('Asset received in details component:', this.asset); // For debugging
  }

  /**
   * Closes the modal.
   * This method can be called from the template.
   */
  closeModal(): void {
    this.activeModal.dismiss('User clicked close'); // 'dismiss' is commonly used for closing modal actions.
  }
}
