export type MembershipTier = 'free' | 'plus' | 'elite' | 'pro' | 'premium' | 'vip';

export interface Membership {
  id: string;
  userId: string;
  tier: MembershipTier;
  validUntil?: string;
  isActive?: boolean;
  benefits?: string[];
  [key: string]: any;
}

export interface Wallet {
  id: string;
  userId: string;
  balance?: number;
  currency?: string;
  points?: number;
  [key: string]: any;
}

export interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  bio?: string;
  interests?: string[];
  location?: string;
  socialLinks?: Record<string, string>;
  isVerified?: boolean;
  culturePassId?: string;
  followersCount?: number;
  followingCount?: number;
  likesCount?: number;
  createdAt: string | null;
  website?: string;
  phone?: string;
  membership?: Membership;
  [key: string]: any;
}

export interface Profile {
  id: string;
  name: string;
  type?: 'community' | 'business' | 'venue' | 'artist' | 'organisation' | string;
  entityType: string;
  description?: string;
  imageUrl?: string;
  coverUrl?: string;
  coverImageUrl?: string;
  avatarUrl?: string;
  images?: string[];
  city?: string;
  country?: string;
  tags?: string[];
  verified?: boolean;
  isVerified?: boolean;
  followers?: number;
  followersCount?: number;
  members?: number;
  membersCount?: number;
  reviewsCount?: number;
  rating?: number;
  category?: string;
  culturePassId?: string;
  bio?: string;
  address?: string;
  openingHours?: string;
  website?: string;
  email?: string;
  phone?: string;
  socialLinks?: Record<string, string>;
  [key: string]: any;
}

export interface Community extends Profile {
  members?: number;
  category?: string;
}

export interface Review {
  id: string;
  profileId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string | null;
  [key: string]: any;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  title?: string;
  eventName?: string;
  date?: string;
  venue?: string;
  qrCode?: string;
  status: string | null;
  ticketCode?: string;
  scannedAt?: string;
  [key: string]: any;
}
