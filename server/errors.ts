import type { Request, Response } from "express";

/**
 * Standardized error codes for the API
 */
export const ErrorCodes = {
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  TICKET_NOT_FOUND: 'TICKET_NOT_FOUND',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  PERK_NOT_FOUND: 'PERK_NOT_FOUND',
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  MEMBERSHIP_NOT_FOUND: 'MEMBERSHIP_NOT_FOUND',
  
  // Tickets
  TICKET_ALREADY_SCANNED: 'TICKET_ALREADY_SCANNED',
  TICKET_ALREADY_CANCELLED: 'TICKET_ALREADY_CANCELLED',
  TICKET_EXPIRED: 'TICKET_EXPIRED',
  TICKET_CANNOT_REFUND: 'TICKET_CANNOT_REFUND',
  DUPLICATE_PURCHASE: 'DUPLICATE_PURCHASE',
  
  // Payments
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  STRIPE_ERROR: 'STRIPE_ERROR',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Perks
  PERK_LIMIT_REACHED: 'PERK_LIMIT_REACHED',
  PERK_EXPIRED: 'PERK_EXPIRED',
  MEMBERSHIP_REQUIRED: 'MEMBERSHIP_REQUIRED',
  
  // Rate limit
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

/**
 * Application error class with standardized error codes and HTTP status codes
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Wraps async route handlers to catch errors and return standardized responses
 */
export function wrapHandler(
  handler: (req: Request, res: Response) => Promise<any>
) {
  return async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          success: false,
          error: { code: err.code, message: err.message }
        });
      }
      console.error('Unhandled error:', err);
      return res.status(500).json({
        success: false,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: 'Something went wrong. Please try again.' }
      });
    }
  };
}

/**
 * Simple in-memory rate limiter
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}
