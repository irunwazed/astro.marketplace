import type { Product, Store, StoreMember, StoreMembership } from "../types";
import { products } from "./products";

/** Toko demo yang dikelola user demo (Siti Pratiwi) sebagai owner. */
export const myStore: Store = {
  id: "ST-1",
  name: "Warung Ibu Ani",
  logo: "https://placehold.co/128x128/1e5443/ffffff?text=WA",
  description:
    "Warung kelontong anggota koperasi: sembako, camilan, dan produk olahan rumahan dari tetangga sekitar.",
  address: "Jl. Kenanga No. 17, Pasar Minggu, Jakarta Selatan",
  location: { lat: -6.2871, lng: 106.8402 },
  officeId: "OF-1",
  dropPointIds: ["DP-1", "DP-2", "DP-4"],
};

export const myStoreMembers: StoreMember[] = [
  {
    id: "M-1",
    name: "Siti Pratiwi",
    email: "siti.pratiwi@example.com",
    role: "owner",
    status: "aktif",
  },
  {
    id: "M-2",
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    role: "staff",
    status: "aktif",
  },
  {
    id: "M-3",
    name: "Rina Marlina",
    email: "rina.marlina@example.com",
    role: "staff",
    status: "diundang",
  },
];

const image = (text: string) =>
  `https://placehold.co/400x400/eeece4/98a29a?text=${encodeURIComponent(text)}`;

/** Produk DRAFT milik toko — belum tampil di katalog pembeli. */
const draftProducts: Product[] = [
  {
    id: "D-1",
    name: "Rendang Kemasan Vakum 250gr",
    price: 55000,
    image: image("Rendang"),
    category: "Makanan & Minuman",
    categories: ["Makanan & Minuman"],
    seller: "Warung Ibu Ani",
    rating: 0,
    sold: 0,
    stock: 20,
    volume: "250 gr",
    description: "Rendang daging sapi masak rumahan, dikemas vakum tahan 2 minggu.",
    published: false,
  },
  {
    id: "D-2",
    name: "Teh Herbal Rosella Celup",
    price: 21000,
    image: image("Teh rosella"),
    category: "Kesehatan & Herbal",
    categories: ["Kesehatan & Herbal", "Makanan & Minuman"],
    seller: "Warung Ibu Ani",
    rating: 0,
    sold: 0,
    stock: 35,
    volume: "20 kantong",
    description: "Teh celup bunga rosella kering, tanpa pemanis tambahan.",
    published: false,
  },
];

/** Semua produk toko demo: yang tayang di katalog + yang masih draft. */
export const myStoreProducts: Product[] = [
  ...products.filter((p) => p.seller === myStore.name),
  ...draftProducts,
];

/** Daftar toko yang dimiliki/diikuti user demo — untuk halaman "Toko Saya". */
export const myMemberships: StoreMembership[] = [
  {
    storeId: "ST-1",
    storeName: "Warung Ibu Ani",
    logo: "https://placehold.co/96x96/1e5443/ffffff?text=WA",
    role: "owner",
    productCount: myStoreProducts.length,
  },
  {
    storeId: "ST-2",
    storeName: "Kopi Tani Makmur",
    logo: "https://placehold.co/96x96/c96a55/ffffff?text=KT",
    role: "staff",
    productCount: 42,
  },
];
