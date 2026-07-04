import type { StoreSummary } from "../types";

export const stores: StoreSummary[] = [
  { id: "1", name: "Warung Ibu Ani", productCount: 128 },
  { id: "2", name: "Kopi Tani Makmur", productCount: 42 },
  { id: "3", name: "Kerajinan Sari Rotan", productCount: 31 },
  { id: "4", name: "Tani Segar Bersama", productCount: 65 },
  { id: "5", name: "Batik Rumahan", productCount: 19 },
];

/** Kategori yang tampil di navigasi; PPOB & Pulsa adalah layanan tanpa produk fisik. */
export const categories = [
  "Sembako",
  "Makanan & Minuman",
  "Kerajinan Tangan",
  "Pertanian Segar",
  "Fashion & Kain",
  "Kesehatan & Herbal",
  "PPOB & Pulsa",
];
