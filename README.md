# Evently — SurabayaDev 12th Anniversary Event Platform

> **SurabayaDev Volunteer Developer Team Technical Assessment**  
> Dibuat dengan stack: **React 19 + TypeScript + Vite + Tailwind CSS + Laravel 11 (PHP 8.4) + PostgreSQL 18 + REST API**.

---

## Ringkasan Proyek

**Evently** adalah platform manajemen event dan penerbitan tiket digital modern yang dirancang khusus untuk menangani skenario beban tinggi (3.000 pengunjung konkuren & 1.000 registrasi serentak) tanpa risiko *overselling* kuota (bebas *race condition*) serta pencegahan *duplicate check-in* atomik di gerbang masuk acara SurabayaDev 12th Anniversary.

### Keunggulan Rekayasa Sistem (Engineering Highlights):
1. **Penanganan Kuota Bebas Race Condition**: Menggunakan PostgreSQL *Pessimistic Row Locking* (`SELECT ... FOR UPDATE`) dalam `DB::transaction()` untuk menjamin integritas transaksi atomik saat 1.000 user mendaftar serentak.
2. **Pencegahan Duplicate Check-In**: Transisi status atomik tiket dari `issued` ke `checked_in` dengan conditional lock. Upaya scan kedua akan langsung ditolak dengan kode status HTTP `409 Conflict` dan mencatat data audit log lengkap.
3. **Tiket Digital Kriptografis**: Setiap tiket diterbitkan dengan QR Code berisikan tanda tangan digital **HMAC-SHA256** untuk memvalidasi keaslian tiket dari pemalsuan.
4. **Antarmuka Premium & Reaktif**: Dikembangkan menggunakan React 19, TypeScript yang ketat (*type-safe*), styling Tailwind CSS bernuansa dark glassmorphism modern, audio-visual feedback scanner, dan quick role switcher untuk mempermudah reviewer.

---

## Panduan Menjalankan Aplikasi di Terminal

Aplikasi terdiri dari 3 komponen: **PostgreSQL**, **Laravel Backend API**, dan **React Frontend**.

### 1. Database PostgreSQL
Database cluster khusus telah disiapkan di folder `d:\Evently\pgdata` dan berjalan pada port **5433**:
```powershell
# Menjalankan PostgreSQL Server (jika belum berjalan)
"C:\laragon\bin\postgresql\pgsql\bin\postgres.exe" -D d:\Evently\pgdata
```
> Database: `evently_db` | User: `postgres` | Port: `5433` | Host: `127.0.0.1`

---

### 2. Menjalankan Backend (Laravel 11 REST API)
Buka terminal baru di folder `d:\Evently\backend`:
```powershell
cd d:\Evently\backend

# Jalankan server API pada port 8080 (agar tidak bentrok dengan port 8000)
php artisan serve --host=127.0.0.1 --port=8080
```
> API aktif di: **`http://127.0.0.1:8080/api`**  
> *Catatan*: Jika ingin melakukan reset database dan seeder ulang kapan saja, jalankan:
> ```powershell
> php artisan migrate:fresh --seed
> ```

---

### 3. Menjalankan Frontend (React + TypeScript + Vite)
Buka terminal baru di folder `d:\Evently\frontend`:
```powershell
cd d:\Evently\frontend

# Jalankan Vite Development Server
npm run dev
```
> Buka browser di: **`http://localhost:5177/`** (atau port yang tertera pada output terminal Anda).

---

## Akun Demo Siap Pakai (Untuk Kemudahan Reviewer)

Untuk kenyamanan pengujian, di pojok kanan atas Navbar telah disediakan tombol **"Role: Peserta | Panitia | Admin"** yang memungkinkan perpindahan role secara instan dengan satu kali klik tanpa harus mengetik password manual.

| Role | Email | Password | Akses & Fitur |
| :--- | :--- | :--- | :--- |
| **Peserta** | `peserta@surabayadev.org` | `password` | Katalog Event, Registrasi Tiket, Dompet Tiket Digital (QR Pass) |
| **Panitia** | `panitia@surabayadev.org` | `password` | Terminal Gatekeeper, Pemindai QR/Input Tiket, Deteksi Tiket Ganda |
| **Admin** | `admin@surabayadev.org` | `password` | CRUD Event, Atur Kuota, Monitor Kehadiran Peserta, Statistik Real-Time |

---

## Daftar Endpoint REST API

| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Publik | Registrasi akun peserta baru |
| `POST` | `/api/auth/login` | Publik | Login & mendapatkan Sanctum Bearer Token |
| `GET` | `/api/auth/me` | Logged In | Profil akun & jumlah pendaftaran |
| `POST` | `/api/auth/logout` | Logged In | Revoke token aktif |
| `GET` | `/api/events` | Publik | List event aktif (dengan query `search` & `category`) |
| `GET` | `/api/events/{idOrSlug}` | Publik | Detail event & status pendaftaran user aktif |
| `POST` | `/api/registrations` | Peserta | Pendaftaran event (Pessimistic lock quota) |
| `GET` | `/api/my-tickets` | Peserta | Dompet tiket digital terdaftar milik user |
| `GET` | `/api/tickets/verify/{code}`| Publik | Verifikasi status tiket & data pas digital |
| `POST` | `/api/check-in` | Panitia/Admin | Validasi tiket di pintu masuk & tolak tiket duplikat |
| `GET` | `/api/check-in/logs` | Panitia/Admin | Log audit riwayat pemindaian tiket secara real-time |
| `GET` | `/api/admin/dashboard` | Admin | Ringkasan metrik platform & agregat check-in rate |
| `POST` | `/api/admin/events` | Admin | Membuat event baru beserta kuota |
| `PUT` | `/api/admin/events/{id}` | Admin | Memperbarui data event & kuota |
| `DELETE`| `/api/admin/events/{id}`| Admin | Menghapus event |
| `GET` | `/api/admin/events/{id}/attendees` | Admin | Data seluruh peserta terdaftar di event tertentu |

---

## PART 1: TECHNICAL CASE STUDY

### 1. System Analysis
- **Kebutuhan Fungsional**:
  - *Peserta*: Menjelajahi katalog event, mencari event berbasis teks/kategori, melihat kuota tersisa secara real-time, mendaftar event, dan menerima tiket digital ber-QR Code dengan tanda tangan kriptografis.
  - *Panitia (Gatekeeper)*: Memindai QR Code tiket di gerbang masuk via kamera/input manual, memverifikasi keabsahan tiket, mendapatkan feedback status instan (berhasil / ditolak / tiket ganda), dan melihat log pemindaian.
  - *Admin*: Mengelola data event (CRUD), memantau jumlah peserta terdaftar, memantau kehadiran aktual (*attendance rate*), serta mengekspor data peserta.
- **Kebutuhan Non-Fungsional**:
  - *High Concurrency*: Mampu melayani 3.000 user aktif bersamaan dan 1.000 user yang menekan tombol registrasi serentak (*flash-crowd event*).
  - *Data Consistency & Zero Overselling*: Kuota tiket bersifat *hard limit*, tidak boleh terjadi kondisi tiket terjual melebihi kapasitas (*race condition*).
  - *Security & Anti-Fraud*: Tiket memiliki tanda tangan digital HMAC-SHA256 untuk mencegah pemalsuan QR Code.
- **Pembagian Tanggung Jawab**:
  - *Frontend*: Validasi input instan (*client-side*), *debounced search*, manajemen state reaktif, rendering QR Code SVG dinamis, *optimistic UI feedback*, dan integrasi audio scanner.
  - *Backend*: Autentikasi berbasis token (Laravel Sanctum), *middleware role-based authorization*, eksekusi transaksi basis data dengan *pessimistic row locking*, pembuatan hash kriptografis, pencatatan log audit, serta rate limiting API.

### 2. Frontend Perspective
- **Teknologi**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + `qrcode.react` + `canvas-confetti`.
- **Struktur Komponen (Atomic Design)**:
  - *Atoms*: Button, Badge, Input, ProgressBar, StatusPill.
  - *Molecules*: SearchBar, QuotaIndicator, EventMetadata, AttendeeRow.
  - *Organisms*: EventCard, EventDetailModal, RegistrationModal, TicketPassModal, CommitteeTerminal, AdminDashboard.
  - *Templates/Views*: CatalogView, MyTicketsView, GateScannerView, AdminConsole.
- **State Management**: Scoped React Context (`AuthContext`) untuk autentikasi global & token sync, didukung Fetch/Axios API service layer dengan caching lokal pada LocalStorage.
- **Strategi Menjaga Performa**:
  - *Debouncing* pada input pencarian (300ms) untuk mengurangi frekuensi HTTP request ke backend.
  - *Code Splitting* dan *tree shaking* via Vite bundler (menghasilkan bundle ringkas gzipped ~77kB).
  - Indikator *skeleton loading* & transisi CSS yang memanfaatkan GPU (*hardware acceleration*).
  - Optimasi aset gambar dengan *lazy-loading* dan format modern.

### 3. Backend Perspective
- **Desain Basis Data**: Skema relasional ter-normalisasi pada PostgreSQL 18:
  - Tabel `users` (id, name, email, password, role, phone, organization).
  - Tabel `events` (id, title, slug, description, category, location, event_date, quota, registered_count, banner_url, is_published).
  - Tabel `registrations` (id, event_id, user_id, registration_code, status, registered_at) dengan **Unique Index pada `(event_id, user_id)`** untuk mencegah user mendaftar ganda di event yang sama.
  - Tabel `tickets` (id, registration_id, ticket_code, qr_payload, hmac_signature, status, checked_in_at, checked_in_by) dengan **Unique Index pada `ticket_code`**.
  - Tabel `check_in_logs` (id, ticket_id, scanned_by, scan_result, ip_address, device_info, notes, created_at).
- **Pengelolaan Kuota & Anti Race Condition**:
  - Menggunakan transaksi `DB::transaction()` dipadukan dengan *pessimistic row locking* `Event::where('id', $id)->lockForUpdate()->first()`.
  - Ketika 1.000 request datang bersamaan, PostgreSQL mengunci baris event tersebut secara serial, memverifikasi `registered_count < quota`, dan menaikkan nilai `registered_count`. Request yang tiba saat kuota telah habis akan langsung menerima respons HTTP 422 secara aman.
- **Pencegahan Duplicate Check-In**:
  - Pengecekan status atomik pada level database: `Ticket::where('ticket_code', $code)->lockForUpdate()->first()`.
  - Jika tiket berstatus `checked_in`, sistem segera membatalkan operasi, mencatat riwayat pelanggaran ke `check_in_logs` (`duplicate_rejected`), dan mengembalikan HTTP 409 Conflict lengkap dengan informasi waktu pertama kali check-in dilakukan.

### 4. Technical Decision
- **Bagian Tersulit Sistem**:
  1. *Spike Traffic & Inventory Contention*: 1.000 user yang melakukan checkout/registrasi pada detik yang sama dapat menyebabkan *deadlock* atau *race condition* jika tidak dikelola dengan benar.
  2. *Gatekeeper Double-Scan Hazard*: Dua panitia di gerbang yang berbeda memindai tiket yang sama (misal foto QR yang dibagikan ke teman) dalam selang waktu milidetik.
- **Solusi Teknis yang Dipilih**:
  - Memilih **PostgreSQL Pessimistic Locking (`lockForUpdate`)** daripada optimasi *optimistic concurrency control (OCC)* karena pada perebutan tiket terbatas (*high write-contention*), OCC sering memicu lonjakan kegagalan *retry* yang membebani CPU database.
  - Menghubungkan setiap tiket dengan tanda tangan **HMAC-SHA256** berbasis `APP_KEY` server, sehingga panitia dapat mendeteksi tiket palsu secara instan sebelum melakukan query database.

---

## PART 3: COMMUNITY COMMITMENT

### 1. Alasan Tertarik Bergabung dengan SurabayaDev
SurabayaDev adalah pionir dan jangkar ekosistem teknologi di Jawa Timur selama 12 tahun terakhir. Komitmen konsisten komunitas dalam mengadakan sharing session, workshop, dan mentoring telah menginspirasi ribuan developer muda. Bergabung sebagai volunteer Divisi Developer Team adalah wujud dedikasi saya untuk berkontribusi langsung pada infrastruktur digital komunitas, berkolaborasi dengan talenta terbaik, dan memajukan ekosistem software engineering di Kota Surabaya.

### 2. Rencana Kontribusi untuk Komunitas Developer di Surabaya
- **Pengembangan Platform Digital Komunitas**: Membantu memelihara, memodernisasi, dan mengembangkan platform internal SurabayaDev (website, registrasi event, bot interaktif) menggunakan stack modern.
- **Mentorship & Knowledge Sharing**: Berbagi pengetahuan seputar best practices rekayasa software (Full-Stack Architecture, TypeScript, API Design, System Scalability, dan Autonomous Agents) melalui tech talk maupun artikel teknis komunitas.
- **Inisiatif Open Source Lokal**: Membantu menginisiasi dan me-maintain repositori open source SurabayaDev agar dapat menjadi wadah kontribusi nyata bagi developer pemula di Surabaya.

### 3. Manajemen Waktu (Komunitas vs Pekerjaan/Kuliah vs Personal)
Saya menerapkan prinsip **Time-Boxing** dan **Matriks Eisenhower**:
- *Prioritas Utama*: Jam kerja/kuliah formal dipisahkan secara disiplin pada jam operasional harian.
- *Dedikasi Komunitas*: Mengalokasikan blok waktu khusus (misal 6–10 jam per minggu di malam hari dan akhir pekan) yang konsisten untuk tugas komunitas.
- *Async-First Collaboration*: Mengutamakan dokumentasi yang jelas, task board (GitHub Projects / Trello), dan komunikasi asinkron yang efektif sehingga progres tugas tidak saling memblokir dan fleksibel diselesaikan sesuai target milestone.

### 4. Komitmen Pasca SurabayaDev 12th Anniversary
**Ya, saya berkomitmen penuh untuk tetap aktif.** Perayaan 12 tahun adalah momentum awal. Pasca anniversary, saya bersedia:
- Berperan aktif sebagai *core maintainer* repositori digital SurabayaDev.
- Menjadi bagian dari komite kurikulum teknis untuk meetup dan workshop berkala SurabayaDev.
- Membimbing (*onboarding mentor*) bagi volunteer generasi berikutnya untuk menjaga regenerasi komunitas tetap hidup dan berkualitas.

### 5. Pengalaman Bekerja dalam Tim Komunitas / Organisasi / Open Source
Saya memiliki pengalaman berkolaborasi dalam tim pengembang perangkat lunak, mengelola branching strategy Git (GitHub Flow / PR reviews), berpartisipasi dalam diskusi arsitektur, dan menyelesaikan *merge conflict*. Pengalaman ini mengajarkan bahwa keberhasilan proyek komunitas tidak hanya bertumpu pada kemampuan coding, melainkan pada **empati, kejelasan komunikasi, transparansi progres, serta kerendahan hati untuk saling belajar (*peer-review*)**.
