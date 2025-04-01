// src/components/PersonaComponente.tsx
import React from 'react';
import { IonItem, IonLabel, IonInput } from '@ionic/react';

interface PersonaComponenteProps {
  tipoUsuario: string;
}

const PersonaComponente: React.FC<PersonaComponenteProps> = ({ tipoUsuario }) => {
  return (
    <div>
      <h2>Formulario de {tipoUsuario}</h2>
      <IonItem>
        <IonLabel position="floating">Nombre</IonLabel>
        <IonInput type="text" placeholder="Nombre" />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">Apellido</IonLabel>
        <IonInput type="text" placeholder="Apellido" />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">Documento</IonLabel>
        <IonInput type="text" placeholder="Documento" />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">Fecha de Nacimiento</IonLabel>
        <IonInput type="date" />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">Dirección</IonLabel>
        <IonInput type="text" placeholder="Dirección" />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">Teléfono</IonLabel>
        <IonInput type="text" placeholder="Teléfono" />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">Correo</IonLabel>
        <IonInput type="email" placeholder="Correo" />
      </IonItem>
    </div>
  );
};

export default PersonaComponente;
