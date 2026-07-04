import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly oidcSecurityService = inject(OidcSecurityService);

  /*iAuthenticated = signal(false);
  userDataJson = signal<string>("");
  stopWaiting = signal(false);*/
  
  ngOnInit(): void {
    // Bootstrap on every page load. Handles the IdP callback,
    // restores stored sessions, and starts silent renewal.
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated }) => {
      console.log("isAuthenticated: "+isAuthenticated);
      //console.log()
      /*this.iAuthenticated.set(isAuthenticated);
      this.userDataJson.set(JSON.stringify(userData));
      
      this.stopWaiting.set(true);*/
    });
  }

  
  
}
