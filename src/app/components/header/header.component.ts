import {Component, inject} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {RouterLink} from "@angular/router";
import {NgOptimizedImage} from "@angular/common";


@Component({
    selector: 'app-header',
    imports: [
        RouterLink,
        NgOptimizedImage
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent {

  authService = inject(AuthService);

  get username() { return this.authService.getUsername() || ''; }

  logout() { this.authService.logout(); }
}
