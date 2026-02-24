import { Alert } from 'react-native';
import { apiRequest } from '@/lib/query-client';

export type ReportTarget = 'event' | 'community' | 'profile' | 'post' | 'user';

export async function submitReport(targetType: ReportTarget, targetId: string, reason: string, details?: string) {
  const response = await apiRequest('POST', '/api/reports', {
    targetType,
    targetId,
    reason,
    details,
  });
  return response.json();
}

export function confirmAndReport(options: {
  targetType: ReportTarget;
  targetId: string;
  reason?: string;
  details?: string;
  label?: string;
}) {
  const { targetType, targetId, reason = 'Inappropriate content', details, label = 'this content' } = options;

  Alert.alert('Report Content', `Report ${label} for moderation review?`, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Report',
      style: 'destructive',
      onPress: async () => {
        try {
          await submitReport(targetType, targetId, reason, details);
          Alert.alert('Report Submitted', 'Thanks. Our moderation team will review this report.');
        } catch {
          Alert.alert('Report Failed', 'Unable to submit report right now. Please try again later.');
        }
      },
    },
  ]);
}
