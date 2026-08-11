import { Alergeno } from './alergeno.model';
import { Ingrediente } from './ingrediente.model';
import { Extra } from './extra.model';

export interface Producto {
  id: number;
  categoriaId: number;
  categoriaNombreEs: string;
  nombreEs: string;
  nombreVal: string;
  nombreEn: string;
  descripcionEs: string;
  descripcionVal: string;
  descripcionEn: string;
  precio: number;
  foto: string;
  disponible: boolean;
  alergenos: Alergeno[];
  ingredientes: Ingrediente[];
  extras: Extra[];
}