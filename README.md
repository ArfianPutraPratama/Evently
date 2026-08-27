# Evently — SurabayaDev Event & Digital Ticketing Platform

> **SurabayaDev Volunteer Developer Team Technical Assessment**  
> Stack Arsitektur: **React 19 + TypeScript + Vite + Tailwind CSS + Laravel 11 (PHP 8.4) + PostgreSQL 16 + Midtrans Payment Gateway + Docker Compose**.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![Laravel](https://img.shields.io/badge/laravel-11.x-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/react-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/postgresql-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)

---

## 📌 Daftar Isi
1. [Ringkasan Proyek & Fitur Utama](#-ringkasan-proyek--fitur-utama)
2. [Kredensial Akun Demo (Role-Based Access)](#-kredensial-akun-demo-role-based-access)
3. [Panduan Instalasi & Cara Penggunaan](#-panduan-instalasi--cara-penggunaan)
4. [Desain Proses Bisnis (Business Process)](#-desain-proses-bisnis-business-process)
5. [Flowchart Struktur Alur Sistem](#-flowchart-struktur-alur-sistem)
6. [Data Flow Diagram (DFD)](#-data-flow-diagram-dfd)
7. [Entity Relationship Diagram (ERD)](#-entity-relationship-diagram-erd)
8. [Keunggulan Rekayasa Sistem (Engineering Highlights)](#-keunggulan-rekayasa-sistem-engineering-highlights)
9. [Daftar Endpoint REST API](#-daftar-endpoint-rest-api)

---

## 📖 Ringkasan Proyek & Fitur Utama

**Evently** adalah platform manajemen event dan penerbitan tiket digital modern yang dirancang khusus untuk menangani skenario beban tinggi (*high-concurrency*) pada perhelatan komunitas teknologi (seperti SurabayaDev 12th Anniversary). Sistem ini menjamin integritas data tanpa risiko *overselling* kuota (bebas *race condition*) serta pencegahan *duplicate check-in* atomik di gerbang masuk acara.

### 🌟 Fitur-Fitur Utama:
* **Katalog Event Dinamis**: Menampilkan event gratis dan VIP berbayar, lengkap dengan kategori, filter pencarian teks instan (*debounced*), kuota dinamis, dan detail narasumber.
* **Integrasi Pembayaran Midtrans Snap**: Mendukung transaksi pembayaran tiket VIP melalui QRIS (GoPay, OVO, ShopeePay) dan Virtual Account (BCA, Mandiri, BNI, BRI) Sandbox.
* **Pessimistic Concurrency Locking**: Melindungi transaksi pemesanan tiket dengan `SELECT ... FOR UPDATE` pada PostgreSQL untuk menjamin tidak ada kuota yang terjual melebihi kapasitas (*zero overselling*).
* **Tiket Digital Ber-QR Code Kriptografis**: Setiap tiket dilengkapi payload JSON yang ditandatangani dengan algoritma **HMAC-SHA256** berbasis *Secret Server Key* untuk mencegah pemalsuan tiket.
* **Terminal Gatekeeper Scanner**: Pemindai kamera interaktif untuk panitia gerbang masuk dengan audio-visual feedback (suara *beep* sukses, *warning buzz* tiket ganda/palsu) serta pencatatan audit log perangkat dan waktu presisi.
* **Quick Role Switcher**: Tombol cepat di navbar untuk reviewer/penguji agar dapat berganti peran secara instan antara **Peserta**, **Panitia**, dan **Admin** tanpa perlu mengetik ulang email dan password.

---

## 👥 Kredensial Akun Demo (Role-Based Access)

Aplikasi memiliki 3 hak akses peran (*Role-Based Access Control / RBAC*):

| Role | Email | Password | Hak Akses & Fitur |
| :--- | :--- | :--- | :--- |
| 🎓 **Peserta** (*Participant*) | `peserta@surabayadev.org` | `password` | Menjelajahi katalog event, pendaftaran event gratis & VIP berbayar (Midtrans), akses dompet tiket digital (*QR Pass*), unduh invoice. |
| 🛡️ **Panitia** (*Committee / Gatekeeper*) | `panitia@surabayadev.org` | `password` | Akses Terminal Pemindai Gerbang Masuk, scan QR Code via kamera/input kode manual, validasi instan, deteksi tiket duplikat, monitoring log presensi. |
| 👑 **Admin** (*Organizer Lead*) | `admin@surabayadev.org` | `password` | Manajemen Event (CRUD), pengaturan harga & kuota, analitik rasio kehadiran (*attendance rate*), ekspor rekap peserta, pemantauan transaksi. |

> 💡 **Tips Pengujian**: Anda juga dapat mengklik tombol **Role: Peserta / Panitia / Admin** di pojok kanan atas Navbar untuk login otomatis dalam 1 detik!

---

## 🚀 Panduan Instalasi & Cara Penggunaan

### 1. Menjalankan Menggunakan Docker Compose (Direkomendasikan)
Pastikan Docker dan Docker Compose telah terpasang di sistem Anda.

```bash
# 1. Clone repository
git clone https://github.com/ArfianPutraPratama/Evently.git
cd Evently

# 2. Jalankan seluruh container (PostgreSQL, Backend Laravel, Frontend React)
docker compose up -d

# 3. Cek status container
docker compose ps
```

Semua layanan akan aktif secara otomatis:
* **Frontend Web**: `http://localhost:5177`
* **Backend REST API**: `http://localhost:8080`
* **PostgreSQL Database**: `localhost:5433` (`evently_db`)

---

### 2. Cara Penggunaan Alur Aplikasi (Step-by-Step)

```
[1. Jelajahi Katalog] ➔ [2. Pilih Tiket] ➔ [3. Bayar via Midtrans] ➔ [4. Dapatkan E-Tiket] ➔ [5. Scan di Gerbang Masuk]
```

#### A. Alur Pemesanan Tiket (Sebagai Peserta)
1. Buka browser di **`http://localhost:5177`**.
2. Login sebagai **Peserta** (`peserta@surabayadev.org` / `password`).
3. Pilih salah satu event (misal: *Cybersecurity Hands-on* atau *Modern Full-Stack Mastery*).
4. Klik tombol **Daftar / Beli Tiket**.
5. Pilih metode pembayaran:
   * **QRIS Instan** (GoPay / OVO)
   * **Virtual Account BCA / Mandiri**
6. Klik **Bayar Sekarang**. Transaksi akan diproses melalui gateway Midtrans.
7. Setelah lunas, modal konfeti perayaan akan muncul dan **Tiket Digital QR Code** resmi diterbitkan ke tab **Tiket Saya**.

#### B. Alur Validasi Check-In (Sebagai Panitia / Gatekeeper)
1. Ganti role ke **Panitia** melalui tombol switcher di navbar.
2. Masuk ke halaman **Terminal Gatekeeper**.
3. Izinkan akses kamera atau ketikkan kode tiket manual (contoh tiket uji coba bawaan seeder: `TKT-12TH-CHECKED` atau tiket baru Anda).
4. **Hasil Verifikasi**:
   * 🟢 **BERHASIL (Status Hijau)**: Tiket asli, belum pernah dipakai, status berubah menjadi `checked_in`.
   * 🔴 **TIKET GANDA (Status Merah)**: Tiket sudah pernah dipakai sebelumnya, sistem menampilkan waktu dan petugas pertama yang melakukan scan (*anti-fraud*).
   * ⚠️ **TIDAK VALID**: Kode tiket palsu atau tanda tangan digital HMAC tidak cocok.

#### C. Alur Pengelolaan Event (Sebagai Admin)
1. Ganti role ke **Admin** di navbar.
2. Akses halaman **Admin Console / Dashboard**.
3. Kelola event (Tambah Event Baru, Edit Kuota, Ubah Status Publikasi).
4. Pantau metrik kehadiran secara *real-time* (Persentase kehadiran, jumlah tiket terbit vs kuota).

---

## 💼 Desain Proses Bisnis (Business Process)

Alur proses bisnis operasional tiket event SurabayaDev dari pendaftaran hingga kedatangan di venue digambarkan dalam diagram alir proses bisnis berikut:

```mermaid
sequenceDiagram
    autonumber
    actor Peserta
    participant Web as Frontend (React 19)
    participant API as Backend (Laravel 11)
    participant DB as Database (PostgreSQL)
    participant PG as Payment Gateway (Midtrans)
    actor Panitia as Panitia Gatekeeper

    Note over Peserta,DB: FASE 1: Registrasi & Pemesanan Tiket
    Peserta->>Web: Pilih Event & Klik Daftar Tiket
    Web->>API: POST /api/events/{id}/register (Pessimistic Lock)
    API->>DB: BEGIN TRANSACTION & SELECT ... FOR UPDATE
    alt Kuota Habis
        DB-->>API: Kuota Full (registered_count >= quota)
        API-->>Web: HTTP 422: Kuota Tiket Habis
        Web-->>Peserta: Notifikasi Maaf Kuota Penuh
    else Kuota Tersedia
        API->>DB: UPDATE registered_count = registered_count + 1
        alt Event Berbayar (VIP)
            API->>PG: Request Snap Token (Amount, ItemDetails)
            PG-->>API: Return Snap Token & Redirect URL
            API-->>Web: Snap Token Pembayaran
            Web->>PG: Render Midtrans Snap Modal
            Peserta->>PG: Bayar via QRIS / Virtual Account
            PG-->>API: Webhook / Notification Callback (Settlement)
        end
        API->>API: Generate Ticket Code & HMAC-SHA256 Signature
        API->>DB: INSERT into registrations & tickets (issued)
        API->>DB: COMMIT TRANSACTION
        API-->>Web: HTTP 201: Tiket Digital Diterbitkan
        Web-->>Peserta: Tampilkan QR Pass & Tiket Digital
    end

    Note over Peserta,Panitia: FASE 2: Hari-H Event & Gate Check-In
    Peserta->>Panitia: Tunjukkan QR Code Tiket di Pintu Masuk
    Panitia->>Web: Arahkan Scanner Kamera ke QR Code Tiket
    Web->>API: POST /api/tickets/check-in {ticket_code}
    API->>DB: BEGIN TRANSACTION & SELECT ticket FOR UPDATE
    alt Tiket Sudah Pernah Digunakan
        DB-->>API: Status == 'checked_in'
        API->>DB: INSERT check_in_logs (Result: duplicate_rejected)
        API-->>Web: HTTP 409 Conflict: Tiket Ganda Ditolak!
        Web-->>Panitia: Audio Buzz & Tampilan Merah (Peringatan)
    else Tiket Valid & Pertama Kali Scan
        API->>DB: UPDATE tickets SET status = 'checked_in', checked_in_at = NOW()
        API->>DB: INSERT check_in_logs (Result: success)
        API->>DB: COMMIT TRANSACTION
        API-->>Web: HTTP 200 OK: Validasi Sukses!
        Web-->>Panitia: Audio Beep & Tampilan Hijau (Silakan Masuk)
    end
```

---

## 🔀 Flowchart Struktur Alur Sistem

### 1. Flowchart Registrasi & Pembayaran Tiket

```mermaid
flowchart TD
    A([Mulai: Peserta Buka Event]) --> B{User Sudah Login?}
    B -- Tidak --> C[Arahkan ke Modal Login / Register]
    C --> B
    B -- Ya --> D[Pilih Jenis Tiket Event]
    D --> E{Apakah Event Berbayar?}
    
    E -- Gratis --> F[Mulai DB Transaction: lockForUpdate]
    E -- Berbayar --> G[Pilih Metode: QRIS / VA BCA / VA Mandiri]
    G --> H[Inisialisasi Transaksi Midtrans Snap]
    H --> I{Status Bayar Midtrans?}
    I -- Gagal / Batal --> J[Batalkan Transaksi & Tampilkan Pesan]
    I -- Berhasil / Lunas --> F
    
    F --> K{Sisa Kuota > 0?}
    K -- Tidak --> L[Rollback Transaction & Kembalikan Error 422]
    L --> M([Selesai: Notifikasi Kuota Habis])
    
    K -- Ya --> N[Tambahkan registered_count + 1]
    N --> O[Generate Nomor Tiket & Tanda Tangan HMAC-SHA256]
    O --> P[Simpan Data ke Tabel registrations & tickets]
    P --> Q[Commit Database Transaction]
    Q --> R[Kirim Respons Sukses & Render QR Tiket]
    R --> S([Selesai: Tiket Siap Digunakan])
```

---

### 2. Flowchart Pemindaian Tiket di Gerbang Masuk (Anti-Duplicate Check-In)

```mermaid
flowchart TD
    A([Mulai: Panitia Buka Terminal Scanner]) --> B[Kamera Siap / Input Kode Manual]
    B --> C[Scan QR Code Peserta]
    C --> D[Kirim Request POST /api/tickets/check-in]
    D --> E[Kunci Baris Tiket: SELECT FOR UPDATE]
    
    E --> F{Tiket Ditemukan di DB?}
    F -- Tidak --> G[Catat Log: not_found]
    G --> H[HTTP 404: Tiket Tidak Dikenali]
    H --> I[Bunyikan Nada Error & Tampilan Merah]
    
    F -- Ya --> J{Verifikasi Signature HMAC Valid?}
    J -- Tidak --> K[Catat Log: invalid_signature]
    K --> L[HTTP 403: Tiket Palsu / Dimanipulasi]
    L --> I
    
    J -- Ya --> M{Status Tiket == 'checked_in'?}
    M -- Ya --> N[Catat Log: duplicate_rejected]
    N --> O[HTTP 409: Peringatan Tiket Sudah Pernah Dipakai]
    O --> P[Tampilkan Detail Waktu & Petugas Scan Pertama]
    P --> I
    
    M -- Tidak --> Q[Ubah Status Tiket: status = 'checked_in']
    Q --> R[Isi checked_in_at = NOW & checked_in_by = panitia_id]
    R --> S[Catat Log: scan_result = 'success']
    S --> T[Commit Transaksi PostgreSQL]
    T --> U[HTTP 200: Check-In Sukses!]
    U --> V[Bunyikan Nada Beep & Tampilan Hijau]
    V --> W([Selesai: Peserta Masuk Venue])
```

---

## 📊 Data Flow Diagram (DFD)

### DFD Level 0 (Context Diagram)

Diagram Konteks mendefinisikan batas sistem Evently dengan 4 entitas eksternal:

```mermaid
flowchart LR
    subgraph External_Entities[Entitas Luar]
        P[👤 Peserta]
        K[🛡️ Panitia Gatekeeper]
        A[👑 Admin Komunitas]
        M[💳 Midtrans Payment Gateway]
    end

    SYS((Sistem Evently Platform))

    P -- Data Akun, Pemesanan Tiket, Catatan --> SYS
    SYS -- Katalog Event, Token Bayar, E-Tiket QR Code --> P

    P -- Bayar Tagihan (QRIS / VA) --> M
    M -- Webhook Notifikasi Status Transaksi --> SYS
    SYS -- Request Snap Token & Parameter Order --> M

    K -- Pemindaian QR Tiket, Kode Tiket Manual --> SYS
    SYS -- Status Validasi, Feedback Audio, Log Riwayat --> K

    A -- Data Master Event, Kuota, Parameter Harga --> SYS
    SYS -- Laporan Kehadiran, Analitik Kuota, Audit Log --> A
```

---

### DFD Level 1 (Dekomposisi Proses)

```mermaid
flowchart TD
    P[👤 Peserta]
    K[🛡️ Panitia]
    A[👑 Admin]
    M[💳 Midtrans]

    D1[(D1: Users)]
    D2[(D2: Events)]
    D3[(D3: Registrations)]
    D4[(D4: Tickets)]
    D5[(D5: Check-In Logs)]

    subgraph Process_Decomposition[Proses Level 1]
        P1(1.0 Autentikasi & Profil)
        P2(2.0 Manajemen Katalog Event)
        P3(3.0 Transaksi & Pembayaran Tiket)
        P4(4.0 Penerbitan Tiket Kriptografis)
        P5(5.0 Validasi Check-In Gerbang)
        P6(6.0 Analitik & Audit Kehadiran)
    end

    %% Autentikasi
    P -->|Input Kredensial| P1
    K -->|Input Kredensial| P1
    A -->|Input Kredensial| P1
    P1 <-->|Validasi Hash Password| D1

    %% Event Management
    A -->|CRUD Event & Kuota| P2
    P2 <-->|Tulis / Baca Event| D2
    P2 -->|Tampilkan Katalog| P

    %% Transaksi & Midtrans
    P -->|Pesan Tiket| P3
    P3 <-->|Lock Kuota| D2
    P3 <-->|Snap Token & Settlement| M
    P3 -->|Simpan Registrasi| D3

    %% Penerbitan Tiket
    P3 -->|Data Terkonfirmasi| P4
    P4 -->|Sign HMAC-SHA256| P4
    P4 -->|Simpan E-Tiket| D4
    P4 -->|Kirim QR Pass| P

    %% Validasi Checkin
    K -->|Scan QR Tiket| P5
    P5 <-->|Lock Status Tiket| D4
    P5 -->|Simpan Log Scan| D5
    P5 -->|Hasil Validasi| K

    %% Analitik
    D3 --> P6
    D4 --> P6
    D5 --> P6
    P6 -->|Laporan Presensi & Kehadiran| A
```

---

## 🗄️ Entity Relationship Diagram (ERD)

Skema database relasional ternormalisasi (3NF) di atas PostgreSQL:

```mermaid
erDiagram
    USERS ||--o{ REGISTRATIONS : "membuat"
    USERS ||--o{ CHECK_IN_LOGS : "memindai"
    EVENTS ||--o{ REGISTRATIONS : "dimiliki"
    REGISTRATIONS ||--|| TICKETS : "menerbitkan"
    TICKETS ||--o{ CHECK_IN_LOGS : "dicatat_di"

    USERS {
        bigserial id PK
        string name "Nama Lengkap"
        string email UK "Email Pengguna Unik"
        string password "Hashed bcrypt"
        string role "admin | committee | participant"
        string phone "Nomor Telepon"
        string organization "Asal Kampus / Instansi"
        timestamp created_at
        timestamp updated_at
    }

    EVENTS {
        bigserial id PK
        string title "Judul Event"
        string slug UK "Slug SEO Unik"
        text description "Deskripsi Lengkap"
        string category "Conference | Workshop | Hackathon"
        string location "Lokasi / Gedung"
        timestamp event_date "Waktu Pelaksanaan"
        timestamp end_date "Waktu Selesai"
        integer quota "Kapasitas Maksimal"
        integer registered_count "Jumlah Terdaftar"
        unsigned_integer price "Harga Tiket (0 = Gratis)"
        string banner_url "URL Gambar Banner"
        string speaker_name "Nama Pembicara"
        string speaker_role "Jabatan Pembicara"
        boolean is_published "Status Tayang"
        timestamp created_at
        timestamp updated_at
    }

    REGISTRATIONS {
        bigserial id PK
        bigint event_id FK "Relasi ke events.id"
        bigint user_id FK "Relasi ke users.id"
        string registration_code UK "Kode Registrasi Unik"
        string status "confirmed | cancelled"
        string payment_status "free | pending | paid"
        string payment_method "qris | bank_transfer | free"
        unsigned_integer amount_paid "Total Bayar"
        text notes "Catatan Peserta"
        timestamp registered_at
        timestamp created_at
        timestamp updated_at
    }

    TICKETS {
        bigserial id PK
        bigint registration_id FK, UK "1-to-1 dengan registrasi"
        string ticket_code UK "Kode Tiket Unik (TKT-xxx)"
        text qr_payload "JSON Data Payload"
        string hmac_signature "HMAC-SHA256 Signature"
        string status "issued | checked_in | revoked"
        timestamp checked_in_at "Waktu Presensi"
        bigint checked_in_by FK "ID Panitia yang Scan"
        timestamp created_at
        timestamp updated_at
    }

    CHECK_IN_LOGS {
        bigserial id PK
        bigint ticket_id FK "Relasi ke tickets.id"
        bigint scanned_by FK "Relasi ke users.id"
        string scan_result "success | duplicate_rejected | invalid"
        string ip_address "IP Address Terminal"
        string device_info "Informasi Perangkat Gate"
        text notes "Keterangan Tambahan"
        timestamp created_at
    }
```

---

## 🛡️ Keunggulan Rekayasa Sistem (Engineering Highlights)

### 1. Zero Overselling via Pessimistic Row Locking
Pada saat flash sale pendaftaran tiket event populer, ribuan request masuk secara bersamaan. Pendekatan konvensional (`if ($event->registered_count < $event->quota)`) rentan mengalami **Race Condition** (*Phantom Read*), di mana kuota 100 bisa terjual menjadi 105 tiket.

Evently mengatasi hal ini dengan transaksi database terisolasi:
```php
DB::transaction(function () use ($eventId, $userId) {
    // Kunci baris event secara eksklusif di PostgreSQL hingga transaksi commit
    $event = Event::where('id', $eventId)->lockForUpdate()->firstOrFail();

    if ($event->registered_count >= $event->quota) {
        throw new \Exception('Maaf, kuota tiket untuk event ini telah habis.', 422);
    }

    $event->increment('registered_count');
    // Penerbitan registrasi & tiket secara atomik
});
```

### 2. Pencegahan Duplicate Check-In yang Aman
Di gerbang masuk dengan beberapa pintu scanner berbeda, dua peserta tidak dapat menggunakan tangkapan layar tiket yang sama:
```php
DB::transaction(function () use ($ticketCode, $committeeId) {
    $ticket = Ticket::where('ticket_code', $ticketCode)->lockForUpdate()->first();

    if ($ticket->status === 'checked_in') {
        CheckInLog::create([
            'ticket_id' => $ticket->id,
            'scanned_by' => $committeeId,
            'scan_result' => 'duplicate_rejected',
            'notes' => 'Peringatan: Tiket ganda terdeteksi!'
        ]);
        return response()->json(['message' => 'Tiket sudah pernah digunakan.'], 409);
    }

    $ticket->update([
        'status' => 'checked_in',
        'checked_in_at' => now(),
        'checked_in_by' => $committeeId
    ]);
});
```

### 3. Tanda Tangan Kriptografi HMAC-SHA256
Setiap tiket ditandatangani secara kriptografis menggunakan `hash_hmac('sha256', $payloadData, $appKey)`. Jika seseorang berusaha mengubah nama atau event ID di dalam QR Code secara ilegal, tanda tangan digital tidak akan cocok dan tiket otomatis ditolak oleh scanner terminal.

---

## 📡 Daftar Endpoint REST API

| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Publik | Mendaftarkan akun peserta baru |
| `POST` | `/api/auth/login` | Publik | Otentikasi dan penerbitan Sanctum Token |
| `GET` | `/api/auth/me` | Logged In | Mengambil profil user & ringkasan pendaftaran |
| `POST` | `/api/auth/logout` | Logged In | Menghapus token otentikasi aktif |
| `GET` | `/api/events` | Publik | Mengambil katalog event (Filter search, category) |
| `GET` | `/api/events/{slug}` | Publik | Detail event lengkap beserta ketersediaan kuota |
| `POST` | `/api/events/{id}/register` | Peserta | Mendaftar tiket event (Free / Paid) |
| `POST` | `/api/payment/snap-token` | Peserta | Membuat token transaksi Midtrans Snap |
| `POST` | `/api/payment/finish` | Peserta | Konfirmasi dan penerbitan tiket pasca bayar |
| `GET` | `/api/tickets/my-tickets` | Peserta | Mengambil seluruh tiket digital milik user |
| `GET` | `/api/tickets/{code}` | Logged In | Mengambil payload QR Code & status tiket |
| `POST` | `/api/tickets/check-in` | Panitia/Admin | Validasi pemindaian tiket di pintu masuk |
| `GET` | `/api/admin/overview` | Admin | Statistik global pendaftar, hadir, dan rasio |
| `POST` | `/api/admin/events` | Admin | Membuat event baru |
| `PUT` | `/api/admin/events/{id}` | Admin | Memperbarui informasi & kuota event |
| `DELETE` | `/api/admin/events/{id}` | Admin | Menghapus data event |

---

## 👨‍💻 Pengembang & Kontributor

* **Nama Pengembang**: Arfian Putra Pratama
* **Email**: `arfian.23001@mhs.unesa.ac.id` / `pianprams3@gmail.com`
* **Proyek**: Technical Assessment Developer Team — Komunitas SurabayaDev
* **Lisensi**: MIT License
