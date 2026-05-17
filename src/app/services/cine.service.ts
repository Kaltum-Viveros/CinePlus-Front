import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Movie,
  Ticket,
  Funcion,
  Seat,
  ReservaResponse,
  CouponValidationResponse,
  CompraResponse,
} from '../models/movie.model';

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
  private readonly funcionesApiUrl = 'http://localhost:8002/api/v1/funciones';
  private readonly reservasApiUrl = 'http://localhost:8003/api/v1';
  private readonly comprasApiUrl = 'http://localhost:8004/api/v1';

  // TODO: BACKEND - Reemplazar este array estático con una llamada HTTP
  // Ejemplo: readonly movies = signal<Movie[]>([]);
  //          loadMovies() { this.http.get<Movie[]>('/api/movies').subscribe(...) }
  readonly movies = signal<Movie[]>([]);
  readonly loadingMovies = signal<boolean>(false);
  readonly moviesError = signal<string | null>(null);

  readonly funcionesDisponibles = signal<Funcion[]>([]);
  readonly loadingFunciones = signal<boolean>(false);
  readonly funcionesError = signal<string | null>(null);

  readonly occupiedSeatsForCurrentFuncion = signal<string[]>([]);
  readonly loadingAsientos = signal<boolean>(false);
  readonly asientosError = signal<string | null>(null);

  readonly creatingReserva = signal<boolean>(false);
  readonly reservaError = signal<string | null>(null);

  readonly validatingCoupon = signal<boolean>(false);
  readonly couponValidationError = signal<string | null>(null);

  readonly processingPurchase = signal<boolean>(false);
  readonly compraError = signal<string | null>(null);
  readonly lastCompra = signal<CompraResponse | null>(null);

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

  loadFuncionesByMovieAndDate(movieId: number, date: string): void {
    if (!movieId || !date) {
      this.funcionesDisponibles.set([]);
      return;
    }

    this.loadingFunciones.set(true);
    this.funcionesError.set(null);

    const url = `${this.funcionesApiUrl}/disponibles?movieId=${movieId}&date=${date}`;

    this.http.get<Funcion[]>(url).subscribe({
      next: (funciones) => {
        this.funcionesDisponibles.set(funciones);
        this.loadingFunciones.set(false);
      },
      error: () => {
        this.funcionesDisponibles.set([]);
        this.funcionesError.set('No se pudieron cargar los horarios desde el backend.');
        this.loadingFunciones.set(false);
      },
    });
  }

  getOccupiedSeatsForFuncion(movieId: number, funcion: Funcion): string[] {
    if (funcion.id) {
      return this.occupiedSeatsForCurrentFuncion();
    }

    const key = `${movieId}_${funcion.date}_${funcion.time}`;
    return this.occupiedSeats()[key] || [];
  }

  clearOccupiedSeatsForCurrentFuncion(): void {
    this.occupiedSeatsForCurrentFuncion.set([]);
    this.asientosError.set(null);
  }

  loadOccupiedSeatsForFuncion(funcionId: number, onLoaded?: () => void): void {
    if (!funcionId) {
      this.clearOccupiedSeatsForCurrentFuncion();
      return;
    }

    this.loadingAsientos.set(true);
    this.asientosError.set(null);

    this.http
      .get<{ funcionId: number; asientosOcupados: string[] }>(
        `${this.reservasApiUrl}/asientos/funcion/${funcionId}`
      )
      .subscribe({
        next: (response) => {
          this.occupiedSeatsForCurrentFuncion.set(response.asientosOcupados);
          this.loadingAsientos.set(false);

          if (onLoaded) {
            onLoaded();
          }
        },
        error: () => {
          this.occupiedSeatsForCurrentFuncion.set([]);
          this.asientosError.set('No se pudieron cargar los asientos ocupados.');
          this.loadingAsientos.set(false);
        },
      });
  }

  createReserva(
    funcionId: number,
    asientos: string[],
    onSuccess: (reserva: ReservaResponse) => void
  ): void {
    this.creatingReserva.set(true);
    this.reservaError.set(null);

    this.http
      .post<ReservaResponse>(`${this.reservasApiUrl}/reservas`, {
        funcionId,
        asientos,
      })
      .subscribe({
        next: (reserva) => {
          this.creatingReserva.set(false);
          onSuccess(reserva);
        },
        error: (error) => {
          this.creatingReserva.set(false);

          const detail = error?.error?.detail;

          if (typeof detail === 'string') {
            this.reservaError.set(detail);
            return;
          }

          if (detail?.message) {
            this.reservaError.set(detail.message);
            return;
          }

          this.reservaError.set('No se pudo crear la reserva de asientos.');
        },
      });
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

  validateCoupon(
    code: string,
    subtotal: number,
    onSuccess: (response: CouponValidationResponse) => void
  ): void {
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      this.couponValidationError.set('Ingresa un cupón.');
      return;
    }

    this.validatingCoupon.set(true);
    this.couponValidationError.set(null);

    this.http
      .post<CouponValidationResponse>(`${this.comprasApiUrl}/cupones/validar`, {
        code: cleanCode,
        subtotal,
      })
      .subscribe({
        next: (response) => {
          this.validatingCoupon.set(false);
          onSuccess(response);
        },
        error: () => {
          this.validatingCoupon.set(false);
          this.couponValidationError.set('No se pudo validar el cupón.');
        },
      });
  }

  confirmPurchase(
    couponCode: string | null,
    onSuccess: (response: CompraResponse) => void
  ): void {
    const tickets = this.cart();

    if (tickets.length === 0) {
      this.compraError.set('El carrito está vacío.');
      return;
    }

    const ticketsSinReserva = tickets.some((ticket) => !ticket.reservaId || !ticket.funcion.id);

    if (ticketsSinReserva) {
      this.compraError.set(
        'Hay boletos sin reserva o función válida. Vuelve a seleccionar la función y los asientos.'
      );
      return;
    }

    this.processingPurchase.set(true);
    this.compraError.set(null);

    const payload = {
      couponCode: couponCode || null,
      tickets: tickets.map((ticket) => ({
        reservaId: ticket.reservaId,
        movieId: ticket.movie.id,
        movieTitle: ticket.movie.title,
        funcionId: ticket.funcion.id,
        date: ticket.funcion.date,
        time: ticket.funcion.time,
        room: ticket.funcion.room || null,
        seats: ticket.seats,
        pricePerTicket: ticket.pricePerTicket,
      })),
    };

    this.http.post<CompraResponse>(`${this.comprasApiUrl}/compras`, payload).subscribe({
      next: (response) => {
        this.processingPurchase.set(false);
        this.lastCompra.set(response);

        this.clearCart();
        this.selectedMovie.set(null);
        this.selectedFuncion.set(null);
        this.removeFromStorage('selectedMovie');
        this.removeFromStorage('selectedFuncion');

        onSuccess(response);
      },
      error: (error) => {
        this.processingPurchase.set(false);

        const detail = error?.error?.detail;

        if (typeof detail === 'string') {
          this.compraError.set(detail);
          return;
        }

        this.compraError.set('No se pudo confirmar la compra.');
      },
    });
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
