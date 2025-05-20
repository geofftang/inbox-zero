"use client";

import { useEffect } from "react";

export function SentryIdentify({ email }: { email: string }) {
  useEffect(() => {
    // User identification removed
    console.log("User identified:", email);
  }, [email]);

  return null;
}
