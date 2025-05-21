// src/app/service/gastos.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// --- Interfaces ---
// Se asume que estas interfaces son globales o se importan aquí
interface Gasto {
  id?: number;
  monto: number;
  descripcion: string;
  categoria: string;
  status: boolean; // true si está activo/pendiente, false si está "confirmado" o "eliminado" lógicamente
  usuario?: { id: number }; // Añadido por consistencia si el backend devuelve el usuario
}

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}
// --- Fin de Interfaces ---

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
        (response) => console.log('Respuesta del backend (éxito al crear gasto):', response),
        (error) => console.error('Respuesta del backend (error al crear gasto):', error)
      ),
      catchError(this.handleError)
    );
  }

  obtenerGastosPorUsuario(usuarioId: number): Observable<ApiResponse<Gasto[]>> {
    return this.http.get<ApiResponse<Gasto[]>>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  // Este método actualiza el status del gasto. Es CRÍTICO para tu informe.
  // Si status: true significa pendiente y status: false significa confirmado,
  // entonces en tu página de gastos debes llamar a este método con `false`
  // para que el gasto se sume en el informe.
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

  editarGasto(gastoId: number, usuarioId: number, gastoActualizado: Gasto): Observable<ApiResponse<Gasto>> {
    const url = `${this.apiUrl}/${gastoId}/usuario/${usuarioId}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const { status, ...gastoDataToSend } = gastoActualizado; // Excluir status si el backend lo maneja aparte
    // Si tu endpoint de backend para editar gasto también espera el 'status' en el payload,
    // entonces no excluyas 'status' de 'gastoDataToSend'.
    // Si el backend tiene un endpoint PUT /gastos/{id} que acepta todo el objeto Gasto,
    // podrías enviar gastoActualizado directamente.
    // Revisa tu backend: si el PUT solo edita monto, descripcion, categoria y el status se edita con otro endpoint,
    // entonces dejar 'status' excluido es correcto. Si PUT edita TODO, entonces envía todo.
    // Por ahora, lo mantengo como lo tenías.
    return this.http.put<ApiResponse<Gasto>>(url, gastoDataToSend, { headers }).pipe(
      tap(
        (response) => console.log(`Gasto ${gastoId} actualizado:`, response),
        (error) => console.error(`Error al actualizar el gasto ${gastoId}:`, error)
      ),
      catchError(this.handleError)
    );
  }

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
    // Propaga el error para que el componente que llama pueda manejarlo
    return throwError(() => new Error(error.message || 'Error en el servicio de gastos'));
  }
}