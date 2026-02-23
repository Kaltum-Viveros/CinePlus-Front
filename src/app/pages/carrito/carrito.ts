import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CineService } from '../../services/cine.service';

/**
 * Componente del carrito de compras.
 * 
 * TODO: INTEGRACIÓN CON BACKEND
 * Para gestionar compras reales:
 * 1. Validar cupones con el backend: POST /api/cupones/validar
 * 2. Confirmar compra en el servidor antes de marcar asientos como ocupados
 */
@Component({
  selector: 'app-carrito',
  imports: [FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss',
})
export class Carrito {
  private cineService = inject(CineService);
  private router = inject(Router);

  readonly cart = this.cineService.cart;
  readonly cartTotal = this.cineService.cartTotal;
  readonly cartCount = this.cineService.cartCount;

  protected couponCode = signal('');
  protected couponApplied = signal(false);
  protected couponDiscount = signal(0);
  protected purchaseCompleted = signal(false);
  protected couponError = signal('');

  // TODO: BACKEND - Los cupones deberían validarse contra el servidor
  private readonly validCoupons: Record<string, number> = {
    CINE10: 10,
    CINE20: 20,
    PROMO15: 15,
  };

  protected finalTotal = computed(() => {
    const total = this.cartTotal();
    const discount = this.couponDiscount();
    return total - total * (discount / 100);
  });

  protected discountAmount = computed(() => {
    return this.cartTotal() * (this.couponDiscount() / 100);
  });

  applyCoupon(): void {
    const code = this.couponCode().toUpperCase().trim();
    
    // TODO: BACKEND - Validar cupón con el servidor
    // this.http.post<{valid: boolean, discount: number}>('/api/cupones/validar', { code })
    //   .subscribe({
    //     next: (response) => {
    //       if (response.valid) {
    //         this.couponDiscount.set(response.discount);
    //         this.couponApplied.set(true);
    //         this.couponError.set('');
    //       } else {
    //         this.couponError.set('Cupón no válido');
    //       }
    //     }
    //   });
    
    if (this.validCoupons[code]) {
      this.couponDiscount.set(this.validCoupons[code]);
      this.couponApplied.set(true);
      this.couponError.set('');
    } else {
      this.couponError.set('Cupón no válido. Prueba: CINE10, CINE20, PROMO15');
      this.couponApplied.set(false);
      this.couponDiscount.set(0);
    }
  }

  removeCoupon(): void {
    this.couponCode.set('');
    this.couponApplied.set(false);
    this.couponDiscount.set(0);
    this.couponError.set('');
  }

  removeTicket(index: number): void {
    this.cineService.removeFromCart(index);
  }

  confirmPurchase(): void {
    if (this.cart().length === 0) return;

    const content = this.cineService.confirmPurchase(this.couponDiscount());
    if (content) {
      this.cineService.downloadFile(content, 'boletos.txt');
      this.purchaseCompleted.set(true);
    }
  }

  goToCartelera(): void {
    this.router.navigate(['/']);
  }

  onCouponChange(value: string): void {
    this.couponCode.set(value);
  }
}
