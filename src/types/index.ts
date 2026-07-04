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
  /** Slug URL produk, mis. "kopi-robusta-250gr". */
  slug?: string;
  /** Berat kemasan dalam gram — untuk kalkulasi ongkir. */
  weight?: number;
  /** Dimensi kemasan (cm) — untuk kalkulasi ongkir. */
  dimensions?: { length: number; width: number; height: number };
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

export type StoreMemberRole =
  | "owner"
  | "manager"
  | "staff pembelian"
  | "staff verifikasi"
  | "staff"
  | "kasir"
  | "kurir";

export interface StoreMember {
  id: string;
  name: string;
  email: string;
  role: StoreMemberRole;
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
  /** Ongkir flat (IDR) ke drop point ini. Ditanggung pembeli. */
  shippingCost: number;
}

/**
 * Drop point milik sebuah toko — bisa master (dari daftar pusat) atau custom
 * (dibuat toko sendiri lewat map). Master dipakai via Store.dropPointIds,
 * custom disimpan per toko.
 */
export interface StoreDropPoint {
  id: string;
  storeId: string;
  name: string;
  address: string;
  location: GeoPoint;
  shippingCost: number;
  /** true bila dibuat oleh toko sendiri; false bila dari master list. */
  isCustom: boolean;
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
  /** Total akhir yang dibayar pembeli (subtotal + ongkir + admin, bila ada). */
  total: number;
  /** Subtotal harga barang (Σ price × qty). Opsional — order lama mungkin tidak punya. */
  subtotal?: number;
  /** Ongkir ke drop point. Opsional — order lama mungkin tidak punya. */
  ongkir?: number;
  /** Biaya admin QRIS (0,7%, pembulatan ke atas). Opsional — order lama mungkin tidak punya. */
  adminFee?: number;
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

/** Anggota koperasi (bukan anggota toko) — untuk lookup saat checkout kasir. */
export interface KoperasiMember {
  memberNo: string;
  name: string;
  email: string;
  phone?: string;
}

export type KasirPaymentMethod = "cash" | "qris" | "transfer";

/** Transaksi hasil checkout kasir toko (offline, tanpa pengiriman). */
export interface KasirTransaction {
  id: string;
  storeId: string;
  storeName: string;
  /** Nama & email kasir yang memproses (dari session login). */
  kasirName: string;
  kasirEmail: string;
  /** Nomor & nama anggota koperasi yang belanja (opsional). */
  memberNo?: string;
  memberName?: string;
  items: OrderItem[];
  subtotal: number;
  /** Biaya admin — selalu 0 di kasir (QRIS statis, cash, transfer manual). */
  adminFee: number;
  total: number;
  paymentMethod: KasirPaymentMethod;
  /** ISO datetime transaksi. */
  datetime: string;
  status: "selesai";
}
