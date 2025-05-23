import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms';
import { IonicModule} from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { ButtonComponent } from '../components/button/button.component';
import { AuthService } from '../service/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule,
    HeaderComponent,
    ButtonComponent,
    FormsModule,
    IonicModule, RouterModule]
})
export class LoginPage implements OnInit {
  
  user = {
    email: '',
    password: ''
  };

  formSubmitted = false;
  loginError = '';
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() { }

  isFormValid(): boolean {
    return !!this.user.email &&
           this.emailPattern.test(this.user.email) &&
           !!this.user.password;
  }

  handleLoginClick() {
    this.formSubmitted = true;
    this.loginError = '';

    if (this.isFormValid()) {
      this.authService.login(this.user).subscribe({
        next: (response) => {
          console.log('Login exitoso', response);
          // Puedes guardar al usuario si deseas:
          localStorage.setItem('user', JSON.stringify(response.user));
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error al iniciar sesión', error);
          this.loginError = error?.error?.error || 'Ocurrió un error al iniciar sesión.';
        }
      });
    }
  }

  isFieldValid(field: string): boolean {
    if (!this.formSubmitted) return true;

    switch (field) {
      case 'email':
        return !!this.user.email && this.emailPattern.test(this.user.email);
      case 'password':
        return !!this.user.password;
      default:
        return true;
    }
  }

  // Método que limpia el mensaje de error de login al modificar los campos
  clearLoginError() {
    this.loginError = '';
  }

}
