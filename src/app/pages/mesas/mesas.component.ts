import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { MesasService, MesaConEstado } from '../../services/mesas.service';
import { PedidosService, Pedido } from '../../services/pedidos.service';
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
  mesaSeleccionadaId: number | null = null;

  modoOscuro = signal(localStorage.getItem('modo_oscuro') === 'true');

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

  get mesaSeleccionada(): MesaConEstado | null {
    if (this.mesaSeleccionadaId === null) return null;
    return this.mesasService.mesasConEstado().find((m) => m.id === this.mesaSeleccionadaId) ?? null;
  }

  get pedidosDelDetalle(): Pedido[] {
    const mesa = this.mesaSeleccionada;
    if (!mesa || !mesa.sesionActual) return [];
    return this.pedidosService
      .listaPedidos()
      .filter((p) => p.tipo === 'LOCAL' && p.sesionMesaId === mesa.sesionActual);
  }

  ngOnInit() {
    this.pedidosService.cargarPedidosIniciales();
    this.pedidosService.conectarTiempoReal();
    this.mesasService.cargarMesas();
    this.mesasService.conectarTiempoReal();
    document.body.classList.toggle('modo-oscuro', this.modoOscuro());
  }

  ngOnDestroy() {
    this.pedidosService.desconectar();
    this.mesasService.desconectar();
  }

  alternarModoOscuro() {
    const nuevoValor = !this.modoOscuro();
    this.modoOscuro.set(nuevoValor);
    localStorage.setItem('modo_oscuro', String(nuevoValor));
    document.body.classList.toggle('modo-oscuro', nuevoValor);
  }

  obtenerPosicion(numero: number): Posicion {
    return this.posiciones[numero] ?? { left: 50, top: 50 };
  }

  esMesaGrande(capacidad: number): boolean {
    return capacidad >= 10;
  }

  esMesaMediana(capacidad: number): boolean {
    return capacidad === 4;
  }

  obtenerImagenMesa(capacidad: number, ocupada: boolean): string {
    const prefijo = ocupada ? 'mesaOcupada' : 'mesaLibre';

    if (capacidad <= 2) return `/${prefijo}-2personas.png`;
    if (capacidad <= 4) return `/${prefijo}-4personas.png`;
    if (capacidad <= 6) return `/${prefijo}-6personas.png`;
    return `/${prefijo}-10personas.png`;
  }

  contarOcupadas(): number {
    return this.mesasService.mesasConEstado().filter((m) => m.ocupada).length;
  }

  colorResumen(): string {
    const total = this.mesasService.mesasConEstado().length;
    if (total === 0) return '';

    const ocupadas = this.contarOcupadas();
    const porcentaje = ocupadas / total;

    if (porcentaje < 0.5) return 'nivel-bajo';
    if (porcentaje < 0.8) return 'nivel-medio';
    return 'nivel-alto';
  }

  todosServidos(pedidos: Pedido[]): boolean {
    if (pedidos.length === 0) return false;
    return pedidos.every((p) => p.estado === 'ENVIADO');
  }

  totalCuenta(pedidos: Pedido[]): number {
    return pedidos.reduce((suma, p) => suma + p.total, 0);
  }

  seleccionarMesa(mesa: MesaConEstado) {
    this.mesaSeleccionadaId = mesa.id;

    if (mesa.sesionActual) {
      this.mesasService.cargarPedidosDeSesion(mesa.sesionActual).subscribe({
        next: (pedidos) => this.pedidosService.mergePedidos(pedidos),
        error: (err) => console.error('Error al cargar pedidos de la sesión', err),
      });
    }
  }

  cerrarDetalle() {
    this.mesaSeleccionadaId = null;
  }

  alternarOcupacion() {
    if (!this.mesaSeleccionada) return;

    const nuevoEstado = !this.mesaSeleccionada.ocupada;
    const id = this.mesaSeleccionada.id;

    this.mesasService.cambiarOcupacion(id, nuevoEstado).subscribe({
      next: () => {
        this.mesasService.actualizarMesaLocal(id, nuevoEstado);
      },
      error: (err) => console.error('Error al cambiar ocupación', err),
    });
  }

  pagarCuenta() {
    if (!this.mesaSeleccionada) return;

    const id = this.mesaSeleccionada.id;
    const numeroMesa = this.mesaSeleccionada.numero;

    this.mesasService.cambiarOcupacion(id, false).subscribe({
      next: () => {
        this.mesasService.actualizarMesaLocal(id, false);
        this.pedidosService.quitarPedidosDeMesa(numeroMesa);
        this.cerrarDetalle();
      },
      error: (err) => console.error('Error al pagar/liberar mesa', err),
    });
  }

  irATomarPedido() {
    if (!this.mesaSeleccionada) return;
    this.router.navigate(['/tomar-pedido', this.mesaSeleccionada.id, this.mesaSeleccionada.numero]);
  }

  logout() {
    this.authService.logout();
  }
}