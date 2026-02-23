import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cartelera/cartelera').then((m) => m.Cartelera),
    title: 'CinePlus - Cartelera',
  },
  {
    path: 'funciones',
    loadComponent: () => import('./pages/funciones/funciones').then((m) => m.Funciones),
    title: 'CinePlus - Funciones y Asientos',
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito').then((m) => m.Carrito),
    title: 'CinePlus - Carrito',
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto').then((m) => m.Contacto),
    title: 'CinePlus - Contacto',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
