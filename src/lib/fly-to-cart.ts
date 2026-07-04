/**
 * Animasi gambar produk "terbang" dari posisi kartu produk ke ikon keranjang
 * di header. Dipakai saat klik "Tambah ke Keranjang".
 *
 * Cara kerja: klon elemen gambar, posisikan fixed di lokasi asal, lalu
 * transisi ke lokasi ikon cart. Setelah animasi selesai, hapus klon & beri
 * efek "bump" pada badge cart.
 */

/** Cari elemen ikon keranjang di header (link dengan aria-label "Keranjang, ..."). */
function findCartIcon(): HTMLElement | null {
  return document.querySelector<HTMLElement>('a[aria-label^="Keranjang"]');
}

/** Cari elemen badge cart (span dengan bg-rose). */
function findCartBadge(): HTMLElement | null {
  const cart = findCartIcon();
  if (!cart) return null;
  return cart.querySelector<HTMLElement>("span.bg-rose");
}

/** Bump animasi pada badge cart — class di-toggle lalu dihapus. */
export function bumpCart() {
  const badge = findCartBadge();
  if (!badge) return;
  badge.classList.remove("cart-bump");
  void badge.offsetWidth; // force reflow agar animasi restart
  badge.classList.add("cart-bump");
}

/**
 * Lepaskan gambar dari `sourceImg` ke ikon keranjang.
 * `sourceImg` adalah elemen <img> di dalam kartu produk.
 */
export function flyToCart(sourceImg: HTMLElement) {
  const cart = findCartIcon();
  if (!cart) return;

  const srcRect = sourceImg.getBoundingClientRect();
  const cartRect = cart.getBoundingClientRect();
  if (srcRect.width === 0 || srcRect.height === 0) return;

  // Klon gambar sebagai elemen terbang — bentuk persegi panjang dengan
  // sudut membulat agar gambar produk tetap terlihat jelas (bukan bulatan).
  const flyer = document.createElement("div");
  flyer.style.cssText = `
    position: fixed;
    left: ${srcRect.left}px;
    top: ${srcRect.top}px;
    width: ${srcRect.width}px;
    height: ${srcRect.height}px;
    border-radius: 12px;
    overflow: hidden;
    z-index: 60;
    pointer-events: none;
    transition: all 0.6s cubic-bezier(0.5, -0.3, 0.9, 0.6);
    box-shadow: 0 6px 16px rgba(0,0,0,0.25);
  `;

  const img = document.createElement("img");
  img.src = (sourceImg as HTMLImageElement).src;
  img.alt = "";
  img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
  flyer.appendChild(img);
  document.body.appendChild(flyer);

  // Hitung target (tengah ikon cart).
  const targetX = cartRect.left + cartRect.width / 2 - 24;
  const targetY = cartRect.top + cartRect.height / 2 - 24;

  // Pindah ke posisi cart pada frame berikutnya — menyusut sambil terlihat.
  requestAnimationFrame(() => {
    flyer.style.left = `${targetX}px`;
    flyer.style.top = `${targetY}px`;
    flyer.style.width = "48px";
    flyer.style.height = "48px";
    flyer.style.opacity = "0.5";
    flyer.style.transform = "scale(0.5)";
  });

  // Setelah transisi selesai, hapus flyer & bump badge.
  setTimeout(() => {
    flyer.remove();
    bumpCart();
  }, 620);
}