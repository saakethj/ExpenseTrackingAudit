"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Trash2, Loader2, AlertCircle, Monitor, X, ImageUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { processAvatar, validateAvatarFile } from "@/lib/avatar";

const BUCKET = "avatars";

type Props = {
  userId: string;
  hasAvatar: boolean;
};

export function AvatarControls({ userId, hasAvatar }: Props) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState<"upload" | "delete" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);

  async function handleFile(file: File) {
    setError(null);
    const v = validateAvatarFile(file);
    if (v) {
      setError(v.message);
      return;
    }
    setBusy("upload");
    try {
      const blob = await processAvatar(file);
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(`${userId}.webp`, blob, {
          contentType: "image/webp",
          upsert: true,
        });
      if (upErr) throw new Error(upErr.message);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    setError(null);
    setBusy("delete");
    try {
      const supabase = createClient();
      const { error: delErr } = await supabase.storage
        .from(BUCKET)
        .remove([`${userId}.webp`]);
      if (delErr) throw new Error(delErr.message);
      setConfirmOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-3 flex w-full flex-col items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />

      <div className="flex items-center justify-center gap-2">
        {/* Change / Upload photo button */}
        <motion.button
          type="button"
          onClick={() => { if (busy === null) setUploadModalOpen(true); }}
          disabled={busy !== null}
          whileHover={busy === null ? { y: -1 } : undefined}
          whileTap={busy === null ? { scale: 0.97 } : undefined}
          transition={{ duration: 0.15 }}
          className="group/up relative overflow-hidden inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors duration-100 hover:border-purple/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={hasAvatar ? "Change profile picture" : "Upload profile picture"}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 transition-transform duration-150 ease-out group-hover/up:scale-y-100"
            style={{ background: "linear-gradient(135deg, var(--purple) 0%, #ec4899 50%, var(--orange) 100%)" }}
          />
          {busy === "upload" ? (
            <Loader2 className="relative z-10 h-3.5 w-3.5 animate-spin transition-colors group-hover/up:text-white" />
          ) : (
            <UploadCloud className="relative z-10 h-3.5 w-3.5 transition-colors group-hover/up:text-white" />
          )}
          <span className="relative z-10 transition-colors group-hover/up:text-white">
            {hasAvatar ? "Change photo" : "Upload photo"}
          </span>
        </motion.button>

        {/* Remove button */}
        <motion.button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={!hasAvatar || busy !== null}
          whileHover={hasAvatar && busy === null ? { y: -1 } : undefined}
          whileTap={hasAvatar && busy === null ? { scale: 0.97 } : undefined}
          transition={{ duration: 0.15 }}
          className="group/rm relative overflow-hidden inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors duration-100 hover:border-red-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Remove profile picture"
          title={hasAvatar ? undefined : "No custom photo to remove"}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-red-500 transition-transform duration-150 ease-out group-hover/rm:scale-y-100"
          />
          <Trash2 className="relative z-10 h-3.5 w-3.5 transition-colors group-hover/rm:text-white" />
          <span className="relative z-10 transition-colors group-hover/rm:text-white">Remove</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload photo modal */}
      <AnimatePresence>
        {uploadModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setUploadModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="upload-photo-title"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "linear-gradient(135deg, var(--purple) 0%, #ec4899 50%, var(--orange) 100%)" }}
                  >
                    <ImageUp className="h-4 w-4 text-white" />
                  </div>
                  <h2 id="upload-photo-title" className="text-base font-semibold text-foreground">
                    Upload photo
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Info */}
              <div className="mt-4 rounded-xl border border-border bg-muted/40 px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">Supported formats</span>
                  <span className="font-medium text-foreground">JPEG, PNG, WebP</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">Maximum size</span>
                  <span className="font-medium text-foreground">1 MB</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">Cropping</span>
                  <span className="font-medium text-foreground">Auto-cropped to square</span>
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => {
                  setUploadModalOpen(false);
                  inputRef.current?.click();
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Monitor className="h-4 w-4 text-muted-foreground" />
                Select from local
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove confirm modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => { if (busy === null) setConfirmOpen(false); }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-remove-title"
            >
              <h2
                id="confirm-remove-title"
                className="text-base font-semibold text-foreground"
              >
                Remove profile picture?
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Your avatar will be replaced with the default silhouette. You
                can upload a new photo any time.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={busy === "delete"}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={busy === "delete"}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
                >
                  {busy === "delete" && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Remove</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
