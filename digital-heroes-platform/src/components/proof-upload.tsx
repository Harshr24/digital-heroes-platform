"use client";

import { useState } from "react";

interface Props {
  winningId: string;
  currentStatus: string;
  currentProofUrl?: string | null;
}

export function ProofUpload({ winningId, currentStatus, currentProofUrl }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(!!currentProofUrl);

  if (currentStatus === "paid") {
    return (
      <div className="rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-300">
        ✓ Payment confirmed
      </div>
    );
  }

  if (currentStatus === "rejected") {
    return (
      <div className="space-y-2">
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
          ✗ Proof rejected — please resubmit
        </div>
        <ProofForm
          winningId={winningId}
          file={file}
          setFile={setFile}
          uploading={uploading}
          setUploading={setUploading}
          message={message}
          setMessage={setMessage}
          setSubmitted={setSubmitted}
        />
      </div>
    );
  }

  if (submitted || currentStatus === "approved") {
    return (
      <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 px-4 py-3 text-sm text-blue-300">
        ✓ Proof submitted — awaiting admin review
      </div>
    );
  }

  return (
    <ProofForm
      winningId={winningId}
      file={file}
      setFile={setFile}
      uploading={uploading}
      setUploading={setUploading}
      message={message}
      setMessage={setMessage}
      setSubmitted={setSubmitted}
    />
  );
}

function ProofForm({
  winningId,
  file,
  setFile,
  uploading,
  setUploading,
  message,
  setMessage,
  setSubmitted,
}: {
  winningId: string;
  file: File | null;
  setFile: (f: File | null) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  message: string;
  setMessage: (m: string) => void;
  setSubmitted: (v: boolean) => void;
}) {
  async function handleUpload() {
    if (!file) { setMessage("Please select a file first."); return; }
    if (file.size > 5 * 1024 * 1024) { setMessage("File must be under 5MB."); return; }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("winningId", winningId);

    const res = await fetch("/api/user/proof", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setMessage(data.error ?? "Upload failed.");
      return;
    }

    setSubmitted(true);
    setMessage("Proof uploaded successfully!");
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold">Submit Winning Proof</p>
        <p className="text-xs text-zinc-400 mt-0.5">
          Upload a screenshot of your scores from your golf platform. PNG, JPG or PDF, max 5MB.
        </p>
      </div>

      <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/20 p-6 cursor-pointer hover:border-white/40 transition-colors">
        <span className="text-2xl">📎</span>
        <span className="text-sm text-zinc-400">
          {file ? file.name : "Click to choose file"}
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="w-full rounded-lg bg-cyan-400 py-2 text-sm font-semibold text-black disabled:opacity-50 transition"
      >
        {uploading ? "Uploading..." : "Submit proof"}
      </button>

      {message && (
        <p className={`text-xs ${message.includes("success") ? "text-cyan-400" : "text-red-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
