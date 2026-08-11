import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MesasComponent } from './pages/mesas/mesas.component';
import {TomarPedidoComponent } from './pages/tomar-pedido/tomar-pedido.component';
import { CategoriaDetalleComponent } from './pages/categoria-detalle/categoria-detalle.component';
import { ResumenPedidoComponent } from './pages/resumen-pedido/resumen-pedido.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'mesas', component: MesasComponent, canActivate: [authGuard] },
  { path: 'tomar-pedido/:mesaId/:mesaNumero', component: TomarPedidoComponent, canActivate: [authGuard] },
  { path: 'tomar-pedido/:mesaId/:mesaNumero',component: TomarPedidoComponent,canActivate: [authGuard],},
  { path: 'tomar-pedido/:mesaId/:mesaNumero/categoria/:categoriaId',component: CategoriaDetalleComponent,canActivate: [authGuard],},
  { path: 'tomar-pedido/:mesaId/:mesaNumero/resumen', component: ResumenPedidoComponent,canActivate: [authGuard],},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];