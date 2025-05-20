"use client";

import * as Sentry from "@sentry/nextjs";
import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  try {
    Sentry.captureException(error);
  } catch (e) {
    console.error(error);
  }

  return (
    <html>
      <body>
        <div className="p-4">
          <ErrorDisplay error={{ error: error?.message }} />
          {/* Add separate reset button since ErrorDisplay doesn't accept reset prop */}
          <div className="mt-4 text-center">
            <button
              onClick={() => reset()}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
