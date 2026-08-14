import { Injectable, computed, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Mesa } from '../models/mesa.model';
import { PedidosService, Pedido } from './pedidos.service';

export interface MesaConEstado extends Mesa {
  pedidoActivo: Pedido | null;
}

const API_URL = 'http://localhost:8090/api';
const WS_URL = 'http://localhost:8090/ws';

@Injectable({
  providedIn: 'root',
})
export class MesasService {
  private mesas = signal<Mesa[]>([]);
  private stompClient: Client | null = null;

  mesasConEstado = computed<MesaConEstado[]>(() => {
    const pedidos = this.pedidosService.listaPedidos();

    return this.mesas().map((mesa) => {
      const pedidoActivo =
        pedidos.find(
          (p) =>
            p.tipo === 'LOCAL' &&
            p.mesaNumero === mesa.numero &&
            p.estado !== 'ENVIADO' &&
            (!mesa.sesionActual || p.sesionMesaId === mesa.sesionActual)
        ) ?? null;

      return { ...mesa, pedidoActivo };
    });
  });

  constructor(private http: HttpClient, private pedidosService: PedidosService) {
    effect(() => {
      const pedidos = this.pedidosService.listaPedidos();
      const mesasActuales = this.mesas();

      // Para cada mesa, si hay un pedido LOCAL activo cuya sesión no coincide
      // con lo que tenemos guardado en memoria (o aún no tenemos ninguna),
      // corregimos AMBOS campos base: ocupada Y sesionActual. Antes solo
      // corregíamos ocupada, por eso la mesa se veía roja pero sin pedidos.
      const correcciones = new Map<number, { ocupada: boolean; sesionActual: string | null }>();

      for (const pedido of pedidos) {
        if (pedido.tipo !== 'LOCAL' || pedido.estado === 'ENVIADO' || !pedido.sesionMesaId) continue;

        const mesa = mesasActuales.find((m) => m.numero === pedido.mesaNumero);
        if (!mesa) continue;

        if (mesa.sesionActual !== pedido.sesionMesaId || !mesa.ocupada) {
          correcciones.set(mesa.id, { ocupada: true, sesionActual: pedido.sesionMesaId });
        }
      }

      if (correcciones.size > 0) {
        this.mesas.update((actuales) =>
          actuales.map((m) => (correcciones.has(m.id) ? { ...m, ...correcciones.get(m.id)! } : m))
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

  conectarTiempoReal() {
    if (this.stompClient?.active) {
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        this.stompClient!.subscribe('/topic/mesas-actualizadas', (mensaje) => {
          const mesaActualizada: Mesa = JSON.parse(mensaje.body);
          this.mesas.update((actuales) =>
            actuales.map((m) => (m.id === mesaActualizada.id ? mesaActualizada : m))
          );
        });
      },
    });

    this.stompClient.activate();
  }

  desconectar() {
    this.stompClient?.deactivate();
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

  cargarPedidosDeSesion(sesionMesaId: string) {
    return this.http.get<Pedido[]>(`${API_URL}/pedidos/sesion/${sesionMesaId}`);
  }
}