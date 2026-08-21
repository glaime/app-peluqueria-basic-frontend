import { Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';

export const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    children: [
      {
        path: 'turnos',
        loadComponent: () =>
          import('./components/turnos/turno-lista/turno-lista.component').then(
            (m) => m.TurnoListaComponent
          ),
      },
      {
        path: 'turnos/nuevo',
        loadComponent: () =>
          import('./components/turnos/turno-form/turno-form.component').then(
            (m) => m.TurnoFormComponent
          ),
      },
      {
        path: 'turnos/:id/editar',
        loadComponent: () =>
          import('./components/turnos/turno-form/turno-form.component').then(
            (m) => m.TurnoFormComponent
          ),
      },
      {
        path: 'peluqueros',
        loadComponent: () =>
          import(
            './components/peluqueros/peluquero-lista/peluquero-lista.component'
          ).then((m) => m.PeluqueroListaComponent),
      },
      {
        path: 'peluqueros/nuevo',
        loadComponent: () =>
          import(
            './components/peluqueros/peluquero-form/peluquero-form.component'
          ).then((m) => m.PeluqueroFormComponent),
      },
      {
        path: 'peluqueros/:id/editar',
        loadComponent: () =>
          import(
            './components/peluqueros/peluquero-form/peluquero-form.component'
          ).then((m) => m.PeluqueroFormComponent),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import(
            './components/reportes/reporte-turnos/reporte-turnos.component'
          ).then((m) => m.ReporteTurnosComponent),
      },
      { path: '', redirectTo: 'turnos', pathMatch: 'full' },
    ],
  },
];
