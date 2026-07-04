export interface NavLink {
  label: string;
  href: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  /** Harga sebelum diskon; tampil dicoret bila ada. */
  originalPrice?: number;
  image: string;
  /** Kategori utama (tampil di kartu produk). */
  category: string;
  /** Produk bisa punya beberapa kategori. */
  categories: string[];
  seller: string;
  rating: number;
  sold: number;
  badge?: "Terlaris" | "Baru";
  stock: number;
  /** Volume/berat kemasan, mis. "250 gr", "350 ml". */
  volume: string;
  description: string;
  /** Hanya produk published yang tampil di katalog pembeli. */
  published: boolean;
}

/** Ringkasan toko untuk strip mitra di beranda. */
export interface StoreSummary {
  id: string;
  name: string;
  productCount: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  description: string;
  address: string;
  location: GeoPoint;
  /** Office (kantor mitra) dari master list; opsional. */
  officeId?: string;
  /** Drop point dari master list yang dilayani toko. */
  dropPointIds: string[];
}

export interface StoreMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "staff";
  status: "aktif" | "diundang";
}

/** Keanggotaan user pada sebuah toko (untuk halaman "Toko Saya"). */
export interface StoreMembership {
  storeId: string;
  storeName: string;
  logo: string;
  role: "owner" | "staff";
  productCount: number;
}

export interface Office {
  id: string;
  name: string;
  address: string;
  location: GeoPoint;
}

export interface DropPoint {
  id: string;
  name: string;
  address: string;
  location: GeoPoint;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  seller: string;
  qty: number;
  /** Stok produk saat dimasukkan — jumlah beli dibatasi angka ini. */
  stock?: number;
}

export type OrderStatus =
  | "MENUNGGU_PEMBAYARAN"
  | "DIBAYAR"
  | "DISIAPKAN"
  | "DISERAHKAN_KE_KURIR"
  | "DIANTAR"
  | "TIBA_DI_DROP_POINT"
  | "SELESAI"
  | "DIBATALKAN";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

/** Detail lokasi penerima di drop point (gedung/kantor). */
export interface DeliveryLocation {
  building: string;
  floor: string;
  room: string;
  note?: string;
}

export interface Order {
  id: string;
  /** Tanggal pesanan, format ISO (YYYY-MM-DD). */
  date: string;
  storeName: string;
  items: OrderItem[];
  total: number;
  dropPointId: string;
  delivery?: DeliveryLocation;
  payment: "QRIS";
  status: OrderStatus;
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
}
