import type { KoperasiMember } from "../types";

/**
 * Mock data anggota koperasi — untuk lookup nomor anggota saat checkout
 * di halaman kasir toko. Nantinya diganti dengan endpoint backend
 * GET /api/members/:no yang query database anggota koperasi.
 */
export const koperasiMembers: KoperasiMember[] = [
  { memberNo: "ANG-2026-0001", name: "Siti Pratiwi", email: "siti.pratiwi@example.com", phone: "081234500001" },
  { memberNo: "ANG-2026-0002", name: "Budi Santoso", email: "budi.santoso@example.com", phone: "081234500002" },
  { memberNo: "ANG-2026-0003", name: "Rina Marlina", email: "rina.marlina@example.com", phone: "081234500003" },
  { memberNo: "ANG-2026-0004", name: "Joko Prasetyo", email: "joko.prasetyo@example.com", phone: "081234500004" },
  { memberNo: "ANG-2026-0005", name: "Dewi Lestari", email: "dewi.lestari@example.com", phone: "081234500005" },
  { memberNo: "ANG-2026-0006", name: "Ahmad Fauzi", email: "ahmad.fauzi@example.com", phone: "081234500006" },
  { memberNo: "ANG-2026-0007", name: "Maya Sari", email: "maya.sari@example.com", phone: "081234500007" },
  { memberNo: "ANG-2026-0008", name: "Hendra Wijaya", email: "hendra.wijaya@example.com", phone: "081234500008" },
];

/** Cari anggota by nomor anggota. */
export function findKoperasiMember(memberNo: string): KoperasiMember | undefined {
  return koperasiMembers.find((m) => m.memberNo === memberNo.trim());
}