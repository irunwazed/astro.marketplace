import type { DropPoint } from "../types";

/**
 * Master data drop point — titik ambil/terima paket.
 * Toko memilih drop point yang dilayaninya; pembeli memilih salah satunya saat checkout.
 */
export const dropPoints: DropPoint[] = [
  {
    id: "DP-1",
    name: "Drop Point Pasar Minggu",
    address: "Jl. Raya Pasar Minggu No. 2, Jakarta Selatan",
    location: { lat: -6.2842, lng: 106.8444 },
  },
  {
    id: "DP-2",
    name: "Drop Point Stasiun Tebet",
    address: "Jl. Tebet Barat No. 1, Jakarta Selatan",
    location: { lat: -6.2262, lng: 106.8584 },
  },
  {
    id: "DP-3",
    name: "Drop Point Kantor Kelurahan Cikini",
    address: "Jl. Cikini Kramat No. 5, Jakarta Pusat",
    location: { lat: -6.1928, lng: 106.8412 },
  },
  {
    id: "DP-4",
    name: "Drop Point Minimarket Koperasi Depok",
    address: "Jl. Margonda Raya No. 310, Depok",
    location: { lat: -6.3815, lng: 106.8317 },
  },
  {
    id: "DP-5",
    name: "Drop Point Terminal Kampung Rambutan",
    address: "Jl. TB Simatupang, Jakarta Timur",
    location: { lat: -6.3087, lng: 106.8834 },
  },
  {
    id: "DP-6",
    name: "Drop Point Alun-Alun Bekasi",
    address: "Jl. Veteran No. 1, Bekasi",
    location: { lat: -6.2416, lng: 106.9924 },
  },
];
