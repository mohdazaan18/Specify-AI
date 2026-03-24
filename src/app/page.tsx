"use client";

import LoginButton from "@/components/LoginButton";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Command } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <main
      className="relative flex h-screen flex-col items-center justify-center overflow-hidden"
      style={{ background: "transparent" }}
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,255,255,0.02) 0%, transparent 70%)",
        }}
      />

      {/* Faint grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.6,
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-md">

        {/* Logo */}
        <div
          className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-6"
          style={{ background: "linear-gradient(135deg, #38bdf8, #3b82f6)", boxShadow: "0 8px 32px rgba(56,189,248,0.3)" }}
        >
          <Command size={24} className="text-white" strokeWidth={2.5} />
        </div>

        <h1
          className="text-[40px] font-black tracking-tighter mb-4 leading-tight"
          style={{ color: "var(--color-content)", fontFamily: "var(--font-heading)" }}
        >
          Welcome to{" "}
          <span style={{
            background: "linear-gradient(to right, #93c5fd, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Specify</span>
        </h1>

        <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--color-content-soft)" }}>
          Describe your project idea and let AI agents generate a complete technical specification for you.
        </p>

        {/* Auth card */}
        <div
          className="w-full p-7 rounded-2xl"
          style={{
            background: "var(--color-surface-card)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
          }}
        >
          <p className="text-xs mb-5" style={{ color: "var(--color-content-muted)" }}>
            Sign in to access your workspace
          </p>
          <LoginButton />
        </div>

        <p className="flex items-center justify-center gap-2 text-[11px] mt-6" style={{ color: "var(--color-content-muted)" }}>
          <span className="flex items-center gap-1.5 font-black tracking-tighter text-white/90 text-xs">
            <Command size={10} className="text-blue-400" strokeWidth={3} /> Specify
          </span>
          <span className="opacity-50">·</span>
          <span>Architecture spec generation</span>
        </p>
      </div>
    </main >
  );
}