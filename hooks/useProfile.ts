import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import type { User, Membership, Wallet } from '@shared/schema';

export function useCurrentUser() {
  const { data: usersData, ...rest } = useQuery<User[]>({ queryKey: ['/api/users'] });
  const user = usersData?.[0] ?? null;
  return { user, userId: user?.id ?? null, ...rest };
}

export function useMembership(userId: string | null) {
  return useQuery<Membership>({
    queryKey: [`/api/membership/${userId}`],
    enabled: !!userId,
  });
}

export function useWallet(userId: string | null) {
  return useQuery<Wallet>({
    queryKey: ['/api/wallet', userId],
    enabled: !!userId,
  });
}

export function useTicketCount(userId: string | null) {
  return useQuery<{ count: number }>({
    queryKey: [`/api/tickets/${userId}/count`],
    enabled: !!userId,
  });
}

export function useUnreadNotifications(userId: string | null) {
  return useQuery<{ count: number }>({
    queryKey: [`/api/notifications/${userId}/unread-count`],
    enabled: !!userId,
  });
}

export function useProfileCompleteness(user: User | null) {
  let pct = 0;
  if (!user) return pct;
  if (user.displayName) pct += 20;
  if (user.bio) pct += 20;
  if (user.avatarUrl) pct += 10;
  if (user.city || user.location) pct += 20;
  if (user.username) pct += 15;
  if (user.socialLinks && Object.keys(user.socialLinks).length > 0) pct += 15;
  return pct;
}

export function useCpidLookup(cpid: string | null) {
  return useQuery({
    queryKey: ['/api/cpid/lookup', cpid],
    queryFn: async () => {
      if (!cpid) return null;
      const base = getApiUrl();
      const res = await fetch(`${base}api/cpid/lookup/${encodeURIComponent(cpid)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.entityType === 'user' && data.targetId) {
        const userRes = await fetch(`${base}api/users/${data.targetId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          return { ...data, profile: userData };
        }
      }
      return data;
    },
    enabled: !!cpid,
  });
}
