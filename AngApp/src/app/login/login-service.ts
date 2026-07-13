import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { LoginModel } from './login';

@Service()
export class LoginService {
    private readonly httpClient = inject(HttpClient);

    /*enableTurnstile(){
        return this.httpClient.get<{enableTurnstile:boolean}>("/Identity/Api/User/EnableTurnstile");
    }*/

    submitLogin(formModel:LoginModel){
        let params = new HttpParams();
        params = params.appendAll({//... formModel
            ["CfTurnstileResponse"]:formModel.CfTurnstileResponse,
            ["UsernameOrEmail"]:formModel.UsernameOrEmail,
            ["Password"]:formModel.Password,
            ["ReturnUrl"]:formModel.ReturnUrl,
        });
        return this.httpClient.post("Identity/Api/Authentication/Login",params,
            {observe:"events",responseType:"text",redirect:"follow"}
        );
    }

}
