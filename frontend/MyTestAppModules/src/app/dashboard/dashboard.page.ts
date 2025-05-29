// src/app/dashboard/dashboard.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ModalController, AlertController } from '@ionic/angular';
import { EntradaService } from '../service/entrada.service';
import { SimpleMenuComponent } from '../components/simple-menu/simple-menu.component';
import { SaldoActualizadorService } from '../service/saldo-actualizador.service';
import { GastosService } from '../service/gastos.service';
import { Subscription, forkJoin } from 'rxjs';
import { EditProfileModalComponent } from '../components/edit-profile-modal/edit-profile-modal.component'; // Importa el modal
import { AuthService, UserData } from '../service/auth.service'; // Importa AuthService y UserData

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
  standalone: false
})
export class DashboardPage implements OnInit, OnDestroy {
  entrada = {
    monto: null as number | null, // Inicializado como null, tipo específico
    descripcion: ''
  };
  usuarioId: number | null = null;
  nombreUsuario: string = ''; // Añadir para almacenar el nombre del usuario
  emailUsuario: string = '';  // Añadir para almacenar el email del usuario
  entradaExistente: Entrada | null = null; // Cambiado de 'any' a la interfaz Entrada
  totalGastos: number = 0;
  saldo: number = 0;

  private gastoConfirmadoSubscription: Subscription | undefined;
  private gastoEliminadoSubscription: Subscription | undefined;
  private cambioEnGastoConfirmadoSubscription: Subscription | undefined;
  private gastosActualizadosSubscription: Subscription | undefined;

  constructor(
    private entradaService: EntradaService,
    private saldoActualizadorService: SaldoActualizadorService,
    private gastosService: GastosService,
    private navController: NavController,
    private modalController: ModalController, // ¡Inyecta ModalController!
    private alertController: AlertController, // ¡Inyecta AlertController!
    private authService: AuthService // ¡Inyecta AuthService!
  ) {
    console.log('DashboardPage: Constructor ejecutado.');
  }

  ngOnInit() {
    console.log('DashboardPage: ngOnInit - Inicializando componente.');
    this.cargarDatosIniciales();
    this.suscribirseACambiosDeGastos();

    this.gastosActualizadosSubscription = this.saldoActualizadorService.gastosActualizados$.subscribe(() => {
      console.log('DashboardPage: Notificación de gastosActualizados$ recibida. Recargando datos iniciales...');
      this.cargarDatosIniciales(); // Recarga todo el dashboard
    });
    console.log('DashboardPage: Suscripciones inicializadas en ngOnInit.');
  }

  ngOnDestroy() {
    console.log('DashboardPage: ngOnDestroy - Limpiando suscripciones.');
    if (this.gastoConfirmadoSubscription) {
      this.gastoConfirmadoSubscription.unsubscribe();
      console.log('DashboardPage: gastoConfirmadoSubscription desuscrita.');
    }
    if (this.gastoEliminadoSubscription) {
      this.gastoEliminadoSubscription.unsubscribe();
      console.log('DashboardPage: gastoEliminadoSubscription desuscrita.');
    }
    if (this.cambioEnGastoConfirmadoSubscription) {
      this.cambioEnGastoConfirmadoSubscription.unsubscribe();
      console.log('DashboardPage: cambioEnGastoConfirmadoSubscription desuscrita.');
    }
    if (this.gastosActualizadosSubscription) {
      this.gastosActualizadosSubscription.unsubscribe();
      console.log('DashboardPage: gastosActualizadosSubscription desuscrita.');
    }
  }

  cargarDatosIniciales() {
    console.log('cargarDatosIniciales: Iniciando carga de datos.');
    console.log('cargarDatosIniciales: entradaExistente actual antes de la llamada API:', this.entradaExistente);
    const usuarioData = localStorage.getItem('user');

    if (usuarioData) {
      try {
        const usuarioGuardado: UserData = JSON.parse(usuarioData); // Usar la interfaz UserData
        this.usuarioId = usuarioGuardado?.id;
        this.nombreUsuario = usuarioGuardado?.nombreUsuario || ''; // Cargar el nombre del usuario
        this.emailUsuario = usuarioGuardado?.email || '';         // Cargar el email del usuario
        console.log('cargarDatosIniciales: ID de usuario obtenido de localStorage:', this.usuarioId);
        console.log('cargarDatosIniciales: Nombre de usuario:', this.nombreUsuario);
        console.log('cargarDatosIniciales: Email de usuario:', this.emailUsuario);


        if (this.usuarioId) {
          console.log('cargarDatosIniciales: Realizando llamadas a servicios (forkJoin) para usuarioId:', this.usuarioId);
          forkJoin([
            this.entradaService.obtenerEntradaPorUsuario(this.usuarioId),
            this.gastosService.getTotalGastosConfirmadosPorUsuario(this.usuarioId)
          ]).subscribe({
            next: ([entradaResponse, totalGastosResponse]) => {
              console.log('cargarDatosIniciales: Respuesta completa de forkJoin recibida.');
              console.log('cargarDatosIniciales: entradaResponse:', entradaResponse);
              console.log('cargarDatosIniciales: totalGastosResponse:', totalGastosResponse);

              // --- Lógica para la Entrada ---
              if (entradaResponse && entradaResponse.status && entradaResponse.data) {
                this.entradaExistente = entradaResponse.data; // Acceder a la propiedad 'data'
                this.saldo = Number(this.entradaExistente.monto); // El saldo inicial es el monto de la entrada
                console.log('cargarDatosIniciales: Entrada inicial CARGADA y ASIGNADA:', this.entradaExistente.monto);
                console.log('cargarDatosIniciales: Saldo actualizado con monto de entrada:', this.saldo);
              } else {
                this.entradaExistente = null; // Si no hay entrada o la respuesta no es exitosa
                this.saldo = 0;
                console.warn('cargarDatosIniciales: NO se encontró entrada inicial o la respuesta no fue exitosa. entradaExistente = null. Saldo inicial en 0.');
              }
              console.log('cargarDatosIniciales: Estado de entradaExistente después de procesar respuesta de entrada:', this.entradaExistente);


              // --- Lógica para el Total de Gastos Confirmados ---
              if (totalGastosResponse && totalGastosResponse.status && totalGastosResponse.data !== null && totalGastosResponse.data !== undefined) {
                this.totalGastos = totalGastosResponse.data;
                console.log('cargarDatosIniciales: Total de gastos confirmados CARGADO:', this.totalGastos);
              } else {
                this.totalGastos = 0;
                console.warn('cargarDatosIniciales: NO se pudo cargar el total de gastos confirmados o es nulo/indefinido. Se establece en 0.');
              }

              // --- Recalcular Saldo Final ---
              this.saldo = (this.entradaExistente ? Number(this.entradaExistente.monto) : 0) - this.totalGastos;
              console.log('cargarDatosIniciales: Saldo FINAL calculado en Dashboard (Entrada - Gastos):', this.saldo);
              console.log('cargarDatosIniciales: Datos iniciales completamente cargados.');
            },
            error: (error) => {
              console.error('cargarDatosIniciales: ERROR al cargar datos iniciales del dashboard (forkJoin error):', error);
              this.entradaExistente = null; // Asegurarse de que se muestre el formulario si hay un error
              this.saldo = 0;
              this.totalGastos = 0;
              console.log('cargarDatosIniciales: entradaExistente establecido a null debido a error.');
            }
          });
        } else {
          console.warn('cargarDatosIniciales: usuarioId es null. No se pueden cargar los datos de entrada/gastos.');
        }
      } catch (error) {
        console.error('cargarDatosIniciales: ERROR al parsear usuario desde localStorage:', error);
        this.navController.navigateRoot('/login'); // Redirigir si hay un problema con el usuario
      }
    } else {
      console.warn('cargarDatosIniciales: NO se encontró información del usuario en localStorage. Redirigiendo a login...');
      this.navController.navigateRoot('/login'); // Redirigir al login si no hay usuario
    }
  }

  agregarEntrada() {
    console.log('agregarEntrada: Intentando agregar entrada...');
    console.log('agregarEntrada: Monto a enviar:', this.entrada.monto, 'Descripción:', this.entrada.descripcion);

    if (this.entrada.monto === null || this.entrada.monto <= 0) {
      console.error('agregarEntrada: Validación fallida - El monto debe ser mayor que cero.');
      this.presentAlert('Error', 'El monto debe ser mayor que cero.'); // Alerta al usuario
      return;
    }

    if (this.usuarioId === null) {
      console.error('agregarEntrada: No se puede agregar la entrada porque el ID del usuario no está disponible.');
      this.presentAlert('Error', 'No se puede agregar la entrada porque el ID del usuario no está disponible.'); // Alerta al usuario
      return;
    }

    console.log('agregarEntrada: Llamando a entradaService.agregarEntrada con usuarioId:', this.usuarioId);
    this.entradaService.agregarEntrada(
      Number(this.entrada.monto),
      this.entrada.descripcion,
      this.usuarioId
    ).subscribe({
      next: (response: ApiResponse<Entrada>) => { // Esperar ApiResponse<Entrada>
        console.log('agregarEntrada: Respuesta de agregar entrada recibida:', response);
        if (response.status && response.data) {
          console.log('agregarEntrada: Entrada agregada con éxito. Datos recibidos:', response.data);
          this.entradaExistente = response.data; // Almacena la entrada recién creada desde 'data'
          console.log('agregarEntrada: entradaExistente ASIGNADA después de agregar:', this.entradaExistente);

          this.saldoActualizadorService.notificarGastosActualizados(); // Notificar a otros componentes (ej. informe)
          console.log('agregarEntrada: Notificando gastos actualizados.');

          this.cargarDatosIniciales(); // Recargar todos los datos para actualizar el saldo
          console.log('agregarEntrada: Llamando a cargarDatosIniciales() para refrescar dashboard.');

          this.entrada.monto = null; // Limpiar el formulario
          this.entrada.descripcion = '';
          console.log('agregarEntrada: Formulario limpiado.');
          this.presentAlert('Éxito', 'Entrada agregada correctamente.'); // Alerta de éxito
        } else {
          console.error('agregarEntrada: Error al agregar entrada:', response.message || 'Respuesta inesperada del servidor (status false o data nula).');
          this.presentAlert('Error', response.message || 'No se pudo agregar la entrada.'); // Alerta de error
        }
      },
      error: (error) => {
        console.error('agregarEntrada: ERROR en la llamada al servicio agregarEntrada:', error);
        this.presentAlert('Error', 'Ocurrió un error al agregar la entrada.'); // Alerta de error
      }
    });
  }

  private suscribirseACambiosDeGastos() {
    console.log('suscribirseACambiosDeGastos: Iniciando suscripciones para cambios en gastos.');
    this.gastoConfirmadoSubscription = this.saldoActualizadorService.gastoConfirmado$.subscribe(
      (montoGasto: number) => {
        console.log('suscribirseACambiosDeGastos: Gasto confirmado recibido:', montoGasto);
        this.actualizarSaldoPorGastoConfirmado(montoGasto);
      }
    );

    this.gastoEliminadoSubscription = this.saldoActualizadorService.gastoEliminado$.subscribe(
      (montoGasto: number) => {
        console.log('suscribirseACambiosDeGastos: Gasto eliminado recibido:', montoGasto);
        this.actualizarSaldoPorGastoEliminado(montoGasto);
      }
    );

    this.cambioEnGastoConfirmadoSubscription = this.saldoActualizadorService.cambioEnGastoConfirmado$.subscribe(
      (diferenciaMonto: number) => {
        console.log('suscribirseACambiosDeGastos: Cambio en gasto confirmado recibido (diferencia):', diferenciaMonto);
        this.actualizarSaldoPorCambioEnGastoConfirmado(diferenciaMonto);
      }
    );
    console.log('suscribirseACambiosDeGastos: Suscripciones de gastos configuradas.');
  }

  actualizarSaldoPorGastoConfirmado(gasto: number) {
    console.log('actualizarSaldoPorGastoConfirmado: Gasto confirmado:', gasto);
    this.totalGastos += gasto;
    this.saldo = (this.entradaExistente ? Number(this.entradaExistente.monto) : 0) - this.totalGastos;
    console.log('actualizarSaldoPorGastoConfirmado: Saldo y Total de gastos actualizados por confirmación. Nuevo Saldo:', this.saldo);
  }

  actualizarSaldoPorGastoEliminado(montoGasto: number) {
    console.log('actualizarSaldoPorGastoEliminado: Gasto eliminado:', montoGasto);
    this.totalGastos -= montoGasto; // El total de gastos confirmados disminuye
    this.saldo = (this.entradaExistente ? Number(this.entradaExistente.monto) : 0) - this.totalGastos;
    console.log('actualizarSaldoPorGastoEliminado: Saldo y Total de gastos actualizados por eliminación. Nuevo Saldo:', this.saldo);
  }

  actualizarSaldoPorCambioEnGastoConfirmado(diferenciaMonto: number) {
    console.log('actualizarSaldoPorCambioEnGastoConfirmado: Diferencia en gasto confirmado:', diferenciaMonto);
    this.totalGastos += diferenciaMonto; // El total de gastos confirmados se ajusta por la diferencia
    this.saldo = (this.entradaExistente ? Number(this.entradaExistente.monto) : 0) - this.totalGastos;
    console.log('actualizarSaldoPorCambioEnGastoConfirmado: Saldo y Total de gastos actualizados por edición de gasto confirmado. Nuevo Saldo:', this.saldo);
  }

  /**
   * Abre el modal para editar la información del perfil del usuario.
   */
  async openEditProfileModal() {
    // Asegúrate de que el usuario esté cargado antes de abrir el modal
    if (!this.usuarioId) {
      await this.presentAlert('Error', 'No se pudo cargar la información del usuario para editar.');
      return;
    }

    const modal = await this.modalController.create({
      component: EditProfileModalComponent,
      componentProps: {
        usuarioId: this.usuarioId,
        currentNombreUsuario: this.nombreUsuario, // Pasa el nombre actual al modal
        currentEmail: this.emailUsuario         // Pasa el email actual al modal
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss(); // Espera a que el modal se cierre
    if (data) { // Si el modal devuelve 'true' significa que la actualización fue exitosa
      await this.presentAlert('Actualización Exitosa', 'Tu información de perfil ha sido actualizada.');
      // Después de actualizar, recargamos los datos del usuario.
      // `cargarDatosIniciales` leerá el localStorage, que ya fue actualizado por el modal.
      this.cargarDatosIniciales();
    } else {
      console.log('Modal de edición de perfil cerrado sin guardar cambios o con error.');
    }
  }

  /**
   * Muestra una alerta Ionic.
   * @param header Título de la alerta.
   * @param message Mensaje de la alerta.
   */
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}