# Desain Alur Aplikasi — Pasar Koperasi

Dokumen ini menjelaskan alur pengguna dan proses bisnis aplikasi marketplace multi-toko
"Pasar Koperasi". Semua diagram memakai [Mermaid](https://mermaid.js.org/) (ter-render otomatis
di GitHub dan preview VSCode). Setiap alur mempunyai layar mockup di `fe-marketplace` —
lihat [Pemetaan Layar](#8-pemetaan-layar).

Backend (`be-marketplace`, Go/Fiber) belum diimplementasikan; dokumen ini menjadi acuan alurnya.

## 1. Ringkasan & Aktor

Satu akun user bisa berperan sebagai **pembeli** sekaligus **penjual**. User dapat mendirikan
lebih dari satu toko dan bergabung sebagai staff di toko milik user lain.

| Aktor | Peran |
|---|---|
| **User** | Mendaftar, masuk, mengelola profil; belanja sebagai pembeli; mendirikan/mengelola toko sebagai penjual |
| **Toko** | Unit usaha milik user; punya anggota (owner/staff), produk, detail (logo, deskripsi, lokasi map), office, dan drop point |
| **Office** | Kantor mitra (bukan toko) — **master data** yang sudah tersedia; toko memilih satu office sebagai lokasi kantornya |
| **Drop Point** | Titik ambil/terima paket — **master data**; toko memilih drop point mana saja yang dilayaninya, pembeli memilih salah satunya saat checkout |
| **Kurir** | Membawa paket dari toko ke drop point |
| **Pembayaran (QRIS)** | Kanal pembayaran saat checkout |

## 2. Peta Fitur

```mermaid
flowchart LR
    U(("User"))

    subgraph Pembeli["Sebagai Pembeli"]
        B1["Jelajah & cari produk"]
        B2["Keranjang"]
        B3["Checkout & bayar QRIS"]
        B4["Lacak pesanan"]
    end

    subgraph Penjual["Sebagai Penjual"]
        S1["Buat toko"]
        S2["Kelola detail toko<br/>nama, logo, deskripsi, lokasi map, office"]
        S3["Undang anggota<br/>owner / staff"]
        S4["Kelola produk<br/>draft / publish"]
        S5["Pilih drop point yang dilayani"]
    end

    U --> B1 --> B2 --> B3 --> B4
    U --> S1 --> S2
    S1 --> S3
    S1 --> S4
    S1 --> S5
```

## 3. Alur Akun

Login menjadi prasyarat untuk: membuat/mengelola toko, checkout, dan melihat pesanan.

```mermaid
flowchart TD
    A["Buka aplikasi"] --> B{"Punya akun?"}
    B -- "Belum" --> C["Daftar akun<br/>nama, email, password"]
    C --> D["Masuk (login)"]
    B -- "Sudah" --> D
    D --> E["Lihat profil<br/>avatar, nama, email, bio"]
    E --> F["Ubah profil"]
    E --> G["Toko Saya"]
    E --> H["Pesanan Saya"]
    E --> I["Keluar (logout)"]
```

## 4. Alur Toko

### 4.1 Buat toko & lengkapi detail

```mermaid
flowchart TD
    A["User login"] --> B["Buat toko<br/>nama, deskripsi, logo"]
    B --> C["Toko terbentuk<br/>user menjadi OWNER"]
    C --> D["Lengkapi detail toko"]
    D --> D1["Nama, logo, deskripsi"]
    D --> D2["Lokasi map toko<br/>titik koordinat"]
    D --> D3["Pilih office dari master list<br/>(opsional, bila toko punya kantor)"]
    C --> E["Pilih drop point yang dilayani<br/>dari master list"]
    C --> F["Kelola produk"]
```

### 4.2 Undang anggota toko

Peran anggota: `owner` (pendiri, kontrol penuh) dan `staff` (kelola produk & pesanan).

```mermaid
sequenceDiagram
    actor O as Owner
    participant T as Toko
    actor U as User lain

    O->>T: Undang user (email + peran staff)
    T->>U: Kirim undangan (status DIUNDANG)
    alt Undangan diterima
        U->>T: Terima undangan
        T-->>O: Anggota AKTIF sebagai staff
    else Undangan ditolak
        U->>T: Tolak undangan
        T-->>O: Undangan dihapus
    end
```

## 5. Alur Produk

Atribut produk: foto, nama, harga, stok, **beberapa kategori**, volume, deskripsi, dan lainnya.

```mermaid
flowchart TD
    A["Anggota toko<br/>(owner / staff)"] --> B["Insert produk<br/>foto, nama, harga, stok,<br/>multi-kategori, volume, deskripsi"]
    B --> C{"Langsung publish?"}
    C -- "Ya" --> D["PUBLISHED<br/>tampil di katalog pembeli"]
    C -- "Tidak" --> E["DRAFT<br/>hanya terlihat di dashboard toko"]
    E -- "Publish" --> D
    D -- "Unpublish" --> E
```

```mermaid
stateDiagram-v2
    [*] --> DRAFT : insert produk
    DRAFT --> PUBLISHED : publish
    PUBLISHED --> DRAFT : unpublish
    PUBLISHED --> PUBLISHED : ubah data / stok
```

## 6. Alur Belanja & Pembayaran QRIS

```mermaid
sequenceDiagram
    actor P as Pembeli
    participant K as Katalog
    participant D as Detail Produk
    participant C as Keranjang
    participant CO as Checkout
    participant Q as QRIS

    P->>K: Cari / filter produk
    K-->>P: Produk PUBLISHED
    P->>D: Klik produk (lihat lengkap)
    D-->>P: Foto, harga, stok, kategori, volume, penjelasan
    P->>C: Tambah ke keranjang (atur jumlah)
    C-->>P: Daftar produk, harga, jumlah, total
    P->>CO: Checkout
    CO-->>P: Pilih drop point tujuan
    CO-->>P: Isi lokasi pengiriman (gedung, lantai, ruangan, penjelasan)
    CO-->>P: Pilih metode pembayaran (QRIS)
    P->>CO: Selesaikan checkout
    CO-->>P: Tampilkan kode QRIS
    P->>Q: Scan kode QR & bayar
    Q-->>CO: Pembayaran terkonfirmasi
    CO-->>P: Pesanan terbentuk (status DIBAYAR)
    Note over P,CO: Pembeli memantau proses di halaman Pesanan
```

## 7. Status Pesanan

Setelah pembayaran, toko dan kurir menggerakkan status; pembeli memantau lima tahap tracking.

```mermaid
stateDiagram-v2
    [*] --> MENUNGGU_PEMBAYARAN : checkout
    MENUNGGU_PEMBAYARAN --> DIBAYAR : QRIS terkonfirmasi
    MENUNGGU_PEMBAYARAN --> DIBATALKAN : batal / kedaluwarsa
    DIBAYAR --> DISIAPKAN : toko memproses
    DISIAPKAN --> DISERAHKAN_KE_KURIR : paket diserahkan
    DISERAHKAN_KE_KURIR --> DIANTAR : kurir dalam perjalanan
    DIANTAR --> TIBA_DI_DROP_POINT : paket tiba di drop point
    TIBA_DI_DROP_POINT --> SELESAI : barang diterima pembeli
    SELESAI --> [*]
    DIBATALKAN --> [*]
```

| Status | Yang mengubah | Arti bagi pembeli |
|---|---|---|
| `MENUNGGU_PEMBAYARAN` | Sistem | Selesaikan pembayaran QRIS |
| `DIBAYAR` | Sistem (konfirmasi QRIS) | Pembayaran diterima, menunggu toko |
| `DISIAPKAN` | Toko | Pesanan sedang disiapkan |
| `DISERAHKAN_KE_KURIR` | Toko | Paket diberikan ke kurir |
| `DIANTAR` | Kurir | Paket sedang diantarkan |
| `TIBA_DI_DROP_POINT` | Kurir / drop point | Paket bisa diambil / segera diserahkan di drop point |
| `SELESAI` | Drop point / pembeli | Barang pesanan sudah diterima |
| `DIBATALKAN` | Sistem / pembeli | Pesanan batal (belum dibayar) |

## 8. Pemetaan Layar

Mockup UI (data demo, tanpa backend) ada di `src/pages/`:

| Langkah alur | Route |
|---|---|
| Daftar akun | `/register` |
| Masuk | `/login` |
| Lihat / ubah profil, keluar | `/profile` |
| Daftar toko milik/ikutan user | `/toko` |
| Buat toko | `/toko/buat` |
| Detail toko, anggota, produk, drop point | `/toko/kelola` (4 tab) |
| Insert produk | `/toko/kelola/produk-baru` |
| Jelajah & cari produk | `/` dan `/products` |
| Lihat produk lengkap (klik dari katalog) | `/products/[id]` |
| Keranjang (daftar produk, harga, jumlah, total) | `/cart` |
| Checkout: drop point, lokasi pengiriman (gedung/lantai/ruangan/penjelasan), pilih pembayaran, QRIS | `/checkout` |
| Daftar pesanan (pesanan hasil checkout muncul paling atas) | `/orders` |
| Lacak pesanan contoh (stepper 5 tahap) | `/orders/[id]` |
| Lacak pesanan hasil checkout Anda | `/orders/lacak?id=...` |

Catatan implementasi mockup: keranjang dan sesi login disimulasikan dengan `localStorage`
(`src/lib/cart.ts`, `src/lib/session.ts`); pesanan hasil checkout dibuat lewat API contoh dan
juga disalin ke `localStorage` (`src/lib/my-orders.ts`) sebagai cadangan.

## 9. API Contoh

Server Astro (adapter Node) menyediakan API contoh dengan data statis di `src/pages/api/`.
Semua respons memakai amplop `{ data }` (sukses) atau `{ error }` (gagal). Komponen React
**tidak memanggil `fetch` langsung** — semuanya lewat lapisan service di `src/services/`
(`http.ts` sebagai dasar, lalu `product-service`, `order-service`, `master-service`,
`store-service`), dengan fallback data lokal bila API tak terjangkau.

| Method | Endpoint | Fungsi | Dipakai oleh |
|---|---|---|---|
| GET | `/api/products?q=&kategori=&sort=` | Katalog PUBLISHED + filter server | `ProductBrowser` |
| GET | `/api/products/:id` | Detail satu produk | `ProductPurchase` (validasi stok) |
| GET | `/api/categories` | Master kategori | — |
| GET | `/api/offices` | Master office | — |
| GET | `/api/drop-points` | Master drop point | — |
| GET | `/api/store` | Toko demo + anggota + produk | — |
| GET | `/api/orders` | Pesanan contoh + hasil checkout | `OrdersList` |
| POST | `/api/orders` | Buat pesanan → `MENUNGGU_PEMBAYARAN` | `CheckoutFlow` (Selesaikan Checkout) |
| GET | `/api/orders/:id` | Detail satu pesanan | `OrderTracking` |
| POST | `/api/orders/:id/pay` | Konfirmasi QRIS → `DISIAPKAN` | `CheckoutFlow` (Saya sudah membayar) |

Pesanan hasil `POST` disimpan di memori server (hilang saat restart) — pada aplikasi nyata
seluruh endpoint ini digantikan `be-marketplace`.
