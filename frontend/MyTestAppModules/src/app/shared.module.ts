import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { IonicModule } from '@ionic/angular';
import { ButtonComponent } from './components/button/button.component';
import { SimpleMenuComponent } from './components/simple-menu/simple-menu.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GastoEditModalComponent } from './gastos/gasto-edit-modal/gasto-edit-modal.component';
import { EditProfileModalComponent } from './components/edit-profile-modal/edit-profile-modal.component';



@NgModule({
  declarations: [
    
    HeaderComponent,// <-- Declara tu HeaderComponent aquí
    ButtonComponent,
    SimpleMenuComponent,
    GastoEditModalComponent,
    EditProfileModalComponent
    
  ],
  imports: [
    CommonModule,
    IonicModule, // Importa IonicModule si los componentes declarados lo necesitan
    RouterModule,
    FormsModule
    
  ],

  exports: [
    HeaderComponent, // <-- Exporta tu HeaderComponent aquí para que otros módulos puedan usarlo
   ButtonComponent,
   SimpleMenuComponent,
   GastoEditModalComponent,
   EditProfileModalComponent,
    IonicModule, // Si quieres que otros módulos no necesiten importar IonicModule directamente
    CommonModule, // Si quieres que otros módulos no necesiten importar CommonModule directamente
    RouterModule,
    FormsModule  
  ]
})
export class SharedModule { }
