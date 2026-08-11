import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { PedidosService , PedidoRequest} from '../../services/pedidos.service';
import { LineaCarrito } from '../../models/linea-carrito.model';

@Component({
  selector: 'app-resumen-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen-pedido.component.html',
  styleUrl: './resumen-pedido.component.scss',
})
export class ResumenPedidoComponent {
  mesaId: number;
  mesaNumero: number;
  enviando = false;
  error = '';

  constructor(
    public carritoService: CarritoService,
    private pedidosService: PedidosService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.mesaId = Number(this.route.snapshot.paramMap.get('mesaId'));
    this.mesaNumero = Number(this.route.snapshot.paramMap.get('mesaNumero'));
  }

  eliminar(lineaId: string) {
    this.carritoService.eliminarLinea(lineaId);
  }

  volverACategorias() {
    this.router.navigate(['/tomar-pedido', this.mesaId, this.mesaNumero]);
  }

  confirmarPedido() {
    this.error = '';

    if (this.carritoService.lineasCarrito().length === 0) {
      this.error = 'El pedido está vacío.';
      return;
    }

    const lineas = this.carritoService.lineasCarrito().map((l: LineaCarrito) => ({
      productoId: l.producto.id,
      cantidad: l.cantidad,
      notas: l.nota,
      extras: l.extras.map((e) => ({ extraId: e.extra.id, cantidad: e.cantidad })),
    }));

    const request: PedidoRequest = {
      tipo: 'LOCAL',
      mesaId: this.mesaId,
      formaPago: 'EFECTIVO',
      lineas,
    };

    this.enviando = true;

    this.pedidosService.crearPedido(request).subscribe({
      next: () => {
        this.enviando = false;
        this.carritoService.vaciarCarrito();
        this.router.navigate(['/mesas']);
      },
      error: (err) => {
        this.enviando = false;
        this.error = 'No se pudo crear el pedido. Inténtalo de nuevo.';
        console.error('Error al crear pedido', err);
      },
    });
  }
}