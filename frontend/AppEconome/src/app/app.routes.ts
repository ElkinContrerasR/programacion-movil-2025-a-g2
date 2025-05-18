import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then( m => m.DashboardPage),
    canActivate: [AuthGuard] 
  },
  {
    path: 'gastos',
    loadComponent: () => import('./gastos/gastos.page').then( m => m.GastosPage),
    canActivate: [AuthGuard] 
  },
  {
    path: 'informe',
    loadComponent: () => import('./informe/informe.page').then( m => m.InformePage),
    canActivate: [AuthGuard] 
  },


];
