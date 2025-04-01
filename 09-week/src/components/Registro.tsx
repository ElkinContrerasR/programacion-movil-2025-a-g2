import React from 'react';
import { IonInput, IonItem, IonList } from '@ionic/react';

function Registro() {
  return (
    <IonList>
      <IonItem>
        <IonInput label="Nombre" placeholder="Ingrese su nombre"></IonInput>
      </IonItem>

      <IonItem>
        <IonInput label="Apellido" placeholder="Ingrese su apellido"></IonInput>
      </IonItem>

      <IonItem>
        <IonInput label="Edad" type="number" placeholder="Ingrese su edad"></IonInput>
      </IonItem>

      <IonItem>
        <IonInput label="Correo electrónico" type="email" placeholder="email@domain.com"></IonInput>
      </IonItem>
    </IonList>
  );
}

export default Registro;