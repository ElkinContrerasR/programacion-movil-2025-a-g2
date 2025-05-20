// src/app/service/gastos.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface Gasto {
  id?: number;
  monto: number;
  descripcion: string;
  categoria: string;
  status: boolean; // true si está activo, false si está "confirmado" o "eliminado" lógicamente
}

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class GastosService {
  private apiUrl = 'http://localhost:8080/api/gastos';

  constructor(private http: HttpClient) { }

  crearGasto(usuarioId: number, gasto: Gasto): Observable<ApiResponse<Gasto>> {
    const url = `${this.apiUrl}/usuario/${usuarioId}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<ApiResponse<Gasto>>(url, gasto, { headers }).pipe(
      tap(
        (response) => console.log('Respuesta del backend (éxito):', response),
        (error) => console.error('Respuesta del backend (error):', error)
      ),
      catchError(this.handleError)
    );
  }

  obtenerGastosPorUsuario(usuarioId: number): Observable<ApiResponse<Gasto[]>> {
    // Cuando cargues los gastos, recibirás el 'status' real desde el backend
    return this.http.get<ApiResponse<Gasto[]>>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  // **NUEVO MÉTODO:** para actualizar el estado del gasto en el backend
  actualizarGastoStatus(gastoId: number, status: boolean): Observable<ApiResponse<Gasto>> {
    const url = `${this.apiUrl}/${gastoId}/status`; // Nuevo endpoint
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // El backend espera un objeto JSON con el nuevo status: { "status": false }
    return this.http.put<ApiResponse<Gasto>>(url, { status: status }, { headers }).pipe(
      tap(
        (response) => console.log(`Gasto ${gastoId} status actualizado a ${status}:`, response),
        (error) => console.error(`Error al actualizar el status del gasto ${gastoId}:`, error)
      ),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en GastosService:', error);
    return throwError(error);
  }
}