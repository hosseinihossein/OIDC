import { Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { WaitSpinner } from '../shared/wait-spinner/wait-spinner';
import { AsyncPipe, DatePipe, JsonPipe, NgOptimizedImage } from '@angular/common';
import { SingletonService } from '../shared/singleton-service';
import { MatCard, MatCardHeader, MatCardModule } from '@angular/material/card';
import { MatButton, MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { ProfileService } from './profile-service';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-profile',
  imports: [WaitSpinner, DatePipe, MatCardModule, MatButton, NgOptimizedImage, MatIcon, MatTooltip, MatIconButton, MatMiniFabButton],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly singleton = inject(SingletonService);
  private readonly profileService = inject(ProfileService);

  displayWait = linkedSignal(()=>!this.singleton.authChekced());
  idToken = signal<any>(null);
  profileModel = signal<Profile_Model|null>(null);
  profileImgSrc = computed(()=>this.profileService.getProfileImageAddress(this.profileModel()));
  editMode = signal(false);

  constructor(){
    effect(()=>{
      if(this.oidcSecurityService.authenticated().isAuthenticated){
        this.oidcSecurityService.getPayloadFromIdToken().subscribe(token=>{
          this.idToken.set(token);
        });
      }
      else{
        this.idToken.set(null);
      }
    });
    effect(()=>{
      if(this.idToken() && this.idToken().sub){
        this.profileService.getProfileModel(this.idToken().sub).subscribe({
          next: res => {
            this.profileModel.set(res);
            this.displayWait.set(false);
          },
        });
      }
      else{
        this.profileModel.set(null);
        this.displayWait.set(false);
      }
    });
  }

  login() {
    // User clicked sign-in: redirect to the identity provider.
    this.oidcSecurityService.authorize();
    this.displayWait.set(true);
  }

  logout() {
    this.oidcSecurityService.logoff().subscribe((result) => console.log(result));
    this.displayWait.set(true);
  }
}

export class Profile_Model {
  constructor(data?:Partial<Profile_Model>){
    this.id = data?.id ?? "";
    this.username = data?.username ?? "";
    this.email = data?.email ?? "";
    this.emailConfirmed = data?.emailConfirmed ?? false;
    this.displayName = data?.displayName ?? "";
    this.description = data?.description ?? "";
    this.publicEmail = data?.publicEmail ?? false;
    this.imageVersion = data?.imageVersion ?? 0;
    this.hasImage = data?.hasImage ?? false;
    this.remoteImageUrl = data?.remoteImageUrl ?? "";
    this.createdAt = data?.createdAt ?? new Date();
    this.roles = [... data?.roles ?? ""];
  }

  id:string = "";
  username:string = "";
  email:string = "";
  emailConfirmed:boolean = false;
  displayName:string = "";
  description:string = "";
  publicEmail:boolean = false;
  imageVersion:number = 0;
  hasImage:boolean = false;
  remoteImageUrl:string = "";
  createdAt:Date = new Date();
  roles:string[] = [];
}
