import { Alert, Platform } from 'react-native';

export const errorMessages: Record<string, string> = {
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You don\'t have permission to do this.',
  INVALID_CREDENTIALS: 'Invalid username or password.',
  NOT_FOUND: 'The requested item could not be found.',
  USER_NOT_FOUND: 'User account not found.',
  TICKET_NOT_FOUND: 'Ticket not found.',
  EVENT_NOT_FOUND: 'Event not found.',
  PERK_NOT_FOUND: 'Perk not found.',
  PROFILE_NOT_FOUND: 'Profile not found.',
  MEMBERSHIP_NOT_FOUND: 'Membership not found.',
  TICKET_ALREADY_SCANNED: 'This ticket has already been used.',
  TICKET_ALREADY_CANCELLED: 'This ticket has been cancelled.',
  TICKET_EXPIRED: 'This ticket has expired.',
  TICKET_CANNOT_REFUND: 'This ticket cannot be refunded.',
  DUPLICATE_PURCHASE: 'You already have a pending purchase for this event.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  PAYMENT_PENDING: 'Payment is still being processed.',
  STRIPE_ERROR: 'Payment service error. Please try again later.',
  INVALID_AMOUNT: 'Invalid payment amount.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  MISSING_REQUIRED_FIELD: 'Please fill in all required fields.',
  INVALID_INPUT: 'Invalid input. Please check and try again.',
  PERK_LIMIT_REACHED: 'This perk has reached its redemption limit.',
  PERK_EXPIRED: 'This perk has expired.',
  MEMBERSHIP_REQUIRED: 'A CulturePass+ membership is required for this action.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Please check your internet connection.',
};

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export function getErrorMessage(code: string): string {
  return errorMessages[code] || 'Something went wrong. Please try again.';
}

export async function extractApiError(response: Response): Promise<{ code: string; message: string }> {
  try {
    const data = await response.json();
    if (data?.error?.code) {
      return {
        code: data.error.code,
        message: data.error.message || getErrorMessage(data.error.code),
      };
    }
    if (data?.error) {
      return {
        code: 'INTERNAL_ERROR',
        message: typeof data.error === 'string' ? data.error : 'Something went wrong.',
      };
    }
    return { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' };
  } catch {
    return { code: 'NETWORK_ERROR', message: 'Please check your internet connection.' };
  }
}

export function showErrorAlert(title: string, error: { code: string; message: string }, onRetry?: () => void) {
  const buttons: Array<{ text: string; onPress?: () => void; style?: 'cancel' | 'default' | 'destructive' }> = [
    { text: 'OK', style: 'cancel' as const },
  ];
  if (onRetry) {
    buttons.push({ text: 'Retry', onPress: onRetry });
  }
  Alert.alert(title, error.message, buttons);
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('Network')) return true;
  if (error instanceof Error && error.message.includes('fetch')) return true;
  return false;
}
