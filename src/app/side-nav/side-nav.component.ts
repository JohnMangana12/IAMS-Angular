import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule, NavigationStart, Event, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { LoadingService } from '../services/loading.service';

import {
  faDashboard,
  faLocation,
  faShop,
  faBox,
  faMoneyBill,
  faChartBar,
  faContactBook,
  faHand,
  faComputer,
  faDriversLicense,
  faFileImport,
  faDroplet,
  faServer,
  faWarehouse,
  faShield,
  faTools,
  faPeopleGroup,
  faPeopleRoof,
  faFileInvoice,
  faCertificate,
  faBoxesStacked,

} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrls: ['./side-nav.component.scss'],
    standalone: false
})
export class SideNavComponent implements OnInit {
  faDashboard = faDashboard;
  faLocation = faLocation;
  faShop = faShop;
  faBox = faBox;
  faMoneyBill = faMoneyBill;
  faChartBar = faChartBar;
  faContactBook = faContactBook;
  faHand = faHand;
  faComputer = faComputer;
  faDriversLicense = faDriversLicense;
  faFileImport = faFileImport;
  faDroplet = faDroplet;
  faServer = faServer;
  faWarehouse = faWarehouse;
  faShield = faShield;
  faTools = faTools;
  faPeopleGroup = faPeopleGroup;
  faPeopleRoof = faPeopleRoof;
  faFileInvoice= faFileInvoice;
  faCertificate= faCertificate;
  faBoxesStacked= faBoxesStacked;


  constructor(
    private router: Router,
    private loadingService: LoadingService // Inject the LoadingService
  ) {}

    ngOnInit(): void {


    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.startLoading(); // <-- This should trigger the loading state
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.stopLoading(); // <-- This should stop the loading state
      }
    });
  }
}
