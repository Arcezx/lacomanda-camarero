import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  cargando = false;

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion() {
    this.error = '';
    this.cargando = true;

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/mesas']);
      },
      error: () => {
        this.cargando = false;
        this.error = 'Usuario o contraseña incorrectos';
      },
    });
  }
}