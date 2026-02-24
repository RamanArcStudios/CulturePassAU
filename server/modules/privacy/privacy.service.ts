import { db } from "../../db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";

export interface PrivacySettings {
  profileVisibility: boolean;
  dataSharing: boolean;
  activityStatus: boolean;
  showLocation: boolean;
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: true,
  dataSharing: false,
  activityStatus: true,
  showLocation: true,
};

/** Retrieves privacy settings for a user by their ID */
export async function getPrivacySettings(userId: string): Promise<PrivacySettings> {
  const [user] = await db
    .select({ privacySettings: users.privacySettings })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) throw new Error("User not found");

  return (user.privacySettings as PrivacySettings | null) ?? DEFAULT_PRIVACY_SETTINGS;
}

/** Updates and persists privacy settings for a user by their ID */
export async function updatePrivacySettings(
  userId: string,
  settings: Partial<PrivacySettings>
): Promise<PrivacySettings> {
  const current = await getPrivacySettings(userId);
  const merged = { ...current, ...settings };

  const [updated] = await db
    .update(users)
    .set({ privacySettings: merged })
    .where(eq(users.id, userId))
    .returning({ privacySettings: users.privacySettings });

  if (!updated) throw new Error("User not found");

  return updated.privacySettings as PrivacySettings;
}
