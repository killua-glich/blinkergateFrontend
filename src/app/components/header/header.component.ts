import {Component, inject} from '@angular/core';
import {AuthService} from '../../services/auth.service';


@Component({
    selector: 'app-header',
    imports: [],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent {

  authService = inject(AuthService);

  get username() { return this.authService.getUsername() || ''; }

  logout() { this.authService.logout(); }
}
