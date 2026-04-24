import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  protected mode: 'login' | 'register' = 'login';
  protected fullName = '';
  protected email = '';
  protected password = '';
  protected role = 'adoptante';
  protected message = '';

  protected login(): void {
    const session = { email: this.email, role: this.role, name: this.fullName || 'Usuario' };
    localStorage.setItem('session', JSON.stringify(session));
    this.message = `Sesion iniciada como ${this.role}.`;
  }

  protected register(): void {
    const user = { name: this.fullName, email: this.email, role: this.role };
    localStorage.setItem('user', JSON.stringify(user));
    this.message = 'Registro simulado listo. Ahora puedes iniciar sesion.';
    this.mode = 'login';
  }
}
