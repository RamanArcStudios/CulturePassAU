import { type NextFunction, type Request, type Response } from 'express';

const BAD_WORDS = ['hate', 'abuse', 'stupid', 'idiot'];
const SUSPICIOUS_PATTERNS = [/free\s*money/i, /bit\.ly/i, /t\.me\//i, /whatsapp\.com\/chat/i];

export function textHasProfanity(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const v = value.toLowerCase();
  return BAD_WORDS.some((bad) => v.includes(bad));
}

function textLooksSuspicious(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(value));
}

export function moderationCheck(req: Request, res: Response, next: NextFunction) {
  const payload = req.body ?? {};
  const values = Object.values(payload);

  if (values.some(textHasProfanity)) {
    return res.status(400).json({ error: 'Content rejected by moderation checks (profanity).' });
  }

  if (values.some(textLooksSuspicious)) {
    return res.status(400).json({ error: 'Content rejected by moderation checks (suspicious links).' });
  }

  return next();
}
