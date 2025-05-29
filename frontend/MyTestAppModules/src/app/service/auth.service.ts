// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

// --- Nueva Interfaz para los datos del usuario (opcional pero buena práctica) ---
export interface UserUpdatePayload {
  status: boolean;
  nombreUsuario: string;
  email: string;
  password?: string; // La contraseña es opcional al actualizar
}

// Interfaz para la respuesta del backend
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

// Interfaz para los datos del usuario tal como se almacenan en localStorage
export interface UserData {
  id: number;
  nombreUsuario: string;
  email: string;
  // Otros campos del usuario si los tienes
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/usuarios';

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  logout(): void {
    localStorage.removeItem('user'); // Limpia la información del usuario del localStorage
    this.router.navigate(['/login']); // Redirige al usuario a la página de login
  }

  /**
   * Envía una solicitud PUT al backend para actualizar los datos del usuario.
   * @param usuarioId El ID del usuario a actualizar.
   * @param userData Los datos a actualizar (nombre, email, password, status).
   * @returns Un Observable con la respuesta de la API.
   */
  updateUser(usuarioId: number, userData: UserUpdatePayload): Observable<ApiResponse<UserData>> {
    return this.http.put<ApiResponse<UserData>>(`${this.apiUrl}/${usuarioId}`, userData);
  }
}