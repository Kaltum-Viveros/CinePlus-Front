/**
 * Modelos de datos de la aplicación CinePlus.
 * 
 * TODO: INTEGRACIÓN CON BACKEND
 * Estos modelos deberían coincidir con los DTOs del backend.
 * Considerar agregar:
 * - id de función (funcionId) para referencia en el backend
 * - timestamps (createdAt, updatedAt)
 * - id de usuario para asociar reservas
 * - estado de la reserva/compra (pendiente, confirmada, cancelada)
 */

export interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: string;
  poster: string;
  synopsis: string;
  trailerUrl: string;
  price: number;
}

export interface Funcion {
  id?: number;
  movieId?: number;
  movieTitle?: string;
  date: string;
  time: string;
  room?: string;
  available?: boolean;
}

export interface Seat {
  row: string;
  col: number;
  status: 'free' | 'selected' | 'occupied';
}

export interface Ticket {
  movie: Movie;
  funcion: Funcion;
  seats: string[];
  pricePerTicket: number;
  subtotal: number;
}
