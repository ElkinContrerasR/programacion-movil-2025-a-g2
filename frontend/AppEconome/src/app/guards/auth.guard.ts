import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const user = localStorage.getItem('user'); // Obtén el usuario del localStorage

    if (user) { // Verifica si existe un usuario en localStorage
      try {
        const userData = JSON.parse(user);
        if (userData && userData.id) { // Verifica si el usuario tiene un ID (indicador de sesión)
          return true; // Usuario autenticado
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Si no hay usuario o no hay ID, redirige al login
    this.router.navigate(['/login']);
    return false;
  }

}