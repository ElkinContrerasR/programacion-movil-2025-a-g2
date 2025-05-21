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
  private apiUrl = 'http://192.168.1.6:8080/api/gastos';

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
    return this.http.get<ApiResponse<Gasto[]>>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  actualizarGastoStatus(gastoId: number, status: boolean): Observable<ApiResponse<Gasto>> {
    const url = `${this.apiUrl}/${gastoId}/status`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put<ApiResponse<Gasto>>(url, { status: status }, { headers }).pipe(
      tap(
        (response) => console.log(`Gasto ${gastoId} status actualizado a ${status}:`, response),
        (error) => console.error(`Error al actualizar el status del gasto ${gastoId}:`, error)
      ),
      catchError(this.handleError)
    );
  }

  getTotalGastosConfirmadosPorUsuario(usuarioId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/usuario/${usuarioId}/totalConfirmados`);
  }

  // NUEVO MÉTODO: Editar un gasto existente
  editarGasto(gastoId: number, usuarioId: number, gastoActualizado: Gasto): Observable<ApiResponse<Gasto>> {
    const url = `${this.apiUrl}/${gastoId}/usuario/${usuarioId}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // Excluimos el 'status' del objeto `gastoActualizado` si no queremos que este endpoint lo cambie.
    // El backend ya lo tiene separado.
    const { status, ...gastoDataToSend } = gastoActualizado;

    return this.http.put<ApiResponse<Gasto>>(url, gastoDataToSend, { headers }).pipe(
      tap(
        (response) => console.log(`Gasto ${gastoId} actualizado:`, response),
        (error) => console.error(`Error al actualizar el gasto ${gastoId}:`, error)
      ),
      catchError(this.handleError)
    );
  }

  // NUEVO MÉTODO: Eliminar un gasto
  eliminarGasto(gastoId: number, usuarioId: number): Observable<ApiResponse<string>> {
    const url = `${this.apiUrl}/${gastoId}/usuario/${usuarioId}`;
    return this.http.delete<ApiResponse<string>>(url).pipe(
      tap(
        (response) => console.log(`Gasto ${gastoId} eliminado:`, response),
        (error) => console.error(`Error al eliminar el gasto ${gastoId}:`, error)
      ),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en GastosService:', error);
    return throwError(error);
  }
}