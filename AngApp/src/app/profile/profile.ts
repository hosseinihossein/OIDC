import { Component, inject, signal } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { WaitSpinner } from '../shared/wait-spinner/wait-spinner';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [WaitSpinner, JsonPipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  readonly oidcSecurityService = inject(OidcSecurityService);

  stopWaiting = signal(false);

  ngOnInit(): void {
    if(this.oidcSecurityService.authenticated().isAuthenticated){
      this.stopWaiting.set(true);
    }
  }

  login() {
    // User clicked sign-in: redirect to the identity provider.
    this.oidcSecurityService.authorize();
  }

  logout() {
    this.oidcSecurityService.logoff().subscribe((result) => console.log(result));
  }
}
