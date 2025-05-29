import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-simple-menu',
  templateUrl: './simple-menu.component.html',
  styleUrls: ['./simple-menu.component.scss'],
  standalone: false
})
export class SimpleMenuComponent   {

   menuItems = [
    { label: 'Principal', icon: 'home', path: '/dashboard' },
    { label: 'Gastos', icon: 'cash', path: '/gastos' },
    { label: 'Informe', icon: 'document-text', path: '/informe' },
     { label: 'Cerrar Sesión', icon: 'log-out', action: 'logout' } // O '/logout' si tienes una ruta específica
  ];

  constructor(private authService: AuthService) { }

 

  handleMenuItemClick(item: any) {
    if (item.action === 'logout') {
      this.authService.logout();
    } else if (item.path) {
      // Usa navigate en lugar de [routerLink] para control total
      // Necesitarás inyectar el Router si no lo has hecho ya.
      // this.router.navigate([item.path]);
    }
  }
}
