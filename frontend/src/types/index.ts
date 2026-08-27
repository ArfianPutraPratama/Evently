export type UserRole = 'admin' | 'committee' | 'participant';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  created_at?: string;
}

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  location: string;
  event_date: string;
  end_date?: string;
  quota: number;
  price: number;
  registered_count: number;
  remaining_quota: number;
  is_sold_out: boolean;
  banner_url?: string;
  speaker_name?: string;
  speaker_role?: string;
  is_published: boolean;
  is_user_registered?: boolean;
  user_registration?: Registration;
  created_at?: string;
}

export interface Ticket {
  id: number;
  registration_id: number;
  ticket_code: string;
  qr_payload: string;
  hmac_signature: string;
  status: 'issued' | 'checked_in' | 'voided';
  checked_in_at?: string;
  checked_in_by?: number;
  validator?: User;
  registration?: Registration;
}

export interface Registration {
  id: number;
  event_id: number;
  user_id: number;
  registration_code: string;
  status: 'confirmed' | 'cancelled';
  payment_status?: 'free' | 'paid' | 'pending';
  payment_method?: string;
  amount_paid?: number;
  notes?: string;
  registered_at: string;
  event?: EventItem;
  user?: User;
  ticket?: Ticket;
}

export interface CheckInLog {
  id: number;
  ticket_id: number;
  scanned_by?: number;
  scan_result: 'success' | 'duplicate_rejected' | 'invalid_ticket';
  ip_address?: string;
  device_info?: string;
  notes?: string;
  created_at: string;
  ticket?: Ticket;
  scanner?: User;
  validator?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  remaining_quota?: number;
  scan_result?: string;
}

export interface DashboardMetrics {
  total_events: number;
  total_quota: number;
  total_registrations: number;
  total_checked_in: number;
  total_issued: number;
  check_in_rate: number;
  total_revenue?: number;
}
