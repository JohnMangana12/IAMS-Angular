import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { AppComponent } from '../app.component';

@Component({
    selector: 'app-user-page',
    templateUrl: './user-page.component.html',
    styleUrl: './user-page.component.scss',
    standalone: false
})
export class UserPageComponent {
  constructor(private authService: AuthService){


  }
  logout(){
    this.authService.logout();

  }

}
