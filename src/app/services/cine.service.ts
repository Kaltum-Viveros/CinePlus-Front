import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Movie, Ticket, Funcion, Seat } from '../models/movie.model';

/**
 * Servicio central para gestionar la lógica de CinePlus.
 * 
 * TODO: INTEGRACIÓN CON BACKEND
 * Para conectar con un backend, realizar los siguientes cambios:
 * 
 * 1. Instalar HttpClient:
 *    - Importar: import { HttpClient } from '@angular/common/http';
 *    - Inyectar: private http = inject(HttpClient);
 * 
 * 2. Convertir 'movies' a signal dinámico:
 *    - readonly movies = signal<Movie[]>([]);
 *    - Crear método: loadMovies() que haga GET a /api/movies
 * 
 * 3. Reemplazar localStorage por llamadas al backend:
 *    - cart: POST /api/cart para agregar, DELETE /api/cart/:id para eliminar
 *    - occupiedSeats: GET /api/funciones/:movieId/:date/:time/asientos
 *    - confirmPurchase: POST /api/compras con los datos del carrito
 * 
 * 4. Gestionar autenticación:
 *    - Agregar token JWT en headers de las peticiones HTTP
 * 
 * 5. Endpoints sugeridos del backend:
 *    - GET /api/movies - Obtener todas las películas
 *    - GET /api/movies/:id - Obtener una película específica
 *    - GET /api/funciones/:movieId - Obtener horarios disponibles
 *    - GET /api/asientos/:funcionId - Obtener mapa de asientos ocupados
 *    - POST /api/reservas - Crear reserva temporal de asientos
 *    - POST /api/compras - Confirmar compra y generar boletos
 *    - POST /api/cupones/validar - Validar código de cupón de descuento
 */
@Injectable({ providedIn: 'root' })
export class CineService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private http = inject(HttpClient);

    private readonly peliculasApiUrl = 'http://localhost:8001/api/v1/peliculas';

  // TODO: BACKEND - Reemplazar este array estático con una llamada HTTP
  // Ejemplo: readonly movies = signal<Movie[]>([]);
  //          loadMovies() { this.http.get<Movie[]>('/api/movies').subscribe(...) }
  readonly movies = signal<Movie[]>([]);
  readonly loadingMovies = signal<boolean>(false);
  readonly moviesError = signal<string | null>(null);

  readonly genres = computed(() => [
    ...new Set(this.movies().map((movie) => movie.genre)),
  ]);

  constructor() {
    this.loadMovies();
  }

  loadMovies(): void {
    this.loadingMovies.set(true);
    this.moviesError.set(null);

    this.http.get<Movie[]>(this.peliculasApiUrl).subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.loadingMovies.set(false);
      },
      error: () => {
        this.moviesError.set('No se pudo cargar la cartelera desde el backend.');
        this.loadingMovies.set(false);
      },
    });
  }

  // TODO: BACKEND - Estos signals deberían sincronizarse con el backend
  // En lugar de localStorage, usar endpoints para persistir el estado del usuario
  readonly selectedMovie = signal<Movie | null>(this.loadFromStorage('selectedMovie'));
  readonly selectedFuncion = signal<Funcion | null>(this.loadFromStorage('selectedFuncion'));
  readonly cart = signal<Ticket[]>(this.loadFromStorage('cart') || []);
  readonly occupiedSeats = signal<Record<string, string[]>>(
    this.loadFromStorage('occupiedSeats') || {}
  );

  readonly cartTotal = computed(() =>
    this.cart().reduce((sum, ticket) => sum + ticket.subtotal, 0)
  );

  readonly cartCount = computed(() =>
    this.cart().reduce((sum, ticket) => sum + ticket.seats.length, 0)
  );

  selectMovie(movie: Movie): void {
    this.selectedMovie.set(movie);
    this.saveToStorage('selectedMovie', movie);
  }

  selectFuncion(funcion: Funcion): void {
    this.selectedFuncion.set(funcion);
    this.saveToStorage('selectedFuncion', funcion);
  }

  // TODO: BACKEND - Este método debería consultar al servidor
  // GET /api/asientos/:movieId/:date/:time
  getOccupiedSeatsForFuncion(movieId: number, funcion: Funcion): string[] {
    const key = `${movieId}_${funcion.date}_${funcion.time}`;
    return this.occupiedSeats()[key] || [];
  }

  // TODO: BACKEND - Agregar tickets al carrito debería hacer POST al servidor
  // POST /api/cart con { movieId, funcionId, seats }
  addToCart(ticket: Ticket): void {
    const current = this.cart();
    this.cart.set([...current, ticket]);
    this.saveToStorage('cart', this.cart());
  }

  removeFromCart(index: number): void {
    const current = [...this.cart()];
    current.splice(index, 1);
    this.cart.set(current);
    this.saveToStorage('cart', this.cart());
  }

  clearCart(): void {
    this.cart.set([]);
    this.saveToStorage('cart', []);
  }

  // TODO: BACKEND - Confirmar compra debería:
  // 1. POST /api/compras con todos los datos
  // 2. El backend genera el PDF/TXT y retorna la URL de descarga
  // 3. Marcar asientos como ocupados en la base de datos
  confirmPurchase(couponDiscount: number = 0): string {
    const tickets = this.cart();
    if (tickets.length === 0) return '';

    const occupied = { ...this.occupiedSeats() };

    let content = '============================================\n';
    content += '     CinePlus - Confirmación de Compra\n';
    content += '============================================\n\n';

    let grandTotal = 0;

    tickets.forEach((ticket, i) => {
      const key = `${ticket.movie.id}_${ticket.funcion.date}_${ticket.funcion.time}`;
      const existing = occupied[key] || [];
      occupied[key] = [...existing, ...ticket.seats];

      content += `--- Boleto ${i + 1} ---\n`;
      content += `Película: ${ticket.movie.title}\n`;
      content += `Función: ${ticket.funcion.date} - ${ticket.funcion.time} hrs\n`;
      content += `Asientos: ${ticket.seats.join(', ')}\n`;
      content += `Cantidad: ${ticket.seats.length} boleto(s)\n`;
      content += `Precio Unitario: $${ticket.pricePerTicket}\n`;
      content += `Subtotal: $${ticket.subtotal}\n\n`;
      grandTotal += ticket.subtotal;
    });

    const discountAmount = grandTotal * (couponDiscount / 100);
    const finalTotal = grandTotal - discountAmount;

    content += '--------------------------------------------\n';
    if (couponDiscount > 0) {
      content += `Subtotal: $${grandTotal}\n`;
      content += `Cupón aplicado: ${couponDiscount}% (-$${discountAmount.toFixed(2)})\n`;
    } else {
      content += `Cupón aplicado: NO\n`;
    }
    content += `TOTAL: $${finalTotal.toFixed(2)}\n`;
    content += '--------------------------------------------\n\n';
    content += 'Gracias por su compra en CinePlus.\n';

    this.occupiedSeats.set(occupied);
    this.saveToStorage('occupiedSeats', occupied);
    this.clearCart();
    this.selectedMovie.set(null);
    this.selectedFuncion.set(null);
    this.removeFromStorage('selectedMovie');
    this.removeFromStorage('selectedFuncion');

    return content;
  }

  // TODO: BACKEND - El backend debería generar y retornar el archivo
  // En lugar de generar el archivo en el cliente, el servidor lo genera
  // y responde con un Blob o una URL de descarga
  downloadFile(content: string, filename: string): void {
    if (!this.isBrowser) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  generateSeatMap(rows: number, cols: number, occupiedList: string[]): Seat[][] {
    const rowLetters = 'ABCDEFGH';
    const map: Seat[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Seat[] = [];
      for (let c = 1; c <= cols; c++) {
        const label = `${rowLetters[r]}${c}`;
        row.push({
          row: rowLetters[r],
          col: c,
          status: occupiedList.includes(label) ? 'occupied' : 'free',
        });
      }
      map.push(row);
    }
    return map;
  }

  // Métodos privados para localStorage (temporal)
  // TODO: BACKEND - Eliminar estos métodos cuando se integre con backend
  // El estado se manejará desde el servidor usando sesiones o autenticación
  private saveToStorage(key: string, value: unknown): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(`cineplus_${key}`, JSON.stringify(value));
    } catch {
      // Storage full or unavailable
    }
  }

  private loadFromStorage<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    try {
      const data = localStorage.getItem(`cineplus_${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private removeFromStorage(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(`cineplus_${key}`);
  }
}
