import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CartaService } from '../../services/carta.service';
import { CarritoService } from '../../services/carrito.service';
import { Categoria } from '../../models/categoria.model';
import { Producto } from '../../models/producto.model';
import { ProductoModalComponent } from '../../components/producto-modal/producto-modal.component';

@Component({
  selector: 'app-categoria-detalle',
  standalone: true,
  imports: [CommonModule, ProductoModalComponent],
  templateUrl: './categoria-detalle.component.html',
  styleUrl: './categoria-detalle.component.scss',
})
export class CategoriaDetalleComponent implements OnInit {
  categoria: Categoria | null = null;
  productos: Producto[] = [];
  mesaId!: number;
  mesaNumero!: number;

  productoModalAbierto: Producto | null = null;

  constructor(
    private cartaService: CartaService,
    public carritoService: CarritoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.mesaId = Number(this.route.snapshot.paramMap.get('mesaId'));
    this.mesaNumero = Number(this.route.snapshot.paramMap.get('mesaNumero'));
    const categoriaId = Number(this.route.snapshot.paramMap.get('categoriaId'));

    this.cartaService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categoria = categorias.find((c) => c.id === categoriaId) ?? null;
      },
      error: (err) => console.error('Error al cargar categoría', err),
    });

    this.cartaService.obtenerProductosPorCategoria(categoriaId).subscribe({
      next: (productos) => (this.productos = productos),
      error: (err) => console.error('Error al cargar productos', err),
    });
  }

  abrirModal(producto: Producto) {
    this.productoModalAbierto = producto;
  }

  cerrarModal(datos: { producto: Producto; cantidad: number; nota: string; extras: any[] } | null) {
    if (datos) {
      this.carritoService.agregarProducto(datos.producto, datos.cantidad, datos.nota, datos.extras);
    }
    this.productoModalAbierto = null;
  }

  irAResumen() {
    this.router.navigate(['/tomar-pedido', this.mesaId, this.mesaNumero, 'resumen']);
  }

  volver() {
    this.router.navigate(['/tomar-pedido', this.mesaId, this.mesaNumero]);
  }
}