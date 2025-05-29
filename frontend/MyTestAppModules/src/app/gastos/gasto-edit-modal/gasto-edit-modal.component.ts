// src/app/gastos/gasto-edit-modal/gasto-edit-modal.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

interface Gasto {
  id?: number;
  monto: number;
  descripcion: string;
  categoria: string;
  status: boolean;
}

@Component({
  selector: 'app-gasto-edit-modal',
  templateUrl: './gasto-edit-modal.component.html',
  styleUrls: ['./gasto-edit-modal.component.scss'],
  standalone: false
})
export class GastoEditModalComponent  {
  @Input() gasto!: Gasto; // El gasto que se va a editar
  @Input() categorias!: string[]; // Las categorías disponibles

  editedGasto: Gasto = {
    monto: 0,
    descripcion: '',
    categoria: '',
    status: true // El status no se edita en este modal
  };

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    // Clonar el gasto recibido para no modificar el objeto original directamente
    // hasta que se guarde. Se excluye el ID si no queremos que se edite.
    this.editedGasto = { ...this.gasto };
  }

  cancelar() {
    this.modalController.dismiss(null); // No pasar datos si se cancela
  }

  guardar() {
    if (this.editedGasto.monto <= 0) {
      // Puedes añadir una alerta aquí si el monto es inválido
      console.error('El monto debe ser mayor que cero.');
      return;
    }
    this.modalController.dismiss({ editedGasto: this.editedGasto });
  }
}