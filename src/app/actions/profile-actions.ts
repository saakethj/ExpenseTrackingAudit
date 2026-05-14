"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveProfileAction(data: {
  firstName: string;
  lastName: string;
  gender: string;
  country: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated." };
  }

  const full_name = [data.firstName.trim(), data.lastName.trim()]
    .filter(Boolean)
    .join(" ");

  const { error } = await supabase.auth.updateUser({
    data: {
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      full_name,
      gender: data.gender,
      country: data.country,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return {};
}
