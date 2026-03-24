"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Command, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

    const initials = user?.email?.slice(0, 2).toUpperCase() ?? "AF";

    return (
        <div className="min-h-screen flex flex-col relative" style={{ background: "transparent" }}>

            {/* ─── Navbar ─── */}
            <nav
                className="sticky top-0 z-50 flex items-center justify-between px-7 py-3"
                style={{
                    background: "rgba(9,9,15,0.9)",
                    backdropFilter: "blur(16px)",
                    borderBottom: "1px solid rgba(124,109,250,0.1)",
                }}
            >
                {/* Brand */}
                <div className="flex items-center gap-2.5">
                    <div
                        className="flex items-center justify-center w-7 h-7 rounded-lg"
                        style={{ background: "linear-gradient(135deg, #38bdf8, #3b82f6)", boxShadow: "0 4px 12px rgba(56,189,248,0.3)" }}
                    >
                        <Command size={14} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-black tracking-tighter mt-0.5" style={{ color: "var(--color-content)" }}>
                        Specify
                    </span>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                    {/* User avatar */}
                    <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                        style={{
                            background: "rgba(124,109,250,0.18)",
                            border: "1px solid rgba(124,109,250,0.25)",
                            color: "var(--color-primary)",
                        }}
                    >
                        {initials}
                    </div>

                    {/* Logout */}
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
                </div>
            </nav>

            {/* ─── Page content ─── */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-7 py-10 relative z-10">
                {children}
            </main>
        </div>
    );
}