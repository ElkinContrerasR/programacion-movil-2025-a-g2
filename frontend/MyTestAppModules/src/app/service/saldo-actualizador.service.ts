import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaldoActualizadorService {
  // BehaviorSubject para el saldo actual (inicializado en 0)
  private saldoSubject = new BehaviorSubject<number>(0);
  saldoActual$ = this.saldoSubject.asObservable();

  // Subject para notificar que un gasto ha sido confirmado (para restar del saldo)
  private gastoConfirmadoSubject = new Subject<number>();
  gastoConfirmado$ = this.gastoConfirmadoSubject.asObservable();

  // Subject para notificar que un gasto confirmado ha sido eliminado (para sumar de nuevo al saldo)
  private gastoEliminadoSubject = new Subject<number>();
  gastoEliminado$ = this.gastoEliminadoSubject.asObservable();

  // Subject para notificar un cambio en un gasto ya confirmado (para ajustar el saldo)
  private cambioEnGastoConfirmadoSubject = new Subject<number>(); // Emite la diferencia (nuevoMonto - viejoMonto)
  cambioEnGastoConfirmado$ = this.cambioEnGastoConfirmadoSubject.asObservable();

  // ***** NUEVO: Subject para notificar cambios generales en los gastos para el informe *****
  private gastosActualizadosSubject = new Subject<void>();
  gastosActualizados$ = this.gastosActualizadosSubject.asObservable(); // Observable para que los componentes se suscriban

  constructor() { }

  // Métodos existentes (mantenerlos igual)
  actualizarSaldo(nuevoSaldo: number) {
    this.saldoSubject.next(nuevoSaldo);
  }

  notificarGastoConfirmado(montoGasto: number) {
    this.gastoConfirmadoSubject.next(montoGasto);
  }

  notificarGastoEliminado(montoGasto: number) {
    this.gastoEliminadoSubject.next(montoGasto);
  }

  notificarCambioEnGastoConfirmado(diferenciaMonto: number) {
    this.cambioEnGastoConfirmadoSubject.next(diferenciaMonto);
  }

  // ***** NUEVO: Método para que otros componentes notifiquen un cambio en los gastos *****
  notificarGastosActualizados() {
    this.gastosActualizadosSubject.next();
    console.log('Notificación de gastos actualizados emitida.'); // Para depuración
  }
}