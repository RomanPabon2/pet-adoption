import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, RegisterPayload } from '../../services/api.service';

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
  protected phone = '';
  protected birthDate = '';
  protected message = '';
  protected loading = false;

  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  protected login(): void {
    this.loading = true;
    this.message = '';

    this.api.login(this.email.trim(), this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('session', JSON.stringify(response.usuario));
        window.dispatchEvent(new Event('session-changed'));
        this.message = `Sesion iniciada como ${response.usuario.nom_rol}.`;
        this.loading = false;
        this.cdr.detectChanges();
        void this.router.navigateByUrl(response.usuario.nom_rol.toLowerCase().includes('admin') ? '/roles' : '/');
      },
      error: (error: { error?: { message?: string } }) => {
        this.message = error.error?.message ?? 'No se pudo iniciar sesion. Verifica el backend.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  protected register(): void {
    const [name, ...lastNameParts] = this.fullName.trim().split(' ');
    const payload: RegisterPayload = {
      nom_usu: name,
      apell_usu: lastNameParts.join(' ') || 'Sin apellido',
      email_usu: this.email.trim(),
      pass_usu: this.password,
      numcel_usu: this.phone.trim(),
      fecnac_usu: this.birthDate
    };

    this.loading = true;
    this.message = '';

    this.api.register(payload).subscribe({
      next: (response) => {
        this.message = `${response.message}. Ahora puedes iniciar sesion.`;
        this.mode = 'login';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: { error?: { message?: string } }) => {
        this.message = error.error?.message ?? 'No se pudo crear la cuenta. Verifica el backend.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
