export type UserRole = 'admin' | 'organizer' | 'attendee';
export type EventStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
export type AttendeeStatus = 'registered' | 'cancelled';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  capacity: number;
  status: EventStatus;
  image_url: string | null;
  organizer_id: number;
  created_at: string;
  attendee_count: number;
}

export interface Session {
  id: number;
  title: string;
  description: string;
  speaker_name: string;
  start_time: string;
  end_time: string;
  capacity: number;
  event_id: number;
}

export interface Attendee {
  id: number;
  user_id: number;
  event_id: number;
  registered_at: string;
  status: AttendeeStatus;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
