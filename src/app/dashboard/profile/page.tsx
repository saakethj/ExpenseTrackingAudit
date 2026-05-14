import { redirect } from "next/navigation";
import ProfileCard from "@/components/profile-card";
import { AvatarControls } from "@/components/avatar-controls";
import { createClient } from "@/lib/supabase/server";
import { getAvatarSignedUrl } from "@/lib/supabase/avatar-server";

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

  const signedAvatarUrl = await getAvatarSignedUrl(user.id);
  const avatarUrl = signedAvatarUrl ?? DEFAULT_AVATAR;

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-8 sm:py-12">
      <div className="flex w-full max-w-md flex-col items-center">
        <ProfileCard
          className="w-fit mx-auto"
          name={displayName}
          title="Member"
          handle={handle}
          status="Active"
          contactText="Edit profile"
          avatarUrl={avatarUrl}
          miniAvatarUrl={avatarUrl}
          showUserInfo={false}
          enableTilt
          enableMobileTilt={false}
        />
        <AvatarControls
          userId={user.id}
          hasAvatar={signedAvatarUrl !== null}
        />
      </div>
    </div>
  );
}
