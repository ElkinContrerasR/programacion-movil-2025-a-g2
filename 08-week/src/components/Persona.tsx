import React from "react";
import { IonItem, IonLabel, IonInput } from "@ionic/react";

//Definición de Interfaz
interface PersonaProps {
  nombre: string;
  apellido: string;
  documento: string;
  fechaNacimiento: string;
  direccion: string;
  telefono: string;
  correo: string;
  onChange: (campo: string, valor: string) => void;
}


//Construimos el componente 
const Persona: React.FC<PersonaProps> = ({
  nombre,
  apellido,
  documento,
  fechaNacimiento,
  direccion,
  telefono,
  correo,
  onChange,
}) => {
  return (
    <>
      <IonItem>
        <IonLabel position="floating">Nombre</IonLabel>
        <IonInput value={nombre} onIonChange={(e) => onChange("nombre", e.detail.value!)} />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Apellido</IonLabel>
        <IonInput value={apellido} onIonChange={(e) => onChange("apellido", e.detail.value!)} />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Documento</IonLabel>
        <IonInput value={documento} onIonChange={(e) => onChange("documento", e.detail.value!)} />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Fecha de Nacimiento</IonLabel>
        <IonInput type="date" value={fechaNacimiento} onIonChange={(e) => onChange("fechaNacimiento", e.detail.value!)} />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Dirección</IonLabel>
        <IonInput value={direccion} onIonChange={(e) => onChange("direccion", e.detail.value!)} />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Teléfono</IonLabel>
        <IonInput type="tel" value={telefono} onIonChange={(e) => onChange("telefono", e.detail.value!)} />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Correo</IonLabel>
        <IonInput type="email" value={correo} onIonChange={(e) => onChange("correo", e.detail.value!)} />
      </IonItem>
    </>
  );
};

export default Persona;
