import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for *ngIf if this becomes part of another component
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; // For Bootstrap's spinner styles

@Component({
  selector: 'app-loading-spinner',
  standalone: false,
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent {

}
