import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonList, IonItem } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import Card from '../components/Card';

const Home: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      
      <IonContent fullscreen className="ion-padding">
        <Card/>
        
        <IonList>
          <IonItem>
            <IonButton expand="full" color="primary" onClick={() => history.push('/medico')}>Médico</IonButton>
          </IonItem>
          <IonItem>
            <IonButton expand="full" color="warning" onClick={() => history.push('/enfermero')}>Enfermero</IonButton>
          </IonItem>
          <IonItem>
            <IonButton expand="full" color="danger" onClick={() => history.push('/paciente')}>Paciente</IonButton>
          </IonItem>
          <IonItem>
            <IonButton expand="full" color="success" onClick={() => history.push('/recepcionista')}>Recepcionista</IonButton>
          </IonItem>
        </IonList>
        
       
      </IonContent>
    </IonPage>
  );
};

export default Home;
