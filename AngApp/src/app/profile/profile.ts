import { Component, computed, effect, inject, signal } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { WaitSpinner } from '../shared/wait-spinner/wait-spinner';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { SingletonService } from '../shared/singleton-service';
import { MatCard, MatCardHeader, MatCardModule } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { ProfileService } from './profile-service';

@Component({
  selector: 'app-profile',
  imports: [WaitSpinner, JsonPipe, /*AsyncPipe,*/ MatCardModule/*, MatButton*/],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly singleton = inject(SingletonService);
  private readonly profileService = inject(ProfileService);

  stopWaiting = computed(()=>this.singleton.authChekced());
  idToken = signal<any>(null);
  profileModel = signal<Profile_Model|null>(null);

  constructor(){
    effect(()=>{
      if(this.oidcSecurityService.authenticated().isAuthenticated){
        this.oidcSecurityService.getPayloadFromIdToken().subscribe(token=>{
          this.idToken.set(token);
          if(token?.sub){
            this.profileService.getProfileModel(token.sub).subscribe({
              next: res => {
                if(res){
                  this.profileModel.set(res);
                }
              },
            });
          }
        });
      }
    });
  }
  /*ngOnInit(): void {
    if(this.singleton.authChekced()){
      this.stopWaiting.set(true);
    }
  }*/

  login() {
    // User clicked sign-in: redirect to the identity provider.
    this.oidcSecurityService.authorize();
  }

  logout() {
    this.oidcSecurityService.logoff().subscribe((result) => console.log(result));
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
