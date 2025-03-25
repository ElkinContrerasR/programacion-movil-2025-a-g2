import React, { useState } from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from "@ionic/react";
import Persona from "../components/Persona";

//Estado de los campos del componente
const FormularioPersona: React.FC = () => {
  const [persona, setPersona] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    fechaNacimiento: "",
    direccion: "",
    telefono: "",
    correo: "",
  });

 //Actualiza los datos según las entradas del usario 
  const handleChange = (campo: string, valor: string) => {
    setPersona({ ...persona, [campo]: valor });
  };

  //Envía datos de la persona
  const handleSubmit = () => {
    console.log("Datos de la persona:", persona);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Formulario de Persona</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <Persona {...persona} onChange={handleChange} />
        <IonButton expand="full" onClick={handleSubmit}>Guardar</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default FormularioPersona;
