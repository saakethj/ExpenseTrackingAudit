import { redirect } from "next/navigation";
import ProfileCard from "@/components/profile-card";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_AVATAR = "/avatar-default.svg";

function handleFromEmail(email: string): string {
  return email.split("@")[0] ?? "user";
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const email = user.email;
  const handle = handleFromEmail(email);
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ?? handle;

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <ProfileCard
          name={displayName}
          title="Member"
          handle={handle}
          status="Active"
          contactText="Edit profile"
          avatarUrl={DEFAULT_AVATAR}
          miniAvatarUrl={DEFAULT_AVATAR}
          showUserInfo={false}
          enableTilt
          enableMobileTilt={false}
        />
      </div>
    </div>
  );
}
