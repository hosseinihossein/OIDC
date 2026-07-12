import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoginService } from './login-service';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { SingletonService } from '../shared/singleton-service';
import { form, FormField, hidden, minLength, required } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from "@angular/material/icon";
import { WaitSpinner } from '../shared/wait-spinner/wait-spinner';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
//import { OidcSecurityService } from 'angular-auth-oidc-client';

declare const turnstile:any;

interface LoginData {
  UsernameOrEmail: string,
  Password:string,
  CfTurnstileResponse: string,
  ReturnUrl: string,
}

@Component({
  selector: 'app-login',
  imports: [FormField, MatFormFieldModule, MatInput, MatIcon, WaitSpinner, MatButton, RouterLink,
    NgOptimizedImage, MatFabButton, MatTooltip],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  private loginService = inject(LoginService);
  private singleton = inject(SingletonService);
  private activatedRoute = inject(ActivatedRoute);

  displayWaitSpinner = signal(false);
  widgetId = signal("");
  generalErrors = signal<string>("");

  loginModel = signal<LoginData>({
    UsernameOrEmail: "",
    Password: "",
    CfTurnstileResponse: "",
    ReturnUrl: "",
  });
  loginForm = form(this.loginModel,(schemaPath)=>{
    required(schemaPath.UsernameOrEmail, {message:"Username or Email is required!"});
    
    required(schemaPath.Password, {message:"Password is required!"});
    minLength(schemaPath.Password, 5, {message:"Password must be at least 5 characters!"});
    
    hidden(schemaPath.CfTurnstileResponse,{when: () => !this.singleton.enableTurnstile()});
    required(schemaPath.CfTurnstileResponse, {message:"Turnstiel needs to be passed!"});
  });

  constructor(){
    this.loginForm.ReturnUrl().value.set(this.activatedRoute.snapshot.queryParamMap.get("ReturnUrl") || "/");
  }
  ngAfterViewInit(): void {
    if(this.singleton.enableTurnstile()){
      this.widgetId.set(
        turnstile.render("#widget-container", {
          sitekey: this.singleton.turnstileSiteKey,
          size: "flexible",
          theme: this.singleton.darkMode() ? "dark" : "light",
          "response-field": false,
          action: "login",
          "refresh-expired": "manual",
          "refresh-timeout": "manual",
          callback: (token:string) => {
            //const errors = this.loginForm().errors;
            this.loginForm.CfTurnstileResponse().value.set(token);
            //this.loginForm().setErrors(errors);
          },
          'error-callback': (errorCode: string) => {
            //this.loginForm().setErrors({turnstileError: "Turnstile error! error code: " + errorCode});
            this.generalErrors.set("Turnstile error! error code: " + errorCode);
            console.error("error-callback: " + errorCode);
          },
          'expired-callback': () => {
            //this.loginForm().setErrors({turnstileError: "Turnstile expired!"});
            this.generalErrors.set("Turnstile expired!");
            console.error("expired-callback");
          },
          'timeout-callback': () => {
            //this.loginForm().setErrors({turnstileError: "Turnstile timeouted!"});
            this.generalErrors.set("Turnstile timeouted!")
            console.error("timeout-callback");
          },
        })
      );
    }
    /*else{
      //this.cfTurnstile().clearValidators();
      //this.cfTurnstile().updateValueAndValidity();
    }*/
  }

  forgetPassword(){}
}
