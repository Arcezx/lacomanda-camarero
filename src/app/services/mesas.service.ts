import { Injectable, computed, signal, effect } from '@angular/core';
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
      const pedidosDeLaMesa = pedidos.filter(
        (p) => p.tipo === 'LOCAL' && p.mesaNumero === mesa.numero
      );

      const pedidoActivo = pedidosDeLaMesa.find((p) => p.estado !== 'ENVIADO') ?? null;

      return {
        ...mesa,
        pedidoActivo,
        pedidosDeLaMesa,
      };
    });
  });

  constructor(
    private http: HttpClient,
    private pedidosService: PedidosService
  ) {
    // Cada vez que cambian los pedidos, si detectamos un pedido activo
    // para una mesa que en memoria todavía figura como libre, corregimos
    // el dato BASE (no solo el calculado) para que quede sincronizado
    // de verdad y no dependa de ninguna máscara temporal.
    effect(() => {
      const pedidos = this.pedidosService.listaPedidos();
      const mesasActuales = this.mesas();

      const numerosConPedidoActivo = new Set(
        pedidos
          .filter((p) => p.tipo === 'LOCAL' && p.estado !== 'ENVIADO')
          .map((p) => p.mesaNumero)
      );

      const hayQueCorregir = mesasActuales.some(
        (m) => numerosConPedidoActivo.has(m.numero) && !m.ocupada
      );

      if (hayQueCorregir) {
        this.mesas.update((actuales) =>
          actuales.map((m) =>
            numerosConPedidoActivo.has(m.numero) ? { ...m, ocupada: true } : m
          )
        );
      }
    });
  }

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