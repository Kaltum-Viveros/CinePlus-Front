import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Movie, Ticket, Funcion, Seat } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class CineService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  readonly movies: Movie[] = [
    {
      id: 1,
      title: 'Inception',
      genre: 'Ciencia Ficción',
      duration: '148 min',
      poster: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
      synopsis: 'Un ladrón que roba secretos corporativos a través del uso de la tecnología de sueños compartidos, recibe la tarea inversa de plantar una idea en la mente de un CEO.',
      trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
      price: 80,
    },
    {
      id: 2,
      title: 'The Dark Knight',
      genre: 'Acción',
      duration: '152 min',
      poster: 'https://image.tmdb.org/t/p/original/xQPgyZOBhaz1GdCQIPf5A5VeFzO.jpg',
      synopsis: 'Batman se enfrenta al Joker, un criminal anárquico que desata el caos y la destrucción en Gotham City.',
      trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
      price: 80,
    },
    {
      id: 3,
      title: 'Interstellar',
      genre: 'Ciencia Ficción',
      duration: '169 min',
      poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      synopsis: 'Un grupo de exploradores viaja a través de un agujero de gusano en el espacio en un intento de asegurar la supervivencia de la humanidad.',
      trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
      price: 85,
    },
    {
      id: 4,
      title: 'Spider-Man: No Way Home',
      genre: 'Acción',
      duration: '148 min',
      poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      synopsis: 'Con la identidad de Spider-Man revelada, Peter busca la ayuda del Doctor Strange para restaurar su secreto, desatando una crisis multiversal.',
      trailerUrl: 'https://www.youtube.com/embed/JfVOs4VSpmA',
      price: 90,
    },
    {
      id: 5,
      title: 'Coco',
      genre: 'Animación',
      duration: '105 min',
      poster: 'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',
      synopsis: 'Miguel sueña con ser músico y se encuentra en la Tierra de los Muertos, donde busca a su tatarabuelo para que lo ayude a cumplir su sueño.',
      trailerUrl: 'https://www.youtube.com/embed/Rvr68u6k5sI',
      price: 70,
    },
    {
      id: 6,
      title: 'The Conjuring',
      genre: 'Terror',
      duration: '112 min',
      poster: 'https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg',
      synopsis: 'Los investigadores paranormales Ed y Lorraine Warren ayudan a una familia aterrorizada por una presencia oscura en su granja.',
      trailerUrl: 'https://www.youtube.com/embed/k10ETZ41q5o',
      price: 75,
    },
    {
      id: 7,
      title: 'Toy Story 4',
      genre: 'Animación',
      duration: '100 min',
      poster: 'https://image.tmdb.org/t/p/w500/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg',
      synopsis: 'Woody y sus amigos emprenden un viaje por carretera con Bonnie y un nuevo juguete llamado Forky, que se resiste a ser un juguete.',
      trailerUrl: 'https://www.youtube.com/embed/wmiIUN-7qhE',
      price: 70,
    },
    {
      id: 8,
      title: 'Dune',
      genre: 'Ciencia Ficción',
      duration: '155 min',
      poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
      synopsis: 'Paul Atreides, un joven brillante destinado a un gran destino, viaja al planeta más peligroso del universo para asegurar el futuro de su familia.',
      trailerUrl: 'https://www.youtube.com/embed/n9xhJrPXop4',
      price: 90,
    },
    {
      id: 9,
      title: 'Avengers: Endgame',
      genre: 'Acción',
      duration: '181 min',
      poster: 'https://image.tmdb.org/t/p/original/br6krBFpaYmCSglLBWRuhui7tPc.jpg',
      synopsis: 'Los Vengadores restantes deben encontrar una manera de recuperar a sus aliados para un enfrentamiento épico contra Thanos.',
      trailerUrl: 'https://www.youtube.com/embed/TcMBFSGVi1c',
      price: 90,
    },
    {
      id: 10,
      title: 'The Notebook',
      genre: 'Romance',
      duration: '123 min',
      poster: 'https://image.tmdb.org/t/p/w500/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg',
      synopsis: 'Una historia de amor épica centrada en una joven pareja que se enamora durante un verano de los años 40, contada a través de un anciano que lee su historia.',
      trailerUrl: 'https://www.youtube.com/embed/yDJIcYE32NU',
      price: 70,
    },
  ];

  readonly genres = [...new Set(this.movies.map((m) => m.genre))];

  // Signals
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

  getOccupiedSeatsForFuncion(movieId: number, funcion: Funcion): string[] {
    const key = `${movieId}_${funcion.date}_${funcion.time}`;
    return this.occupiedSeats()[key] || [];
  }

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
