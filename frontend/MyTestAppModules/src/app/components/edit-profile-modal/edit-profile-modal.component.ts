// src/app/components/edit-profile-modal/edit-profile-modal.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule para ngModel
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { AuthService, UserUpdatePayload, UserData, ApiResponse } from '../../service/auth.service'; // Importar AuthService y las interfaces

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
  standalone: false // Importa aquí si es standalone
})
export class EditProfileModalComponent implements OnInit {
  @Input() usuarioId: number | undefined;
  @Input() currentNombreUsuario: string = '';
  @Input() currentEmail: string = '';

  // Variables para el formulario del modal
  nombreUsuario: string = '';
  email: string = '';
  password?: string = ''; // Opcional, el usuario puede no querer cambiarla

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    // Inicializar los campos del formulario con los datos actuales
    this.nombreUsuario = this.currentNombreUsuario;
    this.email = this.currentEmail;
    // No pre-llenamos el campo 'password' con la contraseña actual por seguridad.
    // El usuario debe ingresarla si quiere cambiarla.
  }

  /**
   * Cierra el modal sin guardar cambios.
   */
  async dismiss() {
    await this.modalController.dismiss(false); // Pasa 'false' para indicar que no hubo actualización
  }

  /**
   * Maneja el envío del formulario para actualizar el perfil del usuario.
   */
  async updateProfile() {
    if (!this.usuarioId) {
      this.presentAlert('Error', 'ID de usuario no disponible para la actualización.');
      return;
    }

    if (!this.nombreUsuario || !this.email) {
      this.presentAlert('Campos Requeridos', 'Por favor, completa todos los campos obligatorios (nombre y email).');
      return;
    }

    const payload: UserUpdatePayload = {
      status: true, // Siempre true por defecto como indicaste
      nombreUsuario: this.nombreUsuario,
      email: this.email,
    };

    // **LÓGICA CLAVE: Solo añade 'password' al payload si el usuario ingresó algo**
    if (this.password && this.password.length > 0) {
      payload.password = this.password;
    }

    this.authService.updateUser(this.usuarioId, payload).subscribe({
      next: async (response: ApiResponse<UserData>) => {
        if (response.status && response.data) {
          await this.presentAlert('Éxito', 'Información actualizada correctamente.');

          // Actualizar localStorage con los nuevos datos recibidos del backend
          // Es importante que el backend devuelva los datos actualizados, incluyendo email y nombre.
          const updatedUser: UserData = response.data;
          // Si tu backend no devuelve el usuario completo, puedes fusionar los cambios locales
          const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
          // NO guardes la contraseña en texto plano en localStorage, solo actualiza los datos que el backend devuelve y son seguros.
          currentUserData.nombreUsuario = updatedUser.nombreUsuario;
          currentUserData.email = updatedUser.email;
          // Si el backend te devuelve el ID del usuario actualizado, también lo puedes guardar
          if (updatedUser.id) currentUserData.id = updatedUser.id;

          localStorage.setItem('user', JSON.stringify(currentUserData));

          await this.modalController.dismiss(true); // Cierra el modal y pasa 'true' para indicar éxito
        } else {
          await this.presentAlert('Error', response.message || 'No se pudo actualizar la información.');
        }
      },
      error: async (error) => {
        console.error('Error al actualizar el perfil:', error);
        let errorMessage = 'Ocurrió un error inesperado al actualizar la información.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) { // Fallback para errores de red o genéricos
          errorMessage = error.message;
        }
        await this.presentAlert('Error de Conexión', errorMessage);
      }
    });
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