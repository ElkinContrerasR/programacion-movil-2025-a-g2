import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// --- Interfaces (pueden ser las mismas que en dashboard.page.ts) ---
interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface Entrada {
  id?: number;
  monto: number;
  descripcion: string;
  status: boolean;
  usuario?: { id: number }; // si tu frontend necesita el objeto usuario anidado
}
// --- Fin de Interfaces ---

@Injectable({
  providedIn: 'root'
})
export class EntradaService {
  // Asegúrate de que esta URL sea correcta. Si usas localhost en el desarrollo,
  // recuerda cambiarla para producción si tu backend no está en el mismo servidor.
  private apiUrl = environment.apiUrl + '/entrada'; 
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Cambiado el tipo de retorno a Observable<ApiResponse<Entrada>>
  agregarEntrada(monto: number, descripcion: string, usuarioId: number): Observable<ApiResponse<Entrada>> {
    const entradaParaEnviar = {
      status: true,
      monto: monto,
      descripcion: descripcion,
      usuario: {
        id: usuarioId
      }
    };
    // Asegúrate de que el backend devuelve un ApiResponse<Entrada> para este POST
    return this.http.post<ApiResponse<Entrada>>(this.apiUrl, entradaParaEnviar, this.httpOptions);
  }

  // Cambiado el tipo de retorno a Observable<ApiResponse<Entrada>>
  obtenerEntradaPorUsuario(usuarioId: number): Observable<ApiResponse<Entrada>> {
    // Aquí también esperamos que el backend devuelva un ApiResponse<Entrada>
    return this.http.get<ApiResponse<Entrada>>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  // Otros métodos si los tienes, asegúrate de que también manejen ApiResponse
}