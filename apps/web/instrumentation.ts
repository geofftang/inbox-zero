// Sentry disabled to fix OOM build issues
export function register() {
  // Sentry initialization removed
}

export const onRequestError = (error: Error) => {
  console.error("Request error:", error);
};
