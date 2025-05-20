"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export function SentryIdentify({ email }: { email: string }) {
  useEffect(() => {
    try {
      Sentry.setUser({ email });
    } catch (error) {
      console.log("User identified:", email);
    }
  }, [email]);

  return null;
}
