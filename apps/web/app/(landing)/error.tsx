"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function ErrorBoundary({ error }: any) {
  useEffect(() => {
    try {
      Sentry.captureException(error);
    } catch (e) {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="p-4">
      <ErrorDisplay error={{ error: error?.message }} />
    </div>
  );
}
