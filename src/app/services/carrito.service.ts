import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../models/producto.model';
import { LineaCarrito, ExtraSeleccionado } from '../models/linea-carrito.model';

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  private lineas = signal<LineaCarrito[]>([]);

  lineasCarrito = this.lineas.asReadonly();

  totalUnidades = computed(() =>
    this.lineas().reduce((suma, l) => suma + l.cantidad, 0)
  );

  totalPrecio = computed(() =>
    this.lineas().reduce((suma, l) => suma + this.calcularSubtotal(l), 0)
  );

  calcularSubtotal(linea: LineaCarrito): number {
    const totalExtras = linea.extras.reduce(
      (s, e) => s + e.extra.precio * e.cantidad,
      0
    );
    return linea.producto.precio * linea.cantidad + totalExtras;
  }

  agregarProducto(
    producto: Producto,
    cantidad: number,
    nota: string,
    extras: ExtraSeleccionado[] = []
  ) {
    const esPersonalizable = producto.extras && producto.extras.length > 0;

    if (!esPersonalizable) {
      const notaNormalizada = nota.trim();
      const existente = this.lineas().find(
        (l) => l.producto.id === producto.id && l.nota === notaNormalizada
      );
      if (existente) {
        this.actualizarCantidad(existente.id, existente.cantidad + cantidad);
      } else {
        this.lineas.update((actuales) => [
          ...actuales,
          {
            id: crypto.randomUUID(),
            producto,
            cantidad,
            nota: notaNormalizada,
            extras: [],
          },
        ]);
      }
      return;
    }

    const nuevasLineas: LineaCarrito[] = [];
    for (let i = 0; i < cantidad; i++) {
      nuevasLineas.push({
        id: crypto.randomUUID(),
        producto,
        cantidad: 1,
        nota: nota.trim(),
        extras: extras.map((e) => ({ ...e })),
      });
    }
    this.lineas.update((actuales) => [...actuales, ...nuevasLineas]);
  }

  actualizarLinea(lineaId: string, nota: string, extras: ExtraSeleccionado[]) {
    this.lineas.update((actuales) =>
      actuales.map((l) => (l.id === lineaId ? { ...l, nota, extras } : l))
    );
  }

  actualizarCantidad(lineaId: string, nuevaCantidad: number) {
    if (nuevaCantidad <= 0) {
      this.eliminarLinea(lineaId);
      return;
    }
    this.lineas.update((actuales) =>
      actuales.map((l) => (l.id === lineaId ? { ...l, cantidad: nuevaCantidad } : l))
    );
  }

  eliminarLinea(lineaId: string) {
    this.lineas.update((actuales) => actuales.filter((l) => l.id !== lineaId));
  }

  vaciarCarrito() {
    this.lineas.set([]);
  }
}