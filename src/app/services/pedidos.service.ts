import { Injectable, signal, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface Pedido {
  id: number;
  tipo: 'LOCAL' | 'DOMICILIO';
  estado: 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENVIADO';
  fecha: string;
  formaPago: 'TARJETA' | 'EFECTIVO';
  mesaNumero?: number;
  sesionMesaId?: string | null;
  domicilio?: { id: number; direccion: string; estado: string };
  lineas: {
    id: number;
    productoId: number;
    productoNombreEs: string;
    precioUnitario: number;
    cantidad: number;
    notas: string;
    extras: { id: number; nombre: string; precio: number }[];
    subtotal: number;
  }[];
  total: number;
}

export interface PedidoRequest {
  tipo: 'LOCAL' | 'DOMICILIO';
  mesaId?: number;
  formaPago: 'TARJETA' | 'EFECTIVO';
  lineas: {
    productoId: number;
    cantidad: number;
    notas: string;
    extras: { extraId: number; cantidad: number }[];
  }[];
}

const API_URL = 'http://localhost:8090/api';
const WS_URL = 'http://localhost:8090/ws';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private pedidos = signal<Pedido[]>([]);
  listaPedidos = this.pedidos.asReadonly();

  private stompClient: Client | null = null;

  constructor(private http: HttpClient, private zone: NgZone) {}

  cargarPedidosIniciales() {
    this.http.get<Pedido[]>(`${API_URL}/pedidos`).subscribe({
      next: (pedidos) => this.pedidos.set(pedidos),
      error: (err) => console.error('Error al cargar pedidos', err),
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
        this.stompClient!.subscribe('/topic/pedidos', (mensaje) => {
          const pedidoNuevo: Pedido = JSON.parse(mensaje.body);
          this.zone.run(() => {
            this.pedidos.update((actuales) => [pedidoNuevo, ...actuales]);
          });
        });

        this.stompClient!.subscribe('/topic/pedidos-actualizados', (mensaje) => {
          const pedidoActualizado: Pedido = JSON.parse(mensaje.body);
          this.zone.run(() => {
            this.pedidos.update((actuales) =>
              actuales.map((p) => (p.id === pedidoActualizado.id ? pedidoActualizado : p))
            );
          });
        });
      },
    });

    this.stompClient.activate();
  }

  desconectar() {
    this.stompClient?.deactivate();
  }

  cambiarEstado(pedidoId: number, nuevoEstado: string) {
    return this.http.patch<Pedido>(
      `${API_URL}/pedidos/${pedidoId}/estado?nuevoEstado=${nuevoEstado}`,
      null
    );
  }

  crearPedido(pedido: PedidoRequest) {
    return this.http.post<Pedido>(`${API_URL}/pedidos`, pedido);
  }

  quitarPedidosDeMesa(mesaNumero: number) {
    this.zone.run(() => {
      this.pedidos.update((actuales) =>
        actuales.filter((p) => !(p.tipo === 'LOCAL' && p.mesaNumero === mesaNumero))
      );
    });
  }
}