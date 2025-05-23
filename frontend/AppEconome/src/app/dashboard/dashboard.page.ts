// src/app/dashboard/dashboard.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { EntradaService } from '../service/entrada.service';
import { SimpleMenuComponent } from '../components/simple-menu/simple-menu.component';
import { SaldoActualizadorService } from '../service/saldo-actualizador.service';
import { GastosService } from '../service/gastos.service';
import { Subscription, forkJoin } from 'rxjs';

// --- Interfaces para mayor claridad de tipos ---
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
  // Si tu entidad Entrada tiene un objeto Usuario anidado, inclúyelo aquí
  usuario?: { id: number };
}

// Puedes reutilizar la interfaz Gasto de gastos.service.ts si la importas o la defines aquí también
interface Gasto {
  id?: number;
  monto: number;
  descripcion: string;
  categoria: string;
  status: boolean;
}
// --- Fin de Interfaces ---


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
  entradaExistente: Entrada | null = null; // Cambiado de 'any' a la interfaz Entrada
  totalGastos: number = 0;
  saldo: number = 0;

  private gastoConfirmadoSubscription: Subscription | undefined;
  private gastoEliminadoSubscription: Subscription | undefined;
  private cambioEnGastoConfirmadoSubscription: Subscription | undefined;
  // Esta suscripción es nueva y la usaremos para notificar al dashboard cuando haya cambios en los gastos
  private gastosActualizadosSubscription: Subscription | undefined;

  constructor(
    private entradaService: EntradaService,
    private saldoActualizadorService: SaldoActualizadorService,
    private gastosService: GastosService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.cargarDatosIniciales();
    this.suscribirseACambiosDeGastos();

    // Nueva suscripción para que el dashboard se actualice si hay cambios en los gastos desde otras páginas
    this.gastosActualizadosSubscription = this.saldoActualizadorService.gastosActualizados$.subscribe(() => {
        console.log('Notificación de gastos actualizados recibida en DashboardPage. Recargando datos...');
        this.cargarDatosIniciales(); // Recarga todo el dashboard
    });
  }

  ngOnDestroy() {
    if (this.gastoConfirmadoSubscription) {
      this.gastoConfirmadoSubscription.unsubscribe();
    }
    if (this.gastoEliminadoSubscription) {
      this.gastoEliminadoSubscription.unsubscribe();
    }
    if (this.cambioEnGastoConfirmadoSubscription) {
      this.cambioEnGastoConfirmadoSubscription.unsubscribe();
    }
    if (this.gastosActualizadosSubscription) { // Desuscribirse de la nueva suscripción
        this.gastosActualizadosSubscription.unsubscribe();
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
          // Usamos forkJoin para esperar ambas llamadas al servicio.
          // CRÍTICO: Los servicios de entrada y gastos ahora devuelven ApiResponse<T>
          forkJoin([
            this.entradaService.obtenerEntradaPorUsuario(this.usuarioId),
            this.gastosService.getTotalGastosConfirmadosPorUsuario(this.usuarioId)
          ]).subscribe({
            next: ([entradaResponse, totalGastosResponse]) => {
              // --- Lógica para la Entrada ---
              // Ahora esperamos que entradaResponse sea un ApiResponseDto
              if (entradaResponse && entradaResponse.status && entradaResponse.data) {
                this.entradaExistente = entradaResponse.data; // Acceder a la propiedad 'data'
                this.saldo = Number(this.entradaExistente.monto); // El saldo inicial es el monto de la entrada
                console.log('Entrada inicial cargada:', this.entradaExistente.monto);
              } else {
                this.entradaExistente = null; // Si no hay entrada o la respuesta no es exitosa
                this.saldo = 0;
                console.warn('No se encontró entrada inicial para este usuario o la respuesta no fue exitosa. Saldo inicial en 0.');
              }

              // --- Lógica para el Total de Gastos Confirmados ---
              // totalGastosResponse ya es ApiResponse<number> en tu GastosService
              if (totalGastosResponse && totalGastosResponse.status && totalGastosResponse.data !== null && totalGastosResponse.data !== undefined) {
                this.totalGastos = totalGastosResponse.data;
                console.log('Total de gastos confirmados cargado:', this.totalGastos);
              } else {
                this.totalGastos = 0;
                console.warn('No se pudo cargar el total de gastos confirmados o es nulo/indefinido. Se establece en 0.');
              }

              // --- Recalcular Saldo ---
              this.saldo = (this.entradaExistente ? Number(this.entradaExistente.monto) : 0) - this.totalGastos;
              console.log('Saldo final calculado en Dashboard (Entrada - Gastos):', this.saldo);
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
      console.warn('No se encontró información del usuario en localStorage. Redirigiendo a login...');
      this.navController.navigateRoot('/login'); // Redirigir al login si no hay usuario
    }
  }

  agregarEntrada() {
    if (this.entrada.monto === null || this.entrada.monto <= 0) {
      console.error('El monto debe ser mayor que cero');
      // Podrías añadir una alerta al usuario aquí
      return;
    }

    if (this.usuarioId === null) {
      console.error('No se puede agregar la entrada porque el ID del usuario no está disponible.');
      // Podrías redirigir al login o mostrar un error
      return;
    }

    this.entradaService.agregarEntrada(
      Number(this.entrada.monto),
      this.entrada.descripcion,
      this.usuarioId
    ).subscribe({
      next: (response: ApiResponse<Entrada>) => { // Esperar ApiResponse<Entrada>
        console.log('Respuesta de agregar entrada:', response);
        if (response.status && response.data) {
          console.log('Entrada agregada con éxito', response.data);
          this.entradaExistente = response.data; // Almacena la entrada recién creada desde 'data'
          this.saldoActualizadorService.notificarGastosActualizados(); // Notificar a otros componentes (ej. informe)
          this.cargarDatosIniciales(); // Recargar todos los datos para actualizar el saldo
          this.entrada.monto = null; // Limpiar el formulario
          this.entrada.descripcion = '';
        } else {
          console.error('Error al agregar entrada:', response.message || 'Respuesta inesperada del servidor.');
          // Mostrar un mensaje de error al usuario
        }
      },
      error: (error) => {
        console.error('Error en la llamada al servicio agregarEntrada:', error);
        // Mostrar un mensaje de error al usuario
      }
    });
  }

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
    this.totalGastos += gasto;
    this.saldo = (this.entradaExistente ? Number(this.entradaExistente.monto) : 0) - this.totalGastos;
    console.log('Saldo y Total de gastos actualizados por confirmación.');
  }

  actualizarSaldoPorGastoEliminado(montoGasto: number) {
    this.totalGastos -= montoGasto; // El total de gastos confirmados disminuye
    this.saldo = (this.entradaExistente ? Number(this.entradaExistente.monto) : 0) - this.totalGastos;
    console.log('Saldo y Total de gastos actualizados por eliminación.');
  }

  actualizarSaldoPorCambioEnGastoConfirmado(diferenciaMonto: number) {
    this.totalGastos += diferenciaMonto; // El total de gastos confirmados se ajusta por la diferencia
    this.saldo = (this.entradaExistente ? Number(this.entradaExistente.monto) : 0) - this.totalGastos;
    console.log('Saldo y Total de gastos actualizados por edición de gasto confirmado.');
  }
}