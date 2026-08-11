export interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  qrCode: string;
  ocupada: boolean;
  sesionActual: string | null;
}