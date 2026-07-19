import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Profile_Model } from './profile';

@Service()
export class ProfileService {
    private readonly httpClient = inject(HttpClient);

    getProfileModel(id:string){
        return this.httpClient.get<Profile_Model>("Identity/Api/User/ProfileModel");
    }

    getProfileImageAddress(profileModel:{
        id:string, 
        imageVersion:number, 
        hasImage:boolean, 
        remoteImageUrl?:string|null
    }|null):string|null{
        if(profileModel?.hasImage && profileModel.id){
            return `/Identity/Api/User/ProfileImage?id=${profileModel.id}&v=${profileModel.imageVersion}`;
        }
        else if(profileModel?.remoteImageUrl){
            return profileModel.remoteImageUrl;
        }
        return null;
    }

    getCsrf(){
        return this.httpClient.get("/Identity/Api/User/GetCsrf");
    }

    postUserImage(userImage:File){
        let formData = new FormData();
        formData.append("UserImage",userImage);
        return this.httpClient.post<{success:boolean,hasImage:boolean,imageVersion:number}>(
            "/Identity/Api/User/SubmitUserImage", formData
        );
    }
    deleteUserImage(){
        return this.httpClient.delete<{success:boolean}>("/Identity/Api/User/DeleteUserImage");
    }

}
