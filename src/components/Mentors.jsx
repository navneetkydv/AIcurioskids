"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { mentors } from "@/lib/mentors";

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ mentor, size }) {
  if (mentor.photo) {
    return (
      <Image
        src={mentor.photo}
        alt={mentor.name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center rounded-full bg-[var(--color-primary)] font-semibold text-white"
      style={{ width: size, height: size, fontSize: size / 2.8 }}
    >
      {initials(mentor.name)}
    </div>
  );
}

function SocialLinks({ mentor }) {
  if (!mentor.linkedin && !mentor.instagram) return null;
  const base =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-primary)]/20 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white";

  return (
    <div className="flex gap-2">
      {mentor.linkedin && (
        <a
          href={mentor.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${mentor.name} on LinkedIn`}
          className={base}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.98 3.5a2.5 2.5 0 11-.01 5 2.5 2.5 0 01.01-5zM3 9.75h4v11.5H3V9.75zm6.5 0h3.83v1.57h.05c.53-1 1.84-2.07 3.78-2.07 4.04 0 4.79 2.66 4.79 6.12v5.88h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75v5.29h-4V9.75z" />
          </svg>
        </a>
      )}
      {mentor.instagram && (
        <a
          href={mentor.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${mentor.name} on Instagram`}
          className={base}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
      )}
    </div>
  );
}

export default function Mentors() {
  const dialogRef = useRef(null);
  const [active, setActive] = useState(null);

  // Open/close the native dialog when `active` changes
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active && !dialog.open) dialog.showModal();
    if (!active && dialog.open) dialog.close();
  }, [active]);

  // Lock page scroll while the modal is open
  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <section className="bg-blue-50 mx-auto py-4 md:py-10" aria-labelledby="mentors-title">
      <div className="container-wide">
        <h2 id="mentors-title" className="mb-3 text-center text-2xl md:text-3xl">
          Know your mentors
        </h2>
        <p className="prose-muted mx-auto mb-10 max-w-2xl text-center md:mb-12">
          Not a recorded course. Every module is delivered live by our mentors, who are experienced engineers and AI enthusiasts.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-3xl mx-auto">
          {mentors.map((m) => (
            <article key={m.id} className="card flex flex-col">
              <div className="mb-4 flex items-center gap-4">
                <Avatar mentor={m} size={64} />
                <div className="min-w-0">
                  <h3 className="text-lg leading-snug">{m.name}</h3>
                  {m.role && (
                    <p className="text-sm text-[var(--color-muted)]">{m.role}</p>
                  )}
                </div>
              </div>

              <ul className="mb-1 space-y-2 text-[15px] text-[var(--color-muted)]">
                {m.points.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                {m.bio?.length ? (
                  <button
                    type="button"
                    onClick={() => setActive(m)}
                    aria-haspopup="dialog"
                    className="font-medium text-[var(--color-secondary)] underline underline-offset-2"
                  >
                    Learn more
                  </button>
                ) : (
                  <span />
                )}
                <SocialLinks mentor={m} />
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal */}
      <dialog
        ref={dialogRef}
        onClose={() => setActive(null)}
        onClick={(e) => {
          // Clicking the dimmed backdrop targets the dialog element itself
          if (e.target === e.currentTarget) setActive(null);
        }}
        aria-labelledby="mentor-dialog-title"
        className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl bg-white p-0 text-[var(--color-body)] shadow-2xl backdrop:bg-black/50"
      >
        {active && (
          <div className="relative p-6 md:p-8">
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-section)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>

            <div className="mb-5 flex items-center gap-4 pr-10">
              <Avatar mentor={active} size={72} />
              <div className="min-w-0">
                <h3 id="mentor-dialog-title" className="text-xl">
                  {active.name}
                </h3>
                {active.role && (
                  <p className="text-sm text-[var(--color-muted)]">{active.role}</p>
                )}
              </div>
            </div>

            <div className="space-y-4 text-[15px] leading-relaxed text-[var(--color-muted)]">
              {active.bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-6">
              <SocialLinks mentor={active} />
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}