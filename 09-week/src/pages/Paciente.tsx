import React from 'react';
import { IonPage, IonContent, IonInput, IonItem } from '@ionic/react';
import Registro from '../components/Registro';
import Botones from '../components/Botones';
import Card from '../components/Card';


const Paciente: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
      <Card/>
        <Registro></Registro>
        <IonItem>
                <IonInput label="Número de historia clínica" placeholder="Ingrese su Número de historia clínica"></IonInput>
              </IonItem>
        <IonItem>
                <IonInput label="Tipo de afiliación (EPS, particular)" placeholder="Ingrese (EPS, particular) "></IonInput>
              </IonItem>
        <Botones></Botones>
      </IonContent>
    </IonPage>
  );
};

export default Paciente;