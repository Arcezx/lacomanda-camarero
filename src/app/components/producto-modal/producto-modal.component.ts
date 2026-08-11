import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto.model';
import { ExtraSeleccionado } from '../../models/linea-carrito.model';

@Component({
  selector: 'app-producto-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-modal.component.html',
  styleUrl: './producto-modal.component.scss',
})
export class ProductoModalComponent implements OnInit {
  @Input() producto!: Producto;
  @Output() cerrar = new EventEmitter<{ producto: Producto; cantidad: number; nota: string; extras: ExtraSeleccionado[] } | null>();

  cantidad = 1;
  nota = '';
  extrasSeleccionados: ExtraSeleccionado[] = [];

  ngOnInit() {
    this.extrasSeleccionados = this.producto.extras.map((extra) => ({
      extra,
      cantidad: 0,
    }));
  }

  aumentar() {
    this.cantidad++;
  }

  disminuir() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  aumentarExtra(es: ExtraSeleccionado) {
    es.cantidad++;
  }

  disminuirExtra(es: ExtraSeleccionado) {
    if (es.cantidad > 0) {
      es.cantidad--;
    }
  }

  get extrasElegidos(): ExtraSeleccionado[] {
    return this.extrasSeleccionados.filter((es) => es.cantidad > 0);
  }

  get totalExtras(): number {
    return this.extrasElegidos.reduce((suma, es) => suma + es.extra.precio * es.cantidad, 0);
  }

  get totalProducto(): number {
    return this.producto.precio * this.cantidad + this.totalExtras;
  }

  get ingredientesFormateados(): string {
    return this.producto.ingredientes.map((i) => i.nombre).join(', ');
  }

  cerrarSinConfirmar() {
    this.cerrar.emit(null);
  }

  confirmarAnadir() {
    this.cerrar.emit({
      producto: this.producto,
      cantidad: this.cantidad,
      nota: this.nota.trim(),
      extras: this.extrasElegidos,
    });
  }
}