import { createClient } from "./server";

const BUCKET = "avatars";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

export async function getAvatarSignedUrl(
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const path = `${userId}.webp`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
