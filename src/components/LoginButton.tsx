"use client";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button"

export default function LoginButton() {
    const loginWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: "http://localhost:3000/dashboard",
            },
        });
    };

    return (
        <Button
            onClick={loginWithGoogle}
            className="px-8 py-4 btn-primary cursor-pointer"
        >
            Continue with Google
        </Button>
    );
}