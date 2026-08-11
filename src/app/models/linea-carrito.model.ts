import { Producto } from './producto.model';
import { Extra } from './extra.model';

export interface ExtraSeleccionado {
  extra: Extra;
  cantidad: number;
}

export interface LineaCarrito {
  id: string;
  producto: Producto;
  cantidad: number;
  nota: string;
  extras: ExtraSeleccionado[];
}