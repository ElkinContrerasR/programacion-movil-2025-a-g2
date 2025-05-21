import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntradaService {
  private apiUrl = 'http://192.168.1.6:8080/api/entrada';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  agregarEntrada(monto: number, descripcion: string, usuarioId: number): Observable<any> {
    const entradaParaEnviar = {
      status: true, // Enviamos directamente el booleano
      monto: monto,
      descripcion: descripcion,
      usuario: {
        id: usuarioId
      }
    };
    return this.http.post(this.apiUrl, entradaParaEnviar, this.httpOptions);
  }

  obtenerEntradaPorUsuario(usuarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuario/${usuarioId}`);
  }


}
