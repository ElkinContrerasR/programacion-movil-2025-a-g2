import React from 'react';
import { IonCard, IonCardHeader, IonCardTitle } from '@ionic/react';

const Card = () => {
  return (
    <IonCard className="ion-text-center">
      <IonCardHeader>
        <IonCardTitle>Gestión de Personal Médico</IonCardTitle>
      </IonCardHeader>
    </IonCard>
  );
};

export default Card;