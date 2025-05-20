// src/app/gastos/gastos.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { SimpleMenuComponent } from '../components/simple-menu/simple-menu.component';
import { GastosService } from '../service/gastos.service';
import { Router } from '@angular/router';
import { SaldoActualizadorService } from '../service/saldo-actualizador.service';

interface Gasto {
  id?: number;
  monto: number;
  descripcion: string;
  categoria: string;
  status: boolean; // true = pendiente, false = confirmado/aplicado
}

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.page.html',
  styleUrls: ['./gastos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SimpleMenuComponent]
})
export class GastosPage implements OnInit {
  nuevoGasto: Gasto = {
    monto: 0,
    descripcion: '',
    categoria: '',
    status: true // Valor por defecto: pendiente
  };
  categorias: string[] = ['OCIO', 'AHORRO', 'NECESARIOS'];
  usuarioId: number | null = null;
  gastosDelUsuario: Gasto[] = [];

  constructor(
    private gastosService: GastosService,
    private navController: NavController,
    private router: Router,
    private saldoActualizadorService: SaldoActualizadorService
  ) {}

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    const userStr = localStorage.getItem('user');
    console.log('Valor de user en localStorage:', userStr);

    if (userStr) {
      const user = JSON.parse(userStr);
      this.usuarioId = user.id;
      console.log('ID de usuario cargado:', this.usuarioId);
      this.cargarGastosDelUsuario();
    } else {
      console.error('No se encontró información del usuario en localStorage');
      this.router.navigate(['/login']);
    }
  }

  async registrarGasto() {
    console.log('Función registrarGasto() llamada');
    if (!this.usuarioId) {
      console.error('No se puede registrar el gasto, ID de usuario no disponible.');
      return;
    }

    console.log('ID de usuario a usar para registrar gasto:', this.usuarioId);
    console.log('Datos del nuevo gasto a enviar:', this.nuevoGasto);

    try {
      // Cuando se crea un gasto, su status se envía como true (pendiente)
      const response = await this.gastosService.crearGasto(this.usuarioId, this.nuevoGasto).toPromise();
      console.log('Respuesta del servicio crearGasto:', response);
      console.log('Gasto registrado exitosamente');

      this.nuevoGasto = { monto: 0, descripcion: '', categoria: '', status: true };
      this.cargarGastosDelUsuario(); // Vuelve a cargar los gastos para ver el nuevo
    } catch (error: any) {
      console.error('Error al registrar el gasto:', error);
      console.log('Mensaje del error:', error.message);
      if (error.error) {
        console.log('Cuerpo del error:', error.error);
      }
    }
  }

  cargarGastosDelUsuario() {
    if (this.usuarioId) {
      this.gastosService.obtenerGastosPorUsuario(this.usuarioId).subscribe(
        (response) => {
          if (response && response.data) {
            // Los gastos ahora vienen con su 'status' real desde el backend
            this.gastosDelUsuario = response.data;
            console.log('Gastos del usuario cargados:', this.gastosDelUsuario);
          } else {
            console.warn('La respuesta de la API no contiene la propiedad "data" esperada o está vacía.');
            this.gastosDelUsuario = [];
          }
        },
        (error) => {
          console.error('Error al obtener los gastos del usuario:', error);
        }
      );
    }
  }

  // **MÉTODO DE CONFIRMACIÓN:** Ahora actualiza el backend
  async confirmarGasto(gasto: Gasto) {
    if (!gasto.id) {
      console.error('No se puede confirmar el gasto, ID de gasto no disponible.');
      return;
    }

    if (!gasto.status) { // Si status es false, ya está confirmado en el backend
      console.log('Este gasto ya ha sido confirmado.');
      return;
    }

    try {
      // Llamar al servicio para actualizar el estado del gasto a "false" (confirmado/aplicado)
      const response = await this.gastosService.actualizarGastoStatus(gasto.id, false).toPromise();
      console.log('Gasto confirmado y estado actualizado en backend:', response);

      // Notificar al Dashboard que el gasto ha sido confirmado
      this.saldoActualizadorService.notificarGastoConfirmado(gasto.monto);

      // Actualizar el estado del gasto en el array local para que el botón se deshabilite
      // No es estrictamente necesario si recargaras los gastos, pero mejora la UX
      const index = this.gastosDelUsuario.findIndex(g => g.id === gasto.id);
      if (index !== -1) {
        this.gastosDelUsuario[index].status = false; // Actualiza el status localmente
      }

    } catch (error: any) {
      console.error('Error al confirmar el gasto:', error);
      console.log('Mensaje del error:', error.message);
      if (error.error) {
        console.log('Cuerpo del error:', error.error);
      }
    }
  }
}