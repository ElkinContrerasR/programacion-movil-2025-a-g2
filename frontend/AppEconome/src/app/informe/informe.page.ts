// src/app/informe/informe.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { SimpleMenuComponent } from '../components/simple-menu/simple-menu.component';
import { GastosService } from '../service/gastos.service';
import { EntradaService } from '../service/entrada.service';
import { SaldoActualizadorService } from '../service/saldo-actualizador.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// --- Interfaces (Es buena práctica tenerlas en un archivo compartido, pero por ahora aquí) ---
interface Gasto {
  id?: number;
  monto: number;
  descripcion: string;
  categoria: string;
  status: boolean; // true = pendiente, false = confirmado/aplicado
  usuario?: { id: number };
}

interface Entrada {
  id?: number;
  monto: number;
  descripcion: string;
  status: boolean;
  usuario?: { id: number };
}

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface GastoCategoriaResumen {
  total: number;
  porcentaje: number;
}
// --- Fin de Interfaces ---

@Component({
  selector: 'app-informe',
  templateUrl: './informe.page.html',
  styleUrls: ['./informe.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SimpleMenuComponent]
})
export class InformePage implements OnInit, OnDestroy {
  usuarioId: number | null = null;
  entradaInicial: number = 0;

  gastosPorCategoria: { [key: string]: GastoCategoriaResumen } = {
    OCIO: { total: 0, porcentaje: 0 },
    AHORRO: { total: 0, porcentaje: 0 },
    NECESARIOS: { total: 0, porcentaje: 0 }
  };

  categorias: string[] = ['OCIO', 'AHORRO', 'NECESARIOS'];
  private gastosActualizadosSubscription!: Subscription;


  constructor(
    private gastosService: GastosService,
    private entradaService: EntradaService,
    private saldoActualizadorService: SaldoActualizadorService,
    private navController: NavController,
    private router: Router
  ) { }

  ngOnInit() {
    this.cargarDatosUsuarioYInforme();
    this.gastosActualizadosSubscription = this.saldoActualizadorService.gastosActualizados$.subscribe(() => {
      console.log('Notificación de gastos actualizados recibida en InformePage.');
      this.cargarDatosInforme();
    });
  }

  ngOnDestroy() {
    if (this.gastosActualizadosSubscription) {
      this.gastosActualizadosSubscription.unsubscribe();
    }
  }

  cargarDatosUsuarioYInforme() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.usuarioId = user.id;
      this.cargarDatosInforme();
    } else {
      console.error('No se encontró información del usuario en localStorage para el informe.');
      this.router.navigate(['/login']);
    }
  }

  async cargarDatosInforme() {
    if (!this.usuarioId) {
      console.error('ID de usuario no disponible para cargar el informe.');
      return;
    }

    try {
      // 1. Cargar la entrada inicial
      // CAMBIO CLAVE AQUÍ: Aceptar que toPromise() puede devolver undefined
      const entradaResponse: ApiResponse<Entrada> | undefined = await this.entradaService.obtenerEntradaPorUsuario(this.usuarioId).toPromise();

      // Es CRÍTICO verificar 'entradaResponse' en sí mismo y luego 'entradaResponse.data'
      if (entradaResponse && entradaResponse.status && entradaResponse.data && entradaResponse.data.monto) {
        this.entradaInicial = entradaResponse.data.monto;
        console.log('Entrada inicial cargada:', this.entradaInicial);
      } else {
        this.entradaInicial = 0;
        console.warn('No se encontró entrada inicial para el usuario o la respuesta no fue exitosa/no tiene datos.');
      }

      // 2. Cargar todos los gastos del usuario
      // CAMBIO CLAVE AQUÍ: Aceptar que toPromise() puede devolver undefined
      const gastosResponse: ApiResponse<Gasto[]> | undefined = await this.gastosService.obtenerGastosPorUsuario(this.usuarioId).toPromise();

      if (gastosResponse && gastosResponse.status && gastosResponse.data) {
        this.procesarGastos(gastosResponse.data);
      } else {
        console.warn('No se encontraron gastos para el usuario o la respuesta no fue exitosa/no tiene datos.');
        this.procesarGastos([]);
      }

    } catch (error) {
      console.error('Error al cargar datos del informe:', error);
    }
  }

  procesarGastos(gastos: Gasto[]) {
    this.categorias.forEach(cat => {
      this.gastosPorCategoria[cat] = { total: 0, porcentaje: 0 };
    });

    gastos.forEach(gasto => {
      // Condición: Solo suma gastos con status: false (confirmados)
      if (!gasto.status && this.categorias.includes(gasto.categoria)) {
        this.gastosPorCategoria[gasto.categoria].total += gasto.monto;
      }
    });

    if (this.entradaInicial > 0) {
      this.categorias.forEach(cat => {
        const total = this.gastosPorCategoria[cat].total;
        this.gastosPorCategoria[cat].porcentaje = (total / this.entradaInicial) * 100;
      });
    } else {
      this.categorias.forEach(cat => {
        this.gastosPorCategoria[cat].porcentaje = 0;
      });
    }
    console.log('Gastos procesados para el informe:', this.gastosPorCategoria);
  }

  goToDashboard() {
    this.navController.navigateRoot('/dashboard');
  }

  goToGastos() {
    this.navController.navigateRoot('/gastos');
  }
}