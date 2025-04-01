
import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import PersonaComponente from '../components/PersonaComponente';


const Cliente: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <PersonaComponente tipoUsuario="Cliente" />
        
        
      </IonContent>
    </IonPage>
  );
};

export default Cliente;
