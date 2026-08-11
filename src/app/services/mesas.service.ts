import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Mesa } from '../models/mesa.model';
import { PedidosService, Pedido } from './pedidos.service';

export interface MesaConEstado extends Mesa {
  pedidoActivo: Pedido | null;
  pedidosDeLaMesa: Pedido[];
}

const API_URL = 'http://localhost:8090/api';

@Injectable({
  providedIn: 'root',
})
export class MesasService {
  private mesas = signal<Mesa[]>([]);

  mesasConEstado = computed<MesaConEstado[]>(() => {
    const pedidos = this.pedidosService.listaPedidos();

    return this.mesas().map((mesa) => {
      const pedidosDeLaMesa = mesa.sesionActual
        ? pedidos.filter(
            (p) => p.tipo === 'LOCAL' && p.sesionMesaId === mesa.sesionActual
          )
        : [];

      const pedidoActivo = pedidosDeLaMesa.find((p) => p.estado !== 'ENVIADO');
      const ocupadaReal = mesa.ocupada || !!pedidoActivo;

      return {
        ...mesa,
        ocupada: ocupadaReal,
        pedidoActivo: pedidoActivo ?? null,
        pedidosDeLaMesa,
      };
    });
  });
  constructor(
    private http: HttpClient,
    private pedidosService: PedidosService
  ) {}

  cargarMesas() {
    this.http.get<Mesa[]>(`${API_URL}/mesas`).subscribe({
      next: (mesas) => this.mesas.set(mesas.sort((a, b) => a.numero - b.numero)),
      error: (err) => console.error('Error al cargar mesas', err),
    });
  }

  cambiarOcupacion(mesaId: number, ocupada: boolean) {
    return this.http.patch<Mesa>(
      `${API_URL}/mesas/${mesaId}/ocupada?ocupada=${ocupada}`,
      null
    );
  }

  actualizarMesaLocal(mesaId: number, ocupada: boolean) {
    this.mesas.update((actuales) =>
      actuales.map((m) => (m.id === mesaId ? { ...m, ocupada } : m))
    );
  }
}