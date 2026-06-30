"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function GoogleButton({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={() => signIn("google", { callbackUrl })}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.43 3.58v3h3.93c2.3-2.12 3.52-5.24 3.52-8.82z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.93-3c-1.09.73-2.5 1.16-4 1.16-3.07 0-5.67-2.07-6.6-4.86H1.34v3.06C3.31 21.3 7.34 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.4 14.39A7.16 7.16 0 0 1 5 12c0-.83.15-1.64.4-2.39V6.55H1.34A12 12 0 0 0 0 12c0 1.93.46 3.76 1.34 5.45l4.06-3.06z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.34 0 3.31 2.7 1.34 6.55l4.06 3.06C6.33 6.83 8.93 4.77 12 4.77z"
        />
      </svg>
      Continue with Google
    </Button>
  );
}
