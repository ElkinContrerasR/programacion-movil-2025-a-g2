import React from 'react';
import { IonPage, IonContent, IonInput, IonItem } from '@ionic/react';
import Registro from '../components/Registro';
import Botones from '../components/Botones';
import Card from '../components/Card';


const Recepcionista: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
      <Card/>
        <Registro></Registro>
        <IonItem>
                <IonInput label="Horario laboral" placeholder="Ingrese su Horario laboral"></IonInput>
              </IonItem>
        <IonItem>
                <IonInput label="Extensión telefónica" placeholder="Ingrese su Extensión"></IonInput>
              </IonItem>
        <Botones></Botones>
      </IonContent>
    </IonPage>
  );
};

export default Recepcionista;