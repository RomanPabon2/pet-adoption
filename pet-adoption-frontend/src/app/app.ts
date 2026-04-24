import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { animate, query, style, transition, trigger } from '@angular/animations';
import { filter } from 'rxjs';

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
export class App {
  protected readonly title = 'Sistema de Adopcion de Mascotas';
  protected routeKey = 'init';

  private readonly router = inject(Router);

  constructor() {
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
}
