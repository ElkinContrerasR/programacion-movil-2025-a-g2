import { IonContent, IonPage, IonInput, IonButton, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleLogin = () => {
    if (email === 'usuario@ejemplo.com' && password === '123456') {
      history.push('/home'); // Redirige al home
    } else {
      alert('Correo o contraseña incorrectos');
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Iniciar Sesión</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="floating">Correo</IonLabel>
              <IonInput type="email" onIonChange={(e) => setEmail(e.detail.value!)} />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Contraseña</IonLabel>
              <IonInput type="password" onIonChange={(e) => setPassword(e.detail.value!)} />
            </IonItem>

            <IonButton expand="full" onClick={handleLogin}>Ingresar</IonButton>
            <IonButton fill="clear" color="secondary" routerLink="/registro">
              Crear cuenta
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Login;
