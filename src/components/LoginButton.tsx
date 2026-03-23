"use client";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button"

export default function LoginButton() {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <Button
      onClick={loginWithGoogle}
      className="px-4 py-2 btn-primary cursor-pointer"
    >
      Continue with Google
    </Button>
  );
}