import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MesasComponent } from './pages/mesas/mesas.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'mesas', component: MesasComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];