import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  Clock,
  KeyRound,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type Props = {
  provider: string;
  lastSignInAt: string | null;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
};

function formatRelative(iso: string | null): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} mo ago`;
}

function providerLabel(p: string): string {
  if (p === "google") return "Google";
  if (p === "email") return "Email & password";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export function AccountSnapshot({
  provider,
  lastSignInAt,
  twoFactorEnabled,
  emailVerified,
}: Props) {
  return (
    <div className="card-glow group/snap relative mt-4 overflow-hidden rounded-2xl border border-border bg-card p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-4 -top-8 h-16 opacity-0 blur-2xl transition-opacity duration-500 group-hover/snap:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, var(--purple) 0%, var(--orange) 100%)",
        }}
      />
      <h3 className="relative flex items-center gap-2 border-b border-border pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <Sparkles className="h-3 w-3 text-orange" />
        Account at a glance
      </h3>
      <ul className="relative mt-3 flex flex-col gap-3">
        <Row
          icon={twoFactorEnabled ? ShieldCheck : ShieldAlert}
          iconClass={twoFactorEnabled ? "text-green-500" : "text-amber-500"}
          label="Two-factor auth"
        >
          {twoFactorEnabled ? (
            <StatusBadge tone="success">Enabled</StatusBadge>
          ) : (
            <StatusBadge tone="warn" pulse>
              Disabled
            </StatusBadge>
          )}
        </Row>

        <Row icon={KeyRound} label="Sign-in method">
          <span className="text-foreground/90">{providerLabel(provider)}</span>
        </Row>

        <Row icon={Clock} label="Last sign-in">
          <span className="text-foreground/90">
            {formatRelative(lastSignInAt)}
          </span>
        </Row>

        <Row
          icon={Mail}
          iconClass={
            emailVerified ? "text-green-500" : "text-muted-foreground"
          }
          label="Email"
        >
          {emailVerified ? (
            <StatusBadge tone="success">Verified</StatusBadge>
          ) : (
            <StatusBadge tone="warn">Unverified</StatusBadge>
          )}
        </Row>
      </ul>
    </div>
  );
}

function Row({
  icon: Icon,
  iconClass = "text-muted-foreground",
  label,
  children,
}: {
  icon: LucideIcon;
  iconClass?: string;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg px-1 py-1 transition-colors hover:bg-muted/40">
      <div className="flex min-w-0 items-center gap-2.5">
        <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} />
        <span className="truncate text-[12px] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="shrink-0 text-[12px]">{children}</div>
    </li>
  );
}

function StatusBadge({
  tone,
  pulse = false,
  children,
}: {
  tone: "success" | "warn";
  pulse?: boolean;
  children: React.ReactNode;
}) {
  const tones = {
    success: "bg-green-500/10 text-green-500 ring-1 ring-inset ring-green-500/20",
    warn: "bg-amber-500/10 text-amber-500 ring-1 ring-inset ring-amber-500/20",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
        </span>
      )}
      {children}
    </span>
  );
}
