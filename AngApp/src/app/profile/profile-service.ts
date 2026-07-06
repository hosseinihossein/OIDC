import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Profile_Model } from './profile';

@Service()
export class ProfileService {
    private readonly httpClient = inject(HttpClient);

    getProfileModel(id:string){
        return this.httpClient.get<Profile_Model>("Identity/Api/User/ProfileModel");
    }
}
