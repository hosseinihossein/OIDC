import { Routes } from '@angular/router';
import { Profile } from './profile/profile';
import { Login } from './login/login';
import { Consent } from './consent/consent';

export const routes: Routes = [
    {path: "Account/Login", component: Login},
    {path: "Authorize/Consent", component: Consent},
    {path: "", component: Profile},
];
