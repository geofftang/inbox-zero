"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function ErrorBoundary({ error }: any) {
  useEffect(() => {
    // Error logging removed
    console.error(error);
  }, [error]);

  return (
    <div className="p-4">
      <ErrorDisplay error={{ error: error?.message }} />
    </div>
  );
}
