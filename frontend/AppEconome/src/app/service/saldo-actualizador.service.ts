// src/app/service/saldo-actualizador.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaldoActualizadorService {
  private gastoConfirmadoSource = new Subject<number>();
  gastoConfirmado$ = this.gastoConfirmadoSource.asObservable();

  constructor() { }

  notificarGastoConfirmado(monto: number) {
    this.gastoConfirmadoSource.next(monto);
  }
}