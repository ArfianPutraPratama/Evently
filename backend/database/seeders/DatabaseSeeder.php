<?php

namespace Database\Seeders;

use App\Models\CheckInLog;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Core Users
        $admin = User::create([
            'name' => 'Admin SurabayaDev',
            'email' => 'admin@surabayadev.org',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '+6281234567890',
            'organization' => 'SurabayaDev Core Team',
        ]);

        $committee = User::create([
            'name' => 'Panitia Gatekeeper',
            'email' => 'panitia@surabayadev.org',
            'password' => Hash::make('password'),
            'role' => 'committee',
            'phone' => '+6281298765432',
            'organization' => 'SurabayaDev Event Committee',
        ]);

        $budi = User::create([
            'name' => 'Budi Developer',
            'email' => 'peserta@surabayadev.org',
            'password' => Hash::make('password'),
            'role' => 'participant',
            'phone' => '+6285712345678',
            'organization' => 'Institut Teknologi Sepuluh Nopember',
        ]);

        $siti = User::create([
            'name' => 'Siti Nurhaliza',
            'email' => 'siti@example.com',
            'password' => Hash::make('password'),
            'role' => 'participant',
            'phone' => '+6281399887766',
            'organization' => 'Universitas Airlangga',
        ]);

        // 2. Create Events
        $conference = Event::create([
            'title' => 'SurabayaDev 12th Anniversary: Tech Summit & Community Gathering',
            'slug' => 'surabayadev-12th-anniversary-tech-summit-2026',
            'description' => 'Perayaan 12 tahun perjalanan komunitas SurabayaDev! Menghadirkan 8 pembicara industri terkemuka, diskusi panel perkembangan ekosistem startup Jawa Timur, tech showcase, dan sesi networking terbesar di Surabaya. Dapatkan merchandise eksklusif dan kesempatan mentoring karir.',
            'category' => 'Conference',
            'location' => 'Dyandra Convention Center, Jl. Basuki Rahmat No. 93-105, Surabaya',
            'event_date' => '2026-09-12 08:30:00',
            'end_date' => '2026-09-12 17:00:00',
            'quota' => 500,
            'registered_count' => 0,
            'banner_url' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
            'speaker_name' => 'Pratama Wijaya (GDE) & Surya Kusuma (VP Engineering)',
            'speaker_role' => 'Keynote Speakers',
            'is_published' => true,
        ]);

        $microservices = Event::create([
            'title' => 'Deep Dive Workshop: Resilient Distributed Systems with Go & Apache Kafka',
            'slug' => 'workshop-distributed-systems-go-kafka',
            'description' => 'Sesi hands-on intensif 4 jam merancang sistem backend yang tahan banting (fault-tolerant) di bawah beban 50.000 RPS. Topik mencakup event sourcing, idempotent consumer, dead-letter queue, dan distributed tracing.',
            'category' => 'Workshop',
            'location' => 'Koridor Co-Working Space, Gd. Siola Lt. 3, Jl. Tunjungan, Surabaya',
            'event_date' => '2026-09-19 13:00:00',
            'end_date' => '2026-09-19 17:00:00',
            'quota' => 45,
            'registered_count' => 0,
            'banner_url' => 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
            'speaker_name' => 'Ahmad Rizky Santoso',
            'speaker_role' => 'Principal Backend Engineer',
            'is_published' => true,
        ]);

        $aiHackathon = Event::create([
            'title' => 'Surabaya Generative AI & Autonomous Agent Hackathon 2026',
            'slug' => 'surabaya-gen-ai-agent-hackathon-2026',
            'description' => 'Kompetisi hackathon 24 jam membangun solusi berbasis LLM dan Autonomous Agent untuk memecahkan persoalan kota Surabaya (smart mobility, pelayanan publik, dan UMKM digital). Total hadiah Rp 35.000.000 + Cloud Credits.',
            'category' => 'Hackathon',
            'location' => 'DILo Surabaya / Suara Surabaya Media Hall, Surabaya',
            'event_date' => '2026-10-03 09:00:00',
            'end_date' => '2026-10-04 15:00:00',
            'quota' => 120,
            'registered_count' => 0,
            'banner_url' => 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
            'speaker_name' => 'SurabayaDev AI Chapter Leads',
            'speaker_role' => 'Mentors & Judges',
            'is_published' => true,
        ]);

        $webMasterclass = Event::create([
            'title' => 'Modern Full-Stack Mastery: React 19, TypeScript & High-Performance Laravel',
            'slug' => 'modern-fullstack-masterclass-react-laravel',
            'description' => 'Pelajari arsitektur full-stack modern mulai dari optimasi SSR/SSG, manajemen state server, TypeScript generic types yang ketat, database locking di PostgreSQL, hingga containerization siap cloud.',
            'category' => 'Masterclass',
            'location' => 'Auditorium Gedung Research Center ITS, Kampus ITS Sukolilo, Surabaya',
            'event_date' => '2026-10-17 10:00:00',
            'end_date' => '2026-10-17 16:00:00',
            'quota' => 80,
            'registered_count' => 0,
            'price' => 150000,
            'banner_url' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
            'speaker_name' => 'Rendra Pratama',
            'speaker_role' => 'Full-Stack Solution Architect',
            'is_published' => true,
        ]);

        // 3. Register Budi to the Conference & Generate Digital Ticket
        $regCode = 'REG-SBYDEV12-' . strtoupper(Str::random(6));
        $ticketCode = 'TKT-12TH-' . strtoupper(Str::random(8));
        $secretKey = config('app.key', 'surabayadev12secret');
        $payloadData = [
            'ticket_code' => $ticketCode,
            'event_id' => $conference->id,
            'user_id' => $budi->id,
            'event_title' => $conference->title,
            'issued_at' => now()->toISOString(),
        ];
        $hmac = hash_hmac('sha256', json_encode($payloadData), $secretKey);

        $regBudi = Registration::create([
            'event_id' => $conference->id,
            'user_id' => $budi->id,
            'registration_code' => $regCode,
            'status' => 'confirmed',
            'notes' => 'Early bird registrant - SurabayaDev Enthusiast',
            'registered_at' => now()->subHours(2),
        ]);

        $ticketBudi = Ticket::create([
            'registration_id' => $regBudi->id,
            'ticket_code' => $ticketCode,
            'qr_payload' => json_encode(array_merge($payloadData, ['hmac' => $hmac])),
            'hmac_signature' => $hmac,
            'status' => 'issued',
        ]);

        // 4. Register Siti to the Conference and simulate ALREADY CHECKED IN (for testing duplicate detection!)
        $regCodeSiti = 'REG-SBYDEV12-' . strtoupper(Str::random(6));
        $ticketCodeSiti = 'TKT-12TH-CHECKED';
        $payloadDataSiti = [
            'ticket_code' => $ticketCodeSiti,
            'event_id' => $conference->id,
            'user_id' => $siti->id,
            'event_title' => $conference->title,
            'issued_at' => now()->subHours(3)->toISOString(),
        ];
        $hmacSiti = hash_hmac('sha256', json_encode($payloadDataSiti), $secretKey);

        $regSiti = Registration::create([
            'event_id' => $conference->id,
            'user_id' => $siti->id,
            'registration_code' => $regCodeSiti,
            'status' => 'confirmed',
            'registered_at' => now()->subHours(3),
        ]);

        $ticketSiti = Ticket::create([
            'registration_id' => $regSiti->id,
            'ticket_code' => $ticketCodeSiti,
            'qr_payload' => json_encode(array_merge($payloadDataSiti, ['hmac' => $hmacSiti])),
            'hmac_signature' => $hmacSiti,
            'status' => 'checked_in',
            'checked_in_at' => now()->subMinutes(25),
            'checked_in_by' => $committee->id,
        ]);

        CheckInLog::create([
            'ticket_id' => $ticketSiti->id,
            'scanned_by' => $committee->id,
            'scan_result' => 'success',
            'ip_address' => '127.0.0.1',
            'device_info' => 'Gate Terminal #1 - Dyandra Hall A',
            'notes' => 'Initial valid check-in',
            'created_at' => now()->subMinutes(25),
        ]);

        // 5. Register Budi to the VIP Masterclass (Paid Ticket via QRIS)
        $regCodeVip = 'REG-VIP-' . strtoupper(Str::random(6));
        $ticketCodeVip = 'TKT-VIP-' . strtoupper(Str::random(8));
        $payloadDataVip = [
            'ticket_code' => $ticketCodeVip,
            'event_id' => $webMasterclass->id,
            'user_id' => $budi->id,
            'event_title' => $webMasterclass->title,
            'issued_at' => now()->subHour()->toISOString(),
        ];
        $hmacVip = hash_hmac('sha256', json_encode($payloadDataVip), $secretKey);

        $regVip = Registration::create([
            'event_id' => $webMasterclass->id,
            'user_id' => $budi->id,
            'registration_code' => $regCodeVip,
            'status' => 'confirmed',
            'notes' => 'VIP Seat - Fullstack Workshop participant',
            'registered_at' => now()->subHour(),
            'payment_status' => 'paid',
            'payment_method' => 'qris',
            'amount_paid' => 150000,
        ]);

        $ticketVip = Ticket::create([
            'registration_id' => $regVip->id,
            'ticket_code' => $ticketCodeVip,
            'qr_payload' => json_encode(array_merge($payloadDataVip, ['hmac' => $hmacVip])),
            'hmac_signature' => $hmacVip,
            'status' => 'checked_in',
            'checked_in_at' => now()->subMinutes(10),
            'checked_in_by' => $committee->id,
        ]);

        CheckInLog::create([
            'ticket_id' => $ticketVip->id,
            'scanned_by' => $committee->id,
            'scan_result' => 'success',
            'ip_address' => '127.0.0.1',
            'device_info' => 'VIP Desk Terminal #1',
            'notes' => 'VIP ticket verified and checked in',
            'created_at' => now()->subMinutes(10),
        ]);

        // Update registered counts
        $conference->update(['registered_count' => 2]);
        $microservices->update(['registered_count' => 12]);
        $aiHackathon->update(['registered_count' => 45]);
        $webMasterclass->update(['registered_count' => 29]);
    }
}
