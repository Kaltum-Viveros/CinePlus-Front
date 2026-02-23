import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CineService } from '../../services/cine.service';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-cartelera',
  imports: [FormsModule],
  templateUrl: './cartelera.html',
  styleUrl: './cartelera.scss',
})
export class Cartelera {
  private cineService = inject(CineService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  readonly movies = this.cineService.movies;
  readonly genres = this.cineService.genres;

  protected searchTerm = signal('');
  protected selectedGenre = signal('');
  protected modalMovie = signal<Movie | null>(null);

  protected filteredMovies = computed(() => {
    let result = this.movies;
    const genre = this.selectedGenre();
    const search = this.searchTerm().toLowerCase();

    if (genre) {
      result = result.filter((m) => m.genre === genre);
    }
    if (search) {
      result = result.filter((m) => m.title.toLowerCase().includes(search));
    }
    return result;
  });

  openModal(movie: Movie): void {
    this.modalMovie.set(movie);
  }

  closeModal(): void {
    this.modalMovie.set(null);
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  selectMovie(movie: Movie): void {
    this.cineService.selectMovie(movie);
    this.router.navigate(['/funciones']);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onGenreChange(value: string): void {
    this.selectedGenre.set(value);
  }
}
