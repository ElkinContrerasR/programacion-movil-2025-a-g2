import React from 'react';
import { IonPage, IonContent, IonInput, IonItem, IonHeader } from '@ionic/react';
import Registro from '../components/Registro';
import Botones from '../components/Botones';
import Card from '../components/Card';


const Enfermero: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        
        <Card/>
        <Registro></Registro>
        <IonItem>
                <IonInput label="Turno asignado" placeholder="Ingrese su Turno asignado"></IonInput>
              </IonItem>
        <IonItem>
                <IonInput label="Área de atención" placeholder="Ingrese su Área"></IonInput>
              </IonItem>
        <Botones></Botones>
      </IonContent>
    </IonPage>
  );
};

export default Enfermero;