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

  readonly validatingCoupon = this.cineService.validatingCoupon;
  readonly processingPurchase = this.cineService.processingPurchase;
  readonly compraError = this.cineService.compraError;

  protected couponCode = signal('');
  protected couponApplied = signal(false);
  protected couponDiscount = signal(0);
  protected purchaseCompleted = signal(false);
  protected couponError = signal('');

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

    if (!code) {
      this.couponError.set('Ingresa un cupón.');
      return;
    }

    this.cineService.validateCoupon(code, this.cartTotal(), (response) => {
      if (response.valid) {
        this.couponCode.set(response.code || code);
        this.couponDiscount.set(response.discountPercentage);
        this.couponApplied.set(true);
        this.couponError.set('');
      } else {
        this.couponError.set(response.message);
        this.couponApplied.set(false);
        this.couponDiscount.set(0);
      }
    });
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

    const couponCode = this.couponApplied()
      ? this.couponCode().toUpperCase().trim()
      : null;

    this.cineService.confirmPurchase(couponCode, (compra) => {
      this.cineService.downloadFile(
        compra.contenidoTxt,
        `boletos-compra-${compra.id}.txt`
      );

      this.purchaseCompleted.set(true);
    });
  }

  goToCartelera(): void {
    this.router.navigate(['/']);
  }

  onCouponChange(value: string): void {
    this.couponCode.set(value);
  }
}
