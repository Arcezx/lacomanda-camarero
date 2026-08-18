import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';
import { Producto } from '../models/producto.model';

const API_URL = 'https://lacomanda-backend.onrender.com/api';

@Injectable({
  providedIn: 'root',
})
export class CartaService {
  constructor(private http: HttpClient) {}

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${API_URL}/categorias`);
  }

  obtenerProductosPorCategoria(categoriaId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${API_URL}/productos?categoriaId=${categoriaId}`);
  }
}