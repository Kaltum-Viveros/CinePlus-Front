import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Componente de formulario de contacto.
 * 
 * TODO: INTEGRACIÓN CON BACKEND
 * Para enviar mensajes reales al backend:
 * 1. Inyectar HttpClient
 * 2. En onSubmit(), hacer POST /api/contacto con { name, email, message }
 * 3. Manejar respuestas de error del servidor
 */
@Component({
  selector: 'app-contacto',
  imports: [FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss',
})
export class Contacto {
  protected name = signal('');
  protected email = signal('');
  protected message = signal('');
  protected submitted = signal(false);
  protected errors = signal<Record<string, string>>({});

  validate(): boolean {
    const errs: Record<string, string> = {};

    if (!this.name().trim()) {
      errs['name'] = 'El nombre es obligatorio.';
    }

    const emailVal = this.email().trim();
    if (!emailVal) {
      errs['email'] = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      errs['email'] = 'Ingresa un email válido.';
    }

    if (!this.message().trim()) {
      errs['message'] = 'El mensaje es obligatorio.';
    }

    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  onSubmit(): void {
    if (!this.validate()) return;

    // TODO: BACKEND - Enviar datos al servidor

    this.submitted.set(true);
    this.name.set('');
    this.email.set('');
    this.message.set('');
    this.errors.set({});

    setTimeout(() => this.submitted.set(false), 5000);
  }

  onFieldChange(field: string, value: string): void {
    switch (field) {
      case 'name':
        this.name.set(value);
        break;
      case 'email':
        this.email.set(value);
        break;
      case 'message':
        this.message.set(value);
        break;
    }
  }
}
