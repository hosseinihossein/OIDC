import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { SingletonService } from './shared/singleton-service';
import { IconService } from './shared/icon-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  iconService = inject(IconService);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly singleton = inject(SingletonService);
  
  ngOnInit(): void {
    // Bootstrap on every page load. Handles the IdP callback,
    // restores stored sessions, and starts silent renewal.
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated }) => {
      console.log("isAuthenticated: "+isAuthenticated);
      this.singleton.authChekced.set(true);
    });
  }

  
  
}
