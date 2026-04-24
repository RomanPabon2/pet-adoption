import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FeatureComponent } from './pages/feature/feature.component';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'refugios', component: FeatureComponent, data: { section: 'refugios' } },
  { path: 'animales', component: FeatureComponent, data: { section: 'animales' } },
  { path: 'adopciones', component: FeatureComponent, data: { section: 'adopciones' } },
  { path: 'donaciones', component: FeatureComponent, data: { section: 'donaciones' } },
  { path: '**', redirectTo: '' }
];
