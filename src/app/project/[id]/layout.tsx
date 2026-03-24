"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Command, ArrowLeft, LogOut } from "lucide-react";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
    const { user, setUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user === null) router.push("/");
    }, [user, loading, router]);

    async function logoutUser() {
        await supabase.auth.signOut();
        setUser(null);
        router.push("/");
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ background: "transparent" }}>
            {/* ─── Navbar ─── */}
            <nav
                className="shrink-0 flex items-center justify-between px-6 py-3"
                style={{
                    background: "rgba(9,9,15,0.93)",
                    backdropFilter: "blur(16px)",
                    borderBottom: "1px solid rgba(124,109,250,0.1)",
                }}
            >
                {/* Left */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="flex items-center justify-center w-7 h-7 rounded-lg"
                            style={{ background: "linear-gradient(135deg, #38bdf8, #3b82f6)", boxShadow: "0 4px 12px rgba(56,189,248,0.3)" }}
                        >
                            <Command size={14} className="text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-black tracking-tighter" style={{ color: "var(--color-content)" }}>
                            Specify
                        </span>
                    </div>

                    <span style={{ width: 1, height: 16, background: "rgba(124,109,250,0.15)", display: "inline-block" }} />

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-1.5 text-xs transition-all"
                        style={{ color: "var(--color-content-muted)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-content)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-content-muted)")}
                    >
                        <ArrowLeft size={12} />
                        All projects
                    </button>
                </div>

                {/* Right */}
                <button
                    onClick={logoutUser}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={{
                        background: "transparent",
                        border: "1px solid rgba(124,109,250,0.15)",
                        color: "var(--color-content-soft)",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(124,109,250,0.08)";
                        (e.currentTarget as HTMLElement).style.color = "var(--color-content)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--color-content-soft)";
                    }}
                >
                    <LogOut size={12} />
                    Sign out
                </button>
            </nav>

            {/* ─── Workspace fills remaining height ─── */}
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    );
}