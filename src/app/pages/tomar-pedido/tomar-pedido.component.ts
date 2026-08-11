import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CartaService } from '../../services/carta.service';
import { CarritoService } from '../../services/carrito.service';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-tomar-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tomar-pedido.component.html',
  styleUrl: './tomar-pedido.component.scss',
})
export class TomarPedidoComponent implements OnInit {
  categorias: Categoria[] = [];
  mesaId!: number;
  mesaNumero!: number;

  constructor(
    private cartaService: CartaService,
    public carritoService: CarritoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.mesaId = Number(this.route.snapshot.paramMap.get('mesaId'));
    this.mesaNumero = Number(this.route.snapshot.paramMap.get('mesaNumero'));

    this.cartaService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias.sort((a, b) => a.orden - b.orden);
      },
      error: (err) => console.error('Error al cargar categorías', err),
    });
  }

  irACategoria(categoriaId: number) {
    this.router.navigate(['/tomar-pedido', this.mesaId, this.mesaNumero, 'categoria', categoriaId]);
  }

  irAResumen() {
    this.router.navigate(['/tomar-pedido', this.mesaId, this.mesaNumero, 'resumen']);
  }

  volver() {
    this.router.navigate(['/mesas']);
  }
}