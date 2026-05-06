import { Component, OnDestroy, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { animate, query, style, transition, trigger } from '@angular/animations';
import { filter } from 'rxjs';
import { ApiService, SessionUser } from './services/api.service';

type NavItem = {
  label: string;
  path: string;
  permission?: string;
};

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [
    trigger('routeFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate('220ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition('* <=> *', [
        query(':enter', [style({ opacity: 0, transform: 'translateY(6px)' })], { optional: true }),
        query(':leave', [style({ opacity: 1 }), animate('140ms ease', style({ opacity: 0 }))], { optional: true }),
        query(':enter', [animate('200ms 40ms ease', style({ opacity: 1, transform: 'translateY(0)' }))], {
          optional: true
        })
      ])
    ])
  ]
})
export class App implements OnDestroy {
  protected readonly title = 'Sistema de Adopcion de Mascotas';
  protected routeKey = 'init';
  protected session: SessionUser | null = null;
  protected refugioName = '';

  protected readonly baseNavItems: NavItem[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Adopciones', path: '/adopciones' },
    { label: 'Donaciones', path: '/donaciones' }
  ];

  protected readonly adminNavItems: NavItem[] = [
    { label: 'Roles', path: '/roles', permission: 'roles:obtener' },
    { label: 'Permisos', path: '/permisos', permission: 'permisos:obtener' },
    { label: 'Usuarios', path: '/usuarios', permission: 'usuarios:obtener' },
    { label: 'Trabajadores', path: '/trabajadores', permission: 'trabajadores:obtener' },
    { label: 'Mascotas', path: '/mascotas', permission: 'mascotas:obtener' },
    { label: 'Refugios', path: '/refugios', permission: 'refugios:obtener|refugio:obtener:propio' },
    { label: 'Especies', path: '/especies', permission: 'especies:obtener' },
    { label: 'Razas', path: '/razas', permission: 'razas:obtener' }
  ];

  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly sessionListener = () => this.loadSession();

  constructor() {
    this.loadSession();
    window.addEventListener('session-changed', this.sessionListener);

    // Clave estable para animaciones + evita depender de template refs.
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        filter(() => true)
      )
      .subscribe(() => {
        this.routeKey = this.router.url;
      });
  }

  ngOnDestroy(): void {
    window.removeEventListener('session-changed', this.sessionListener);
  }

  protected get navItems(): NavItem[] {
    return this.session ? [...this.baseNavItems, ...this.adminNavItems.filter((item) => this.hasPermission(item.permission))] : this.baseNavItems;
  }

  protected get sessionLabel(): string {
    if (!this.session) return 'Iniciar sesion';
    return this.session.nom_usu;
  }

  protected get sessionDetail(): string {
    if (!this.session) return '';
    return this.refugioName ? `${this.session.nom_rol} - ${this.refugioName}` : this.session.nom_rol;
  }

  protected logout(): void {
    this.api.clearSession();
    void this.router.navigateByUrl('/auth');
  }

  private loadSession(): void {
    this.session = this.api.getSession();
    this.refugioName = '';

    if (this.session?.id_ref) {
      this.api.getRefugioById(this.session.id_ref).subscribe({
        next: (refugio) => {
          this.refugioName = refugio.nom_ref;
        },
        error: () => {
          this.refugioName = `Refugio #${this.session?.id_ref}`;
        }
      });
    }
  }

  private hasPermission(permission?: string): boolean {
    if (!permission) return true;
    const permisos = this.session?.permisos?.map((p) => p.toLowerCase()) ?? [];
    return permission.split('|').some((option) => permisos.includes(option.toLowerCase()));
  }

}
