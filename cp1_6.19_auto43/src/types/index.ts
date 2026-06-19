export interface Exhibition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  description: string;
  coverImage: string;
  images: string[];
  createdAt: string;
  remainingTickets?: number;
  totalCapacity?: number;
  status?: 'upcoming' | 'ongoing' | 'ended';
  dailyRemaining?: DailyRemaining[];
}

export interface DailyRemaining {
  date: string;
  remaining: number;
  isFull: boolean;
}

export interface Booking {
  id: string;
  exhibitionId: string;
  name: string;
  phone: string;
  date: string;
  tickets: number;
  seatNumbers: string[];
  verificationCode: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  exhibitionName?: string;
  exhibition?: Exhibition;
}

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface Stats {
  totalBookings: number;
  totalVisitors: number;
  exhibitionStats: ExhibitionStat[];
}

export interface ExhibitionStat {
  id: string;
  name: string;
  capacity: number;
  totalBooked: number;
  dailyData: DailyData[];
}

export interface DailyData {
  date: string;
  remaining: number;
  booked: number;
  capacity: number;
}
