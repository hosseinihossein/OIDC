import { Component, inject, signal } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { WaitSpinner } from '../shared/wait-spinner/wait-spinner';
import { JsonPipe } from '@angular/common';
import { SingletonService } from '../shared/singleton-service';

@Component({
  selector: 'app-profile',
  imports: [WaitSpinner, JsonPipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly singleton = inject(SingletonService);

  stopWaiting = signal(false);

  ngOnInit(): void {
    if(this.singleton.authChekced()){
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
