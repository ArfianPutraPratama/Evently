import { ApiResponse, CheckInLog, DashboardMetrics, EventItem, Registration, Ticket, User } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://${window.location.hostname}:8080/api`
        : '/api')
    : 'http://127.0.0.1:8080/api');

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('evently_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('evently_token', token);
    } else {
      localStorage.removeItem('evently_token');
    }
  }

  public getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('evently_token');
    }
    return this.token;
  }

  public getUser(): User | null {
    try {
      const stored = localStorage.getItem('evently_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  public saveUser(user: User | null) {
    if (user) {
      localStorage.setItem('evently_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('evently_user');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.message || `Request failed with status ${response.status}`;
      const error: any = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  }

  // --- Auth APIs ---
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await this.request<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data!;
  }

  async register(data: { name: string; email: string; password: string; password_confirmation: string; phone?: string; organization?: string }) {
    const res = await this.request<ApiResponse<{ user: User; token: string }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data!;
  }

  async getMe(): Promise<{ user: User; registrations_count: number }> {
    const res = await this.request<ApiResponse<{ user: User; registrations_count: number }>>('/auth/me');
    return res.data!;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // --- Event APIs ---
  async getEvents(search = '', category = ''): Promise<{ events: EventItem[]; categories: string[]; total: number }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'all') params.append('category', category);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<ApiResponse<{ events: EventItem[]; categories: string[]; total: number }>>(`/events${query}`);
    return res.data || { events: [], categories: [], total: 0 };
  }

  async getEvent(idOrSlug: string | number): Promise<EventItem> {
    const res = await this.request<ApiResponse<EventItem>>(`/events/${idOrSlug}`);
    return res.data!;
  }

  // --- Registration & Ticket APIs ---
  async registerEvent(eventId: number, notes?: string, paymentMethod?: string): Promise<{ registration: Registration; ticket: Ticket; event: EventItem }> {
    const res = await this.request<ApiResponse<{ registration: Registration; ticket: Ticket; event: EventItem }>>('/registrations', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, notes, payment_method: paymentMethod }),
    });
    return res.data!;
  }

  async createSnapToken(eventId: number): Promise<{ snap_token: string; order_id: string; client_key: string }> {
    const res = await this.request<ApiResponse<{ snap_token: string; order_id: string; client_key: string }>>('/payment/snap-token', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId }),
    });
    return res.data!;
  }

  async finishMidtransPayment(eventId: number, orderId: string, paymentType?: string, transactionStatus?: string, notes?: string): Promise<{ registration: Registration; ticket: Ticket }> {
    const res = await this.request<ApiResponse<{ registration: Registration; ticket: Ticket }>>('/payment/finish', {
      method: 'POST',
      body: JSON.stringify({
        event_id: eventId,
        order_id: orderId,
        payment_type: paymentType,
        transaction_status: transactionStatus,
        notes,
      }),
    });
    return res.data!;
  }

  async getMyTickets(): Promise<Registration[]> {
    const res = await this.request<ApiResponse<Registration[]>>('/my-tickets');
    return res.data || [];
  }

  async getTicketDetail(ticketCode: string): Promise<Ticket> {
    const res = await this.request<ApiResponse<Ticket>>(`/tickets/verify/${ticketCode}`);
    return res.data!;
  }

  // --- Committee Check-in APIs ---
  async checkIn(ticketCode?: string, qrPayload?: string): Promise<ApiResponse> {
    return await this.request<ApiResponse>('/check-in', {
      method: 'POST',
      body: JSON.stringify({ ticket_code: ticketCode, qr_payload: qrPayload }),
    });
  }

  async getCheckInLogs(): Promise<CheckInLog[]> {
    const res = await this.request<ApiResponse<CheckInLog[]>>('/check-in/logs');
    return res.data || [];
  }

  async getGateStats(): Promise<{
    total_registered: number;
    total_checked_in: number;
    total_waiting: number;
    check_in_rate: number;
    events: { id: number; title: string; registered_count: number; quota: number; checked_in_count: number }[];
  }> {
    const res = await this.request<ApiResponse<any>>('/check-in/stats');
    return res.data || { total_registered: 0, total_checked_in: 0, total_waiting: 0, check_in_rate: 0, events: [] };
  }

  async searchGateAttendees(search = '', eventId = ''): Promise<Registration[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (eventId && eventId !== 'all') params.append('event_id', eventId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<ApiResponse<Registration[]>>(`/check-in/attendees${query}`);
    return res.data || [];
  }

  // --- Admin APIs ---
  async getAdminDashboard(): Promise<{ metrics: DashboardMetrics; events_summary: any[] }> {
    const res = await this.request<ApiResponse<{ metrics: DashboardMetrics; events_summary: any[] }>>('/admin/dashboard');
    return res.data!;
  }

  async getEventAttendees(eventId: number, search = '', status = ''): Promise<{ event: EventItem; attendees: Registration[]; total: number }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<ApiResponse<{ event: EventItem; attendees: Registration[]; total: number }>>(`/admin/events/${eventId}/attendees${query}`);
    return res.data!;
  }

  async createEvent(eventData: Partial<EventItem>): Promise<EventItem> {
    const res = await this.request<ApiResponse<EventItem>>('/admin/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return res.data!;
  }

  async updateEvent(id: number, eventData: Partial<EventItem>): Promise<EventItem> {
    const res = await this.request<ApiResponse<EventItem>>(`/admin/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
    return res.data!;
  }

  async deleteEvent(id: number): Promise<void> {
    await this.request(`/admin/events/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
