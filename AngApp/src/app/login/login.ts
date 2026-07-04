import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
//import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  activatedRoute = inject(ActivatedRoute);
  //router = inject(Router);
  //private readonly oidcSecurityService = inject(OidcSecurityService);

  returnUrl = signal("");

  constructor(){
    this.returnUrl.set(this.activatedRoute.snapshot.queryParamMap.get("ReturnUrl") || "/");
  }
}
