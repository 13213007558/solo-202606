export interface Exhibition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  description: string;
  coverImage: string;
  images: string[];
  status: 'upcoming' | 'ongoing' | 'ended';
  remainingTickets?: number;
  dateStats?: DateStat[];
}

export interface DateStat {
  date: string;
  remaining: number;
  capacity: number;
  booked?: number;
}

export interface Booking {
  id: string;
  exhibitionId: string;
  name: string;
  phone: string;
  date: string;
  count: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  verificationCode: string;
  seatNumber: string;
  createdAt?: string;
  exhibitionName?: string;
  exhibitionImage?: string;
}

export interface Stats {
  totalBookings: number;
  totalExhibitions: number;
  exhibitionStats: ExhibitionStat[];
  bookingList: Booking[];
}

export interface ExhibitionStat {
  id: string;
  name: string;
  capacity: number;
  totalVisitors: number;
  dateStats: DateStat[];
  status: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
  museumName: string;
}
