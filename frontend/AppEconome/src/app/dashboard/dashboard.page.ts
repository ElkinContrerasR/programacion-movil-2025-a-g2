// src/app/dashboard/dashboard.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core'; // Añadir OnDestroy
import { CommonModule } from '@angular/common';// [cite: 62]
import { FormsModule } from '@angular/forms';// [cite: 62]
import { IonicModule } from '@ionic/angular'; //[cite: 63]
import { EntradaService } from '../service/entrada.service'; //[cite: 63]
import { SimpleMenuComponent } from '../components/simple-menu/simple-menu.component';// [cite: 63]
import { SaldoActualizadorService } from '../service/saldo-actualizador.service'; // Importar el nuevo servicio
import { Subscription } from 'rxjs'; // Importar Subscription

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html', //[cite: 64]
  styleUrls: ['./dashboard.page.scss'], //[cite: 64]
  standalone: true, //[cite: 64]
  imports: [IonicModule, CommonModule, FormsModule, SimpleMenuComponent]// [cite: 64]
})
export class DashboardPage implements OnInit, OnDestroy { // Implementar OnDestroy
  entrada = {
    monto: null, //[cite: 64]
    descripcion: '' //[cite: 65]
  };
  usuarioId: number | null = null; //[cite: 65]
  entradaExistente: any = null;// [cite: 65]
  totalGastos: number = 0;// [cite: 65]
  saldo: number = 0;// [cite: 65]

  private gastoConfirmadoSubscription: Subscription | undefined; // Para desuscribirse

  constructor(
    private entradaService: EntradaService, //[cite: 66]
    private saldoActualizadorService: SaldoActualizadorService // Inyectar el nuevo servicio
  ) { }

  ngOnInit() {
    this.cargarDatosIniciales(); //[cite: 67]
    this.suscribirseAGastosConfirmados(); // Suscribirse al inicio
  }

  ngOnDestroy() {
    // Es crucial desuscribirse para evitar fugas de memoria
    if (this.gastoConfirmadoSubscription) {
      this.gastoConfirmadoSubscription.unsubscribe();
    }
  }

  cargarDatosIniciales() {
    console.log('Cargando datos iniciales del dashboard...'); //[cite: 67]
    const usuarioData = localStorage.getItem('user'); //[cite: 67]
    if (usuarioData) {// [cite: 68]
      try {
        const usuarioGuardado = JSON.parse(usuarioData); //[cite: 68]
        this.usuarioId = usuarioGuardado?.id; //[cite: 69]
        console.log('ID del usuario obtenido:', this.usuarioId);// [cite: 69]
        if (this.usuarioId) {
          this.cargarEntradaExistente(); //[cite: 69]
          // Aquí también deberías cargar el total de gastos ya confirmados al iniciar
          // Esto implicaría otro servicio o endpoint en el backend para obtener el total de gastos confirmados.
          // Por ahora, solo se actualizará cuando se confirmen nuevos.
        }
      } catch (error) {
        console.error('Error al parsear usuario:', error); //[cite: 70]
      }
    } else {
      console.warn('No se encontró usuario en localStorage');// [cite: 71]
    }
  }

  cargarEntradaExistente() {
    this.entradaService.obtenerEntradaPorUsuario(this.usuarioId!).subscribe({
      next: (entrada) => {
        console.log('Entrada existente encontrada:', entrada); //[cite: 72]
        this.entradaExistente = entrada;// [cite: 72]
        this.saldo = Number(this.entradaExistente.monto); // Inicializar saldo con el monto de la entrada [cite: 72]
      },
      error: (error) => {
        console.log('No se encontró entrada para este usuario.', error);// [cite: 72]
        this.entradaExistente = null; //[cite: 73]
        this.saldo = 0; // Inicializar saldo en 0 [cite: 73]
      }
    });
  }

  agregarEntrada() {
    if (this.entrada.monto === null || this.entrada.monto <= 0) { //[cite: 74]
      console.error('El monto debe ser mayor que cero'); //[cite: 74]
      return; //[cite: 75]
    }

    if (this.usuarioId === null) { //[cite: 75]
      console.error('No se puede agregar la entrada porque el ID del usuario no está disponible.');// [cite: 75]
      return; //[cite: 76]
    }

    this.entradaService.agregarEntrada(
      Number(this.entrada.monto), //[cite: 76]
      this.entrada.descripcion,// [cite: 76]
      this.usuarioId// [cite: 76]
    ).subscribe({
      next: (response) => {
        console.log('Entrada agregada con éxito', response); //[cite: 77]
        this.cargarEntradaExistente(); // Recargar la entrada después de agregarla [cite: 77]
        this.entrada.monto = null;// [cite: 77]
        this.entrada.descripcion = ''; //[cite: 77]
      },
      error: (error) => {
        console.error('Error al agregar entrada:', error); //[cite: 77]
      }
    });
  }

  // Método para suscribirse a los gastos confirmados
  private suscribirseAGastosConfirmados() {
    this.gastoConfirmadoSubscription = this.saldoActualizadorService.gastoConfirmado$.subscribe(
      (montoGasto: number) => {
        console.log('Gasto confirmado recibido en Dashboard:', montoGasto);
        this.actualizarSaldoPorGasto(montoGasto);
      }
    );
  }

  // **NUEVO MÉTODO:** Para actualizar el saldo cuando se recibe un gasto confirmado
  actualizarSaldoPorGasto(gasto: number) {
    this.saldo -= gasto;
    this.totalGastos += gasto; //[cite: 78]
    console.log('Saldo actualizado:', this.saldo);
    console.log('Total de gastos actualizado:', this.totalGastos);
  }
}