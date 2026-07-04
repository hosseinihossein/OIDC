import { Service, signal } from '@angular/core';

@Service()
export class SingletonService {
    authChekced = signal(false);
}
