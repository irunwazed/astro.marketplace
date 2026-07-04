import type { Office } from "../types";

/** Master data kantor mitra — toko memilih salah satu sebagai lokasi kantornya. */
export const offices: Office[] = [
  {
    id: "OF-1",
    name: "Kantor Koperasi Pusat",
    address: "Jl. Merdeka No. 10, Menteng, Jakarta Pusat",
    location: { lat: -6.1862, lng: 106.8341 },
  },
  {
    id: "OF-2",
    name: "Office Bersama Cikini",
    address: "Jl. Cikini Raya No. 45, Jakarta Pusat",
    location: { lat: -6.1934, lng: 106.8399 },
  },
  {
    id: "OF-3",
    name: "Gedung UMKM Center Bandung",
    address: "Jl. Braga No. 88, Bandung",
    location: { lat: -6.9175, lng: 107.6098 },
  },
  {
    id: "OF-4",
    name: "Rumah BUMN Yogyakarta",
    address: "Jl. Malioboro No. 152, Yogyakarta",
    location: { lat: -7.7925, lng: 110.3658 },
  },
];
