import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EntradaService } from '../service/entrada.service';
import { SimpleMenuComponent } from '../components/simple-menu/simple-menu.component';
import { SaldoActualizadorService } from '../service/saldo-actualizador.service';
import { GastosService } from '../service/gastos.service'; // Importa GastosService
import { Subscription, forkJoin } from 'rxjs'; // Importa forkJoin

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
  totalGastos: number = 0; // Se inicializa en 0, pero se actualizará al cargar
  saldo: number = 0;

  private gastoConfirmadoSubscription: Subscription | undefined;

  constructor(
    private entradaService: EntradaService,
    private saldoActualizadorService: SaldoActualizadorService,
    private gastosService: GastosService // Inyecta GastosService
  ) { }

  ngOnInit() {
    this.cargarDatosIniciales();
    this.suscribirseAGastosConfirmados();
  }

  ngOnDestroy() {
    if (this.gastoConfirmadoSubscription) {
      this.gastoConfirmadoSubscription.unsubscribe();
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
          // Usamos forkJoin para esperar a que ambas llamadas asíncronas se completen
          forkJoin([
            this.entradaService.obtenerEntradaPorUsuario(this.usuarioId),
            this.gastosService.getTotalGastosConfirmadosPorUsuario(this.usuarioId)
          ]).subscribe({
            next: ([entradaResponse, totalGastosResponse]) => {
              // Manejo de la respuesta de Entrada
              if (entradaResponse) { // Asumiendo que obtenerEntradaPorUsuario ya devuelve el objeto de entrada o null
                  this.entradaExistente = entradaResponse;
                  console.log('Entrada existente encontrada:', this.entradaExistente);
                  this.saldo = Number(this.entradaExistente.monto);
              } else {
                  this.entradaExistente = null;
                  this.saldo = 0;
                  console.warn('No se encontró entrada para este usuario. Saldo inicial en 0.');
              }

              // Manejo de la respuesta de Total Gastos Confirmados
              if (totalGastosResponse && totalGastosResponse.data !== null) {
                  this.totalGastos = totalGastosResponse.data;
                  console.log('Total de gastos confirmados cargado:', this.totalGastos);
              } else {
                  this.totalGastos = 0;
                  console.warn('No se pudo cargar el total de gastos confirmados o es nulo. Se establece en 0.');
              }

              // Calcular el saldo final después de que ambas llamadas se completen
              this.saldo = (this.entradaExistente ? Number(this.entradaExistente.monto) : 0) - this.totalGastos;
              console.log('Saldo inicial calculado después de cargar entrada y gastos:', this.saldo);
            },
            error: (error) => {
              console.error('Error al cargar datos iniciales del dashboard:', error);
              // Establecer valores por defecto en caso de error
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
        // Al agregar una nueva entrada, debemos recalcular todo para reflejar los cambios
        this.cargarDatosIniciales(); // Esto volverá a cargar entrada y gastos confirmados
        this.entrada.monto = null;
        this.entrada.descripcion = '';
      },
      error: (error) => {
        console.error('Error al agregar entrada:', error);
      }
    });
  }

  private suscribirseAGastosConfirmados() {
    this.gastoConfirmadoSubscription = this.saldoActualizadorService.gastoConfirmado$.subscribe(
      (montoGasto: number) => {
        console.log('Gasto confirmado recibido en Dashboard:', montoGasto);
        this.actualizarSaldoPorGasto(montoGasto);
      }
    );
  }

  actualizarSaldoPorGasto(gasto: number) {
    this.saldo -= gasto;
    this.totalGastos += gasto;
    console.log('Saldo actualizado:', this.saldo);
    console.log('Total de gastos actualizado:', this.totalGastos);
  }
}