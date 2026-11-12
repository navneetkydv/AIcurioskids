
"use client";

import { useState } from "react";
import { getStoredUTM } from "@/components/UTMCapture";

export default function DownloadResourceButton({
  label = "Download",
  className = "btn-primary",
  title = "Download resource",
  description = "Share your details and we'll start the download.",
  fileUrl,
  fileName = "AIforStudents.pdf",
  endpoint = "/api/leads/brochure",
  resourceType = "brochure",
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const utm = getStoredUTM();

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          resourceType,
          ...utm,
          website: "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setStatus("error");
        return;
      }

      const a = document.createElement("a");
      a.href = fileUrl || data.downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setStatus("success");

      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        setName("");
        setEmail("");
        setPhone("");
      }, 1200);

    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(28, 32, 51, 0.5)" }}
          onClick={() => status !== "loading" && setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-1">
              {title}
            </h3>

            <p className="text-sm text-[var(--color-muted)] mb-5">
              {description}
            </p>

            {status === "success" ? (
              <p className="text-[var(--color-success)] font-medium py-4">
                Thank you! Your download should start automatically.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-black font-medium mb-1">
                    Name
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-black rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-black rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black font-medium mb-1">
                    Mobile (+91)
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full text-black rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => setOpen(false)}
                    disabled={status === "loading"}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Please wait…" : "Download"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
