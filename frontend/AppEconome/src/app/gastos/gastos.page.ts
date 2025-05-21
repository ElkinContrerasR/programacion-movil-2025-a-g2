// src/app/gastos/gastos.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, AlertController, ModalController } from '@ionic/angular';
import { SimpleMenuComponent } from '../components/simple-menu/simple-menu.component';
import { GastosService } from '../service/gastos.service';
import { Router } from '@angular/router';
import { SaldoActualizadorService } from '../service/saldo-actualizador.service';
import { GastoEditModalComponent } from './gasto-edit-modal/gasto-edit-modal.component';


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
  imports: [IonicModule, CommonModule, FormsModule, SimpleMenuComponent, GastoEditModalComponent]
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

  // Variables para la edición de gastos
  isEditing = false;
  gastoEnEdicion: Gasto | null = null;
  montoOriginalGastoEnEdicion: number = 0; // Para guardar el monto antes de la edición
  statusOriginalGastoEnEdicion: boolean = true; // Para guardar el status antes de la edición

  constructor(
    private gastosService: GastosService,
    private navController: NavController,
    private router: Router,
    private saldoActualizadorService: SaldoActualizadorService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {

  }

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

    if (this.nuevoGasto.monto <= 0) {
      const alert = await this.alertController.create({
        header: 'Monto Inválido',
        message: 'El monto del gasto debe ser mayor que cero.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    console.log('ID de usuario a usar para registrar gasto:', this.usuarioId);
    console.log('Datos del nuevo gasto a enviar:', this.nuevoGasto);

    try {
      const response = await this.gastosService.crearGasto(this.usuarioId, this.nuevoGasto).toPromise();
      console.log('Respuesta del servicio crearGasto:', response);
      if (response && response.status) {
        console.log('Gasto registrado exitosamente');
        this.nuevoGasto = { monto: 0, descripcion: '', categoria: '', status: true };
        this.cargarGastosDelUsuario(); // Vuelve a cargar los gastos para ver el nuevo
        // Notificar que los gastos han cambiado para el informe
        this.saldoActualizadorService.notificarGastosActualizados(); // <--- AÑADIDO AQUÍ
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Gasto registrado correctamente.',
          buttons: ['OK']
        });
        await alert.present();
      } else {
        const alert = await this.alertController.create({
          header: 'Error',
          message: response?.message || 'Hubo un problema al registrar el gasto.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } catch (error: any) {
      console.error('Error al registrar el gasto:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo registrar el gasto. Inténtalo de nuevo.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  cargarGastosDelUsuario() {
    if (this.usuarioId) {
      this.gastosService.obtenerGastosPorUsuario(this.usuarioId).subscribe(
        (response) => {
          if (response && response.data) {
            this.gastosDelUsuario = response.data;
            console.log('Gastos del usuario cargados:', this.gastosDelUsuario);
            // Si los gastos se recargan, es una buena oportunidad para notificar el informe
            this.saldoActualizadorService.notificarGastosActualizados(); // <--- AÑADIDO AQUÍ
          } else {
            console.warn('La respuesta de la API no contiene la propiedad "data" esperada o está vacía.');
            this.gastosDelUsuario = [];
            this.saldoActualizadorService.notificarGastosActualizados(); // También si no hay datos
          }
        },
        (error) => {
          console.error('Error al obtener los gastos del usuario:', error);
          this.mostrarAlerta('Error', 'No se pudieron cargar los gastos.');
          this.saldoActualizadorService.notificarGastosActualizados(); // En caso de error, el informe también puede necesitar refrescarse
        }
      );
    }
  }

  async confirmarGasto(gasto: Gasto) {
    if (!gasto.id) {
      console.error('No se puede confirmar el gasto, ID de gasto no disponible.');
      this.mostrarAlerta('Error', 'No se pudo confirmar el gasto: ID no disponible.');
      return;
    }

    if (!gasto.status) {
      console.log('Este gasto ya ha sido confirmado.');
      this.mostrarAlerta('Información', 'Este gasto ya ha sido confirmado.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Gasto',
      message: `¿Estás seguro de que quieres confirmar el gasto de $${gasto.monto}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              const response = await this.gastosService.actualizarGastoStatus(gasto.id!, false).toPromise();
              if (response && response.status) {
                console.log('Gasto confirmado y estado actualizado en backend:', response);

                // Notificar al Dashboard que el gasto ha sido confirmado
                this.saldoActualizadorService.notificarGastoConfirmado(gasto.monto);

                // Actualizar el estado del gasto en el array local
                const index = this.gastosDelUsuario.findIndex(g => g.id === gasto.id);
                if (index !== -1) {
                  this.gastosDelUsuario[index].status = false;
                }
                this.mostrarAlerta('Éxito', 'Gasto confirmado correctamente.');
                // Notificar que los gastos han cambiado para el informe
                this.saldoActualizadorService.notificarGastosActualizados(); // <--- AÑADIDO AQUÍ
              } else {
                this.mostrarAlerta('Error', response?.message || 'Hubo un problema al confirmar el gasto.');
              }
            } catch (error: any) {
              console.error('Error al confirmar el gasto:', error);
              this.mostrarAlerta('Error', 'No se pudo confirmar el gasto. Inténtalo de nuevo.');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async editarGasto(gasto: Gasto) {
    if (!gasto.id) {
      this.mostrarAlerta('Error', 'No se puede editar el gasto: ID no disponible.');
      return;
    }

    this.gastoEnEdicion = { ...gasto };
    this.montoOriginalGastoEnEdicion = gasto.monto;
    this.statusOriginalGastoEnEdicion = gasto.status;
    this.isEditing = true;

    const modal = await this.modalController.create({
      component: GastoEditModalComponent,
      componentProps: {
        gasto: this.gastoEnEdicion,
        categorias: this.categorias
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data && data.data.editedGasto) {
        this.guardarEdicionGasto(data.data.editedGasto);
      }
      this.isEditing = false;
      this.gastoEnEdicion = null;
    });

    await modal.present();
  }

  async guardarEdicionGasto(editedGasto: Gasto) {
    if (!editedGasto.id || !this.usuarioId) {
      this.mostrarAlerta('Error', 'No se puede guardar la edición: ID de gasto o usuario no disponible.');
      return;
    }

    if (editedGasto.monto <= 0) {
      this.mostrarAlerta('Monto Inválido', 'El monto del gasto debe ser mayor que cero.');
      return;
    }

    try {
      const response = await this.gastosService.editarGasto(editedGasto.id, this.usuarioId, editedGasto).toPromise();
      if (response && response.status) {
        console.log('Gasto editado y actualizado en backend:', response.data);

        const index = this.gastosDelUsuario.findIndex(g => g.id === editedGasto.id);
        if (index !== -1) {
          response.data.status = this.statusOriginalGastoEnEdicion;
          this.gastosDelUsuario[index] = response.data;
        }

        if (!this.statusOriginalGastoEnEdicion && this.montoOriginalGastoEnEdicion !== editedGasto.monto) {
          const diferencia = editedGasto.monto - this.montoOriginalGastoEnEdicion;
          this.saldoActualizadorService.notificarCambioEnGastoConfirmado(diferencia);
        }

        this.mostrarAlerta('Éxito', 'Gasto editado correctamente.');
        // Notificar que los gastos han cambiado para el informe
        this.saldoActualizadorService.notificarGastosActualizados(); // <--- AÑADIDO AQUÍ
      } else {
        this.mostrarAlerta('Error', response?.message || 'Hubo un problema al editar el gasto.');
      }
    } catch (error: any) {
      console.error('Error al guardar la edición del gasto:', error);
      this.mostrarAlerta('Error', 'No se pudo guardar la edición del gasto. Inténtalo de nuevo.');
    } finally {
      this.cargarGastosDelUsuario(); // Siempre recargar para asegurarse de que los datos estén frescos
    }
  }

  async eliminarGasto(gasto: Gasto) {
    if (!gasto.id || !this.usuarioId) {
      this.mostrarAlerta('Error', 'No se puede eliminar el gasto: ID de gasto o usuario no disponible.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Eliminar Gasto',
      message: `¿Estás seguro de que quieres eliminar el gasto de "$${gasto.monto}" - "${gasto.descripcion}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              const response = await this.gastosService.eliminarGasto(gasto.id!, this.usuarioId!).toPromise();
              if (response && response.status) {
                console.log('Gasto eliminado en backend:', response.message);

                if (!gasto.status) {
                  this.saldoActualizadorService.notificarGastoEliminado(gasto.monto);
                }

                this.gastosDelUsuario = this.gastosDelUsuario.filter(g => g.id !== gasto.id);
                this.mostrarAlerta('Éxito', 'Gasto eliminado correctamente.');
                // Notificar que los gastos han cambiado para el informe
                this.saldoActualizadorService.notificarGastosActualizados(); // <--- AÑADIDO AQUÍ
              } else {
                this.mostrarAlerta('Error', response?.message || 'Hubo un problema al eliminar el gasto.');
              }
            } catch (error: any) {
              console.error('Error al eliminar el gasto:', error);
              this.mostrarAlerta('Error', 'No se pudo eliminar el gasto. Inténtalo de nuevo.');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}