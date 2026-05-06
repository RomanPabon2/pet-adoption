import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FeatureComponent } from './pages/feature/feature.component';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'roles', component: FeatureComponent, data: { section: 'roles' } },
  { path: 'permisos', component: FeatureComponent, data: { section: 'permisos' } },
  { path: 'usuarios', component: FeatureComponent, data: { section: 'usuarios' } },
  { path: 'trabajadores', component: FeatureComponent, data: { section: 'trabajadores' } },
  { path: 'mascotas', component: FeatureComponent, data: { section: 'mascotas' } },
  { path: 'refugios', component: FeatureComponent, data: { section: 'refugios' } },
  { path: 'especies', component: FeatureComponent, data: { section: 'especies' } },
  { path: 'razas', component: FeatureComponent, data: { section: 'razas' } },
  { path: 'adopciones', component: FeatureComponent, data: { section: 'adopciones' } },
  { path: 'donaciones', component: FeatureComponent, data: { section: 'donaciones' } },
  { path: '**', redirectTo: '' }
];
