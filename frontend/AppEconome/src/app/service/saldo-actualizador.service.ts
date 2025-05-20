// src/app/service/saldo-actualizador.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaldoActualizadorService {
  private gastoConfirmadoSource = new Subject<number>();
  gastoConfirmado$: Observable<number> = this.gastoConfirmadoSource.asObservable();

  private gastoEliminadoSource = new Subject<number>(); // NUEVO: Para gastos eliminados
  gastoEliminado$: Observable<number> = this.gastoEliminadoSource.asObservable();

  private cambioEnGastoConfirmadoSource = new Subject<number>(); // NUEVO: Para cambios de monto en gastos confirmados
  cambioEnGastoConfirmado$: Observable<number> = this.cambioEnGastoConfirmadoSource.asObservable();

  constructor() { }

  notificarGastoConfirmado(montoGasto: number) {
    this.gastoConfirmadoSource.next(montoGasto);
  }

  notificarGastoEliminado(montoGasto: number) { // NUEVO MÉTODO
    this.gastoEliminadoSource.next(montoGasto);
  }

  notificarCambioEnGastoConfirmado(diferenciaMonto: number) { // NUEVO MÉTODO
    this.cambioEnGastoConfirmadoSource.next(diferenciaMonto);
  }
}