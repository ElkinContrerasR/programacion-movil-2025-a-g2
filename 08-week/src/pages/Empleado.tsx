import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import PersonaComponente from '../components/PersonaComponente';



const Empleado: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
       <PersonaComponente tipoUsuario='Empleado'/>
        
      </IonContent>
    </IonPage>
  );
};

export default Empleado;