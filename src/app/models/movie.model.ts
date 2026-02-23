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
  date: string;
  time: string;
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
