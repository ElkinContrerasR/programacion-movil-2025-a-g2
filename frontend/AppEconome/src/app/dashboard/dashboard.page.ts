import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MenuComponent } from '../components/menu/menu.component';
import {IonicModule} from '@ionic/angular';
import { HeaderComponent } from '../components/header/header.component';
import { EntradaService } from '../service/entrada.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, MenuComponent, HeaderComponent]
})
export class DashboardPage implements OnInit {
    entrada = {
    monto: null,
    descripcion: ''
  };

  usuarioId: number | null = null;
  entradaExistente: any = null;
  totalGastos: number = 0;
  saldo: number = 0;

  constructor(private entradaService: EntradaService) { }

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    console.log('Cargando datos iniciales del dashboard...');
    const usuarioData = localStorage.getItem('user');

    if (usuarioData) {
      try {
        const usuarioGuardado = JSON.parse(usuarioData);
        this.usuarioId = usuarioGuardado?.id;
        console.log('ID del usuario obtenido:', this.usuarioId);
        if (this.usuarioId) {
          this.cargarEntradaExistente();
        }
      } catch (error) {
        console.error('Error al parsear usuario:', error);
      }
    } else {
      console.warn('No se encontró usuario en localStorage');
    }
  }

  cargarEntradaExistente() {
    this.entradaService.obtenerEntradaPorUsuario(this.usuarioId!).subscribe({
      next: (entrada) => {
        console.log('Entrada existente encontrada:', entrada);
        this.entradaExistente = entrada;
        this.saldo = Number(this.entradaExistente.monto); // Inicializar saldo con el monto de la entrada
      },
      error: (error) => {
        console.log('No se encontró entrada para este usuario.', error);
        this.entradaExistente = null;
        this.saldo = 0; // Inicializar saldo en 0
      }
    });
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
        this.cargarEntradaExistente(); // Recargar la entrada después de agregarla
        this.entrada.monto = null;
        this.entrada.descripcion = '';
      },
      error: (error) => {
        console.error('Error al agregar entrada:', error);
      }
    });
  }

  actualizarSaldo(gasto: number) {
    this.saldo -= gasto;
    this.totalGastos += gasto;
  }
  
}
