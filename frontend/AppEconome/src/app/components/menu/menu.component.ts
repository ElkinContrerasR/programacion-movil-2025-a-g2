import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RegisterService } from 'src/app/service/usuario.service';
import {IonicModule} from '@ionic/angular';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [IonicModule, RouterModule]
})
export class MenuComponent  implements OnInit {

 // Definimos las opciones del menú de forma clara
  appPages = [
    { title: 'Principal', url: '/dashboard', icon: 'home' },
    { title: 'Gastos', url: '/gastos', icon: 'cash' },
    { title: 'Informe', url: '/informe', icon: 'document-text' },
    { title: 'Cerrar Sesión', url: '/logout', icon: 'log-out' }
  ];

  constructor(
    private router: Router,
    private menuController: MenuController
  ) { }

  ngOnInit() {
    // Aplicar manualmente los colores personalizados para asegurar que se apliquen
    document.documentElement.style.setProperty('--ion-color-primary', '#00b894');
    document.documentElement.style.setProperty('--ion-color-primary-rgb', '0, 184, 148');
    document.documentElement.style.setProperty('--ion-color-primary-contrast', '#ffffff');
    document.documentElement.style.setProperty('--ion-color-primary-shade', '#00a383');
    document.documentElement.style.setProperty('--ion-color-primary-tint', '#00c9a7');
  }

  navigate(url: string) {
    console.log('Navegando a:', url);
    if (url === '/logout') {
      this.cerrarSesion();
      return;
    }
    this.router.navigateByUrl(url);
    this.menuController.close('main-menu');
  }

  cerrarSesion() {
    console.log('Cerrando sesión');
    // Aquí puedes agregar la lógica para cerrar sesión
    // Por ejemplo, eliminar tokens de localStorage, etc.
    
    // Navegar a la página de inicio de sesión
    this.router.navigateByUrl('/login');
    this.menuController.close('main-menu');
  }
}


