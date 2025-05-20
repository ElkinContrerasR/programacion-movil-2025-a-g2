// src/app/dashboard/dashboard.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular'; // Añadir NavController si no está
import { EntradaService } from '../service/entrada.service';
import { SimpleMenuComponent } from '../components/simple-menu/simple-menu.component';
import { SaldoActualizadorService } from '../service/saldo-actualizador.service';
import { GastosService } from '../service/gastos.service';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SimpleMenuComponent]
})
export class DashboardPage implements OnInit, OnDestroy {
  entrada = {
    monto: null,
    descripcion: ''
  };
  usuarioId: number | null = null;
  entradaExistente: any = null;
  totalGastos: number = 0;
  saldo: number = 0;

  private gastoConfirmadoSubscription: Subscription | undefined;
  private gastoEliminadoSubscription: Subscription | undefined; // NUEVO
  private cambioEnGastoConfirmadoSubscription: Subscription | undefined; // NUEVO

  constructor(
    private entradaService: EntradaService,
    private saldoActualizadorService: SaldoActualizadorService,
    private gastosService: GastosService,
    private navController: NavController // Inyectar NavController
  ) { }

  ngOnInit() {
    this.cargarDatosIniciales();
    this.suscribirseACambiosDeGastos(); // Cambiado el nombre del método de suscripción
  }

  ngOnDestroy() {
    if (this.gastoConfirmadoSubscription) {
      this.gastoConfirmadoSubscription.unsubscribe();
    }
    if (this.gastoEliminadoSubscription) { // Desuscribirse
      this.gastoEliminadoSubscription.unsubscribe();
    }
    if (this.cambioEnGastoConfirmadoSubscription) { // Desuscribirse
      this.cambioEnGastoConfirmadoSubscription.unsubscribe();
    }
  }

  cargarDatosIniciales() {
    console.log('Cargando datos iniciales del dashboard...');
    const usuarioData = localStorage.getItem('user');

    if (usuarioData) {
      try {
        const usuarioGuardado = JSON.parse(usuarioData);
        this.usuarioId = usuarioGuardado?.id;
        console.log('ID de usuario obtenido:', this.usuarioId);

        if (this.usuarioId) {
          forkJoin([
            this.entradaService.obtenerEntradaPorUsuario(this.usuarioId),
            this.gastosService.getTotalGastosConfirmadosPorUsuario(this.usuarioId)
          ]).subscribe({
            next: ([entradaResponse, totalGastosResponse]) => {
              if (entradaResponse) {
                this.entradaExistente = entradaResponse;
                this.saldo = Number(this.entradaExistente.monto);
              } else {
                this.entradaExistente = null;
                this.saldo = 0;
                console.warn('No se encontró entrada para este usuario. Saldo inicial en 0.');
              }

              if (totalGastosResponse && totalGastosResponse.data !== null) {
                this.totalGastos = totalGastosResponse.data;
                console.log('Total de gastos confirmados cargado:', this.totalGastos);
              } else {
                this.totalGastos = 0;
                console.warn('No se pudo cargar el total de gastos confirmados o es nulo. Se establece en 0.');
              }

              this.saldo = (this.entradaExistente ? Number(this.entradaExistente.monto) : 0) - this.totalGastos;
              console.log('Saldo inicial calculado después de cargar entrada y gastos:', this.saldo);
            },
            error: (error) => {
              console.error('Error al cargar datos iniciales del dashboard:', error);
              this.entradaExistente = null;
              this.saldo = 0;
              this.totalGastos = 0;
            }
          });
        }
      } catch (error) {
        console.error('Error al parsear usuario desde localStorage:', error);
      }
    } else {
      console.warn('No se encontró información del usuario en localStorage');
    }
  }

  agregarEntrada() {
    if (this.entrada.monto === null || this.entrada.monto <= 0) {
      console.error('El monto debe ser mayor que cero');
      return;
    }

    if (this.usuarioId === null) {
      console.error('No se puede agregar la entrada porque el ID del usuario no está disponible.');
      return;
    }

    this.entradaService.agregarEntrada(
      Number(this.entrada.monto),
      this.entrada.descripcion,
      this.usuarioId
    ).subscribe({
      next: (response) => {
        console.log('Entrada agregada con éxito', response);
        this.cargarDatosIniciales();
        this.entrada.monto = null;
        this.entrada.descripcion = '';
      },
      error: (error) => {
        console.error('Error al agregar entrada:', error);
      }
    });
  }

  // MODIFICADO: Ahora se suscribe a los tres eventos de gastos
  private suscribirseACambiosDeGastos() {
    this.gastoConfirmadoSubscription = this.saldoActualizadorService.gastoConfirmado$.subscribe(
      (montoGasto: number) => {
        console.log('Gasto confirmado recibido en Dashboard:', montoGasto);
        this.actualizarSaldoPorGastoConfirmado(montoGasto);
      }
    );

    this.gastoEliminadoSubscription = this.saldoActualizadorService.gastoEliminado$.subscribe(
      (montoGasto: number) => {
        console.log('Gasto eliminado recibido en Dashboard:', montoGasto);
        this.actualizarSaldoPorGastoEliminado(montoGasto);
      }
    );

    this.cambioEnGastoConfirmadoSubscription = this.saldoActualizadorService.cambioEnGastoConfirmado$.subscribe(
      (diferenciaMonto: number) => {
        console.log('Cambio en gasto confirmado recibido en Dashboard (diferencia):', diferenciaMonto);
        this.actualizarSaldoPorCambioEnGastoConfirmado(diferenciaMonto);
      }
    );
  }

  actualizarSaldoPorGastoConfirmado(gasto: number) {
    this.saldo -= gasto;
    this.totalGastos += gasto;
    console.log('Saldo actualizado por confirmación:', this.saldo);
    console.log('Total de gastos actualizado por confirmación:', this.totalGastos);
  }

  // NUEVO MÉTODO: Actualizar saldo cuando un gasto confirmado es eliminado
  actualizarSaldoPorGastoEliminado(montoGasto: number) {
    this.saldo += montoGasto; // El saldo aumenta porque el gasto ya no se aplica
    this.totalGastos -= montoGasto; // El total de gastos confirmados disminuye
    console.log('Saldo actualizado por eliminación:', this.saldo);
    console.log('Total de gastos actualizado por eliminación:', this.totalGastos);
  }

  // NUEVO MÉTODO: Actualizar saldo cuando el monto de un gasto confirmado es editado
  actualizarSaldoPorCambioEnGastoConfirmado(diferenciaMonto: number) {
    this.saldo -= diferenciaMonto; // Si diferencia es positiva (aumento), saldo disminuye; si es negativa (disminución), saldo aumenta
    this.totalGastos += diferenciaMonto; // El total de gastos confirmados se ajusta por la diferencia
    console.log('Saldo actualizado por edición de gasto confirmado:', this.saldo);
    console.log('Total de gastos actualizado por edición de gasto confirmado:', this.totalGastos);
  }
}