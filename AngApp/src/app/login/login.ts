import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoginService } from './login-service';
import { NgOptimizedImage } from '@angular/common';
import { SingletonService } from '../shared/singleton-service';
import { form, FormField, FormRoot, hidden, minLength, required, TreeValidationResult } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from "@angular/material/icon";
import { WaitSpinner } from '../shared/wait-spinner/wait-spinner';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { HttpErrorResponse, HttpEventType, HttpStatusCode } from '@angular/common/http';
import { WindowService } from '../shared/window-service';
//import { OidcSecurityService } from 'angular-auth-oidc-client';

declare const turnstile:any;

export interface LoginModel {
  UsernameOrEmail: string,
  Password:string,
  CfTurnstileResponse: string,
  ReturnUrl: string,
}

@Component({
  selector: 'app-login',
  imports: [FormField, /*FormRoot,*/ MatFormFieldModule, MatInput, MatIcon, WaitSpinner, MatButton, RouterLink,
    NgOptimizedImage, MatFabButton, MatTooltip],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  private loginService = inject(LoginService);
  private singleton = inject(SingletonService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private windowService = inject(WindowService);

  displayWaitSpinner = signal(false);
  widgetId = signal("");
  generalError = signal<string>("");

  loginModel = signal<LoginModel>({
    UsernameOrEmail: "",
    Password: "",
    CfTurnstileResponse: "",
    ReturnUrl: "",
  });
  loginForm = form(this.loginModel,
    (schemaPath)=>{
      required(schemaPath.UsernameOrEmail, {message:"Username or Email is required!"});
      
      required(schemaPath.Password, {message:"Password is required!"});
      minLength(schemaPath.Password, 5, {message:"Password must be at least 5 characters!"});
      
      hidden(schemaPath.CfTurnstileResponse,{when: () => !this.singleton.enableTurnstile()});
      required(schemaPath.CfTurnstileResponse, {message:"Turnstiel needs to be passed!"});
    }/*,
    {
      submission: {
        action: async (field) => {
          let result:TreeValidationResult|null = null;
          this.loginService.submitLogin(field().value()).subscribe({
            next: (event) => {
              if(event.type === HttpEventType.Response && event.url){
                this.windowService.nativeWindow.location.href = event.url;
              }
            },
            error:(err) => {
              if(err instanceof HttpErrorResponse && err.status == HttpStatusCode.BadRequest){
                this.generalError.set(JSON.stringify(err.error,null,2));
                if(err.error.Email || err.error.Username || err.error.errors?.UsernameOrEmail){
                  result = {
                    kind: "LoginError",
                    message: err.error.Email || err.error.Username || err.error.errors?.UsernameOrEmail,
                    fieldTree: field.UsernameOrEmail,
                  };
                }
                else if(err.error.Password || err.error.errors?.Password){
                  result = {
                    kind: "LoginError",
                    message: err.error.Password || err.error.errors?.Password,
                    fieldTree: field.Password,
                  };
                }
                else if(err.error.TurnstileError || err.error.errors?.CfTurnstileResponse){
                  result = {
                    kind: "LoginError",
                    message: err.error.TurnstileError || err.error.errors?.CfTurnstileResponse,
                    fieldTree: field.CfTurnstileResponse,
                  };
                }
                else{
                  result = {
                    kind: "LoginError",
                    message: JSON.stringify(err.error,null,2),
                  };
                }
              }
              else{
                console.log(JSON.stringify(err));
                throw(err);
              }
            },
          });
          return result;
        },
      }
    }*/
  );

  constructor(){
    this.loginForm.ReturnUrl().value.set(this.activatedRoute.snapshot.queryParamMap.get("ReturnUrl") || "/");
    //this.loginForm().value().
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
            this.generalError.set("Turnstile error! error code: " + errorCode);
            console.error("error-callback: " + errorCode);
          },
          'expired-callback': () => {
            //this.loginForm().setErrors({turnstileError: "Turnstile expired!"});
            this.generalError.set("Turnstile expired!");
            console.error("expired-callback");
          },
          'timeout-callback': () => {
            //this.loginForm().setErrors({turnstileError: "Turnstile timeouted!"});
            this.generalError.set("Turnstile timeouted!")
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

  onSubmit(event:SubmitEvent){
    event.preventDefault();
    this.loginForm().markAsTouched();
    if(!this.loginForm().invalid()){
      this.loginService.submitLogin(this.loginForm().value()).subscribe({
        next: (event) => {
          if(event.type === HttpEventType.Response && event.url){
            this.windowService.nativeWindow.location.href = event.url;
          }
        },
        error:(err) => {
          if(err instanceof HttpErrorResponse && err.status == HttpStatusCode.BadRequest){
            this.generalError.set(JSON.stringify(err.error,null,2));
            if(err.error.Email || err.error.Username || err.error.errors?.UsernameOrEmail){
              this.generalError.set(
                err.error.Email || 
                err.error.Username || 
                err.error.errors?.UsernameOrEmail
              );
            }
            else if(err.error.Password || err.error.errors?.Password){
              this.generalError.set(
                err.error.Password || 
                err.error.errors?.Password,
              );
            }
            else if(err.error.TurnstileError || err.error.errors?.CfTurnstileResponse){
              this.generalError.set(
                err.error.TurnstileError || 
                err.error.errors?.CfTurnstileResponse,
              );
            }
            else{
              this.generalError.set(
                JSON.stringify(err.error,null,2),
              );
            }
          }
          else{
            console.log(JSON.stringify(err));
            throw(err);
          }
        },
      });
    }
  }
}
