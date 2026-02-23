import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CineService } from '../../services/cine.service';
import { Seat, Funcion } from '../../models/movie.model';

/**
 * Componente para selección de función y asientos.
 * 
 * TODO: INTEGRACIÓN CON BACKEND
 * Para asientos en tiempo real:
 * 1. Cargar asientos ocupados desde GET /api/funciones/:id/asientos
 * 2. Crear reserva temporal al seleccionar asientos: POST /api/reservas/temporal
 * 3. La reserva temporal expira después de X minutos si no se completa la compra
 */
@Component({
  selector: 'app-funciones',
  imports: [FormsModule],
  templateUrl: './funciones.html',
  styleUrl: './funciones.scss',
})
export class Funciones implements OnInit {
  private cineService = inject(CineService);
  private router = inject(Router);

  readonly movie = this.cineService.selectedMovie;
  protected selectedDate = signal('');
  protected selectedTime = signal('');
  protected seatMap = signal<Seat[][]>([]);
  protected selectedSeats = signal<string[]>([]);
  protected addedToCart = signal(false);

  // TODO: BACKEND - Los horarios disponibles deberían obtenerse del servidor
  // GET /api/funciones/:movieId con fecha especificada
  readonly availableTimes = [
    '10:00', '12:30', '15:00', '17:30', '20:00', '22:30',
  ];

  protected minDate = this.cineService.getMinDate();

  protected isValidFuncion = computed(
    () => this.selectedDate() !== '' && this.selectedTime() !== ''
  );

  protected selectedCount = computed(() => this.selectedSeats().length);

  protected subtotal = computed(() => {
    const m = this.movie();
    if (!m) return 0;
    return this.selectedSeats().length * m.price;
  });

  ngOnInit(): void {
    if (!this.movie()) {
      this.router.navigate(['/']);
    }
  }

  onDateChange(value: string): void {
    this.selectedDate.set(value);
    this.rebuildSeatMap();
  }

  onTimeChange(value: string): void {
    this.selectedTime.set(value);
    this.rebuildSeatMap();
  }

  private rebuildSeatMap(): void {
    this.selectedSeats.set([]);
    this.addedToCart.set(false);
    const movie = this.movie();
    const date = this.selectedDate();
    const time = this.selectedTime();

    if (!movie || !date || !time) {
      this.seatMap.set([]);
      return;
    }

    const funcion: Funcion = { date, time };
    const occupied = this.cineService.getOccupiedSeatsForFuncion(movie.id, funcion);
    this.seatMap.set(this.cineService.generateSeatMap(7, 10, occupied));
  }

  toggleSeat(seat: Seat): void {
    if (seat.status === 'occupied') return;

    const label = `${seat.row}${seat.col}`;
    const current = [...this.selectedSeats()];
    const index = current.indexOf(label);

    if (index >= 0) {
      current.splice(index, 1);
      seat.status = 'free';
    } else {
      current.push(label);
      seat.status = 'selected';
    }

    this.selectedSeats.set(current);
    this.seatMap.update((map) => [...map]);
  }

  getSeatClass(seat: Seat): string {
    switch (seat.status) {
      case 'free':
        return 'btn-success';
      case 'selected':
        return 'btn-primary';
      case 'occupied':
        return 'btn-danger';
    }
  }

  getSeatLabel(seat: Seat): string {
    return `${seat.row}${seat.col}`;
  }

  addToCart(): void {
    const movie = this.movie();
    if (!movie || this.selectedSeats().length === 0) return;

    const funcion: Funcion = {
      date: this.selectedDate(),
      time: this.selectedTime(),
    };

    this.cineService.addToCart({
      movie,
      funcion,
      seats: [...this.selectedSeats()],
      pricePerTicket: movie.price,
      subtotal: this.subtotal(),
    });

    this.addedToCart.set(true);
  }

  goToCart(): void {
    this.router.navigate(['/carrito']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  isTimeDisabled(time: string): boolean {
    const date = this.selectedDate();
    if (!date) return false;

    const today = new Date();
    const selDate = new Date(date + 'T' + time);
    return selDate < today;
  }
}
