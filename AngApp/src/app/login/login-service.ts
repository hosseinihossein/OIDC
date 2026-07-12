import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class LoginService {
    private readonly httpClient = inject(HttpClient);

    enableTurnstile(){
        return this.httpClient.get<{enableTurnstile:boolean}>("/Identity/Api/User/EnableTurnstile");
    }
}
