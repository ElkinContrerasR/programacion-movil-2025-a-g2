import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://192.168.1.6:8080/api/usuarios';
  
  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

   logout(): void {
    localStorage.removeItem('user'); // Limpia la información del usuario del localStorage
    this.router.navigate(['/login']); // Redirige al usuario a la página de login
  }
  
}
