import React from 'react';
import { IonButton, IonList, IonItem } from '@ionic/react';

function Botones() {
  const handleAdd = () => {
    console.log("Agregar elemento");
  };

  const handleModify = () => {
    console.log("Modificar elemento");
  };

  const handleDelete = () => {
    console.log("Eliminar elemento");
  };

  const handleConsult = () => {
    console.log("Consultar elemento");
  };

  return (
    <IonList>
      <IonItem>
        <IonButton onClick={handleAdd} color="primary">Agregar</IonButton>
      </IonItem>
      <IonItem>
        <IonButton onClick={handleModify} color="warning">Modificar</IonButton>
      </IonItem>
      <IonItem>
        <IonButton onClick={handleDelete} color="danger">Eliminar</IonButton>
      </IonItem>
      <IonItem>
        <IonButton onClick={handleConsult} color="success">Consultar</IonButton>
      </IonItem>
    </IonList>
  );
}

export default Botones;