import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../service/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {

  constructor(private registerService: RegisterService, private router: Router) { }

  ngOnInit() {
  }

   user = {
      email: '',
      nombreUsuario: '',
      password: '',
      confirmPassword: '',
      status: true  
    };
  
  formSubmitted = false;

  // Variable para almacenar mensaje de error si el email ya está registrado
  emailAlreadyExistsError: string | null = null;
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  isFormValid(): boolean {
    return !!this.user.nombreUsuario && 
           !!this.user.email && 
           this.emailPattern.test(this.user.email) && 
           !!this.user.password && 
           this.user.password === this.user.confirmPassword;
  }

  handleRegisterClick() {
   console.log('handleRegisterClick() ejecutado');
  
  this.formSubmitted = true;
  console.log('formSubmitted establecido en true');
  console.log('Datos del formulario:', this.user);

  if (this.isFormValid()) {
    console.log('Formulario válido. Procediendo a registrar usuario...');

    this.registerService.registerUser(this.user).subscribe({
      next: (response) => {
        console.log('Usuario registrado exitosamente:', response);
        console.log('Redirigiendo a /login...');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        // Se analiza el mensaje de error del backend
        if (error?.error?.message) {
            const mensaje = error.error.message;

          // Si el error proviene de una restricción de base de datos (UK = Unique Key)
          if (mensaje.includes('constraint') && mensaje.includes('UK')) {
            // Mostrar mensaje amigable al usuario
            this.emailAlreadyExistsError = 'El correo ya está registrado.';
          } else {
            // Si es otro tipo de error, mostrar el mensaje tal como viene
            this.emailAlreadyExistsError = mensaje;
          }
    }
      }
    });

  } else {
    console.warn('Formulario inválido. No se enviaron los datos.');
    console.log('Estado de validación:', {
      emailValido: !!this.user.email && this.emailPattern.test(this.user.email),
      nombreUsuarioValido: !!this.user.nombreUsuario,
      passwordValido: !!this.user.password,
      confirmPasswordValido: this.user.password === this.user.confirmPassword && !!this.user.confirmPassword
    });
  }
  }

  isFieldValid(field: string): boolean {
    if (!this.formSubmitted) return true;
    
    switch(field) {
      case 'email':
        return !!this.user.email && this.emailPattern.test(this.user.email);
      case 'nombreUsuario':
        return !!this.user.nombreUsuario;
      case 'password':
        return !!this.user.password;
      case 'confirmPassword':
        return this.user.password === this.user.confirmPassword && !!this.user.confirmPassword;
      default:
        return true;
    }
  }

  // Método que se ejecuta cuando se modifica el campo de email, limpia el mensaje de error
  clearEmailError() {
    this.emailAlreadyExistsError = null;
  }

  

}
