import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  nombre: string;
  rol: 'ADMIN' | 'CAMARERO';
}

const API_URL = 'https://lacomanda-backend.onrender.com/api';
const TOKEN_KEY = 'lacomanda_camarero_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenActual = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private nombreActual = signal<string | null>(null);

  estaAutenticado = this.tokenActual.asReadonly();
  nombre = this.nombreActual.asReadonly();

  constructor(private http: HttpClient, private router: Router) {}

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, credenciales).pipe(
      tap((respuesta) => {
        localStorage.setItem(TOKEN_KEY, respuesta.token);
        this.tokenActual.set(respuesta.token);
        this.nombreActual.set(respuesta.nombre);
      })
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenActual.set(null);
    this.nombreActual.set(null);
    this.router.navigate(['/login']);
  }

  obtenerToken(): string | null {
    return this.tokenActual();
  }

  estaLogueado(): boolean {
    return this.tokenActual() !== null;
  }
}