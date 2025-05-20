import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';

// Importa los íconos necesarios aquí
import { addIcons } from 'ionicons';
import { create, trash, documentText, logOut, home, cash } from 'ionicons/icons'; // Asegúrate de importar TODOS los íconos que uses



// Registra todos los íconos de forma global
addIcons({
  create,
  trash,
  documentText,
  logOut,
  home,
  cash
});
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
  ],
});
