import React from 'react';
import { IonPage, IonContent, IonInput, IonItem } from '@ionic/react';
import Registro from '../components/Registro';
import Botones from '../components/Botones';
import Card from '../components/Card';


const Medico: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
      <Card/>
        <Registro></Registro>
        <IonItem>
                <IonInput label="Especialidad" placeholder="Ingrese su especialidad"></IonInput>
              </IonItem>
        <IonItem>
                <IonInput label="Número de licencia médica" placeholder=" "></IonInput>
              </IonItem>
        <Botones></Botones>
      </IonContent>
    </IonPage>
  );
};

export default Medico;