import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { MesasService, MesaConEstado } from '../../services/mesas.service';
import { PedidosService } from '../../services/pedidos.service';
import { AuthService } from '../../services/auth.service';

interface Posicion {
  left: number;
  top: number;
}

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mesas.component.html',
  styleUrl: './mesas.component.scss',
  animations: [
    trigger('entradaMesas', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.5)' }),
          stagger(40, [
            animate('300ms cubic-bezier(.36,1.4,.5,1)', style({ opacity: 1, transform: 'scale(1)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
    trigger('entradaDetalle', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('280ms cubic-bezier(.32,.72,0,1)', style({ transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class MesasComponent implements OnInit, OnDestroy {
  mesaSeleccionada: MesaConEstado | null = null;

private posiciones: Record<number, Posicion> = {
  1: { left: 6, top: 20 },
  2: { left: 24, top: 20 },
  3: { left: 42, top: 20 },
  4: { left: 58, top: 20 },
  5: { left: 6, top: 55 },
  6: { left: 26, top: 55 },
  7: { left: 46, top: 55 },
  8: { left: 62, top: 55 },
  9: { left: 38, top: 82 },
  10: { left: 78, top: 82 },
};

  constructor(
    public mesasService: MesasService,
    public pedidosService: PedidosService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.pedidosService.cargarPedidosIniciales();
    this.pedidosService.conectarTiempoReal();
    this.mesasService.cargarMesas();
  }

  ngOnDestroy() {
    this.pedidosService.desconectar();
  }

  obtenerPosicion(numero: number): Posicion {
    return this.posiciones[numero] ?? { left: 50, top: 50 };
  }

  esMesaGrande(capacidad: number): boolean {
  return capacidad >= 10;
  }
  obtenerImagenMesa(capacidad: number): string {
    if (capacidad <= 2) return '/mesa-2personas.png';
    if (capacidad <= 4) return '/mesa-4personas.png';
    if (capacidad <= 6) return '/mesa-6personas.png';
    return '/mesa-10personas.png';
  }
  contarOcupadas(): number {
    return this.mesasService.mesasConEstado().filter((m) => m.ocupada).length;
  }

  seleccionarMesa(mesa: MesaConEstado) {
    this.mesaSeleccionada = mesa;
  }

  cerrarDetalle() {
    this.mesaSeleccionada = null;
  }

  alternarOcupacion() {
    if (!this.mesaSeleccionada) return;

    const nuevoEstado = !this.mesaSeleccionada.ocupada;

    this.mesasService.cambiarOcupacion(this.mesaSeleccionada.id, nuevoEstado).subscribe({
      next: () => {
        this.mesasService.actualizarMesaLocal(this.mesaSeleccionada!.id, nuevoEstado);
        this.mesaSeleccionada = { ...this.mesaSeleccionada!, ocupada: nuevoEstado };
      },
      error: (err) => console.error('Error al cambiar ocupación', err),
    });
  }

  logout() {
    this.authService.logout();
  }
}