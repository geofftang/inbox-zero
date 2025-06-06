import { createScopedLogger } from "@/utils/logger";
import { RedisSubscriber } from "@/utils/redis/subscriber";
import { withEmailAccount } from "@/utils/middleware";

export const maxDuration = 60;

const logger = createScopedLogger("email-stream");

// 5 minutes in milliseconds
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export const GET = withEmailAccount(async (request) => {
  const emailAccountId = request.auth.emailAccountId;

  if (!emailAccountId) return new Response("Unauthorized", { status: 401 });

  const pattern = `thread:${emailAccountId}:*`;
  const redisSubscriber = RedisSubscriber.getInstance();

  redisSubscriber.psubscribe(pattern, (err) => {
    if (err) logger.error("Error subscribing to threads", { error: err });
  });

  // Set headers for SSE
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Content-Encoding": "none",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // For anyone using Nginx
  });

  logger.info("Creating SSE stream", { emailAccountId });

  const encoder = new TextEncoder();

  // Create a streaming response
  const redisStream = new ReadableStream({
    async start(controller) {
      let inactivityTimer: NodeJS.Timeout;
      let isControllerClosed = false;

      const resetInactivityTimer = () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          logger.info("Stream closed due to inactivity", { emailAccountId });
          if (!isControllerClosed) {
            isControllerClosed = true;
            controller.close();
          }
          redisSubscriber.punsubscribe(pattern);
        }, INACTIVITY_TIMEOUT);
      };

      // Start initial inactivity timer
      resetInactivityTimer();

      redisSubscriber.on("pmessage", (_pattern, _channel, message) => {
        // Only enqueue if controller is not closed
        if (!isControllerClosed) {
          try {
            controller.enqueue(
              encoder.encode(`event: thread\ndata: ${message}\n\n`),
            );
            resetInactivityTimer(); // Reset timer on message
          } catch (error) {
            logger.error("Error enqueueing message", { error });
            // If we hit an error, mark controller as closed and clean up
            isControllerClosed = true;
            redisSubscriber.punsubscribe(pattern);
          }
        }
      });

      request.signal.addEventListener("abort", () => {
        logger.info("Cleaning up Redis subscription", { emailAccountId });
        clearTimeout(inactivityTimer);
        if (!isControllerClosed) {
          isControllerClosed = true;
          controller.close();
        }
        redisSubscriber.punsubscribe(pattern);
      });
    },
  });

  return new Response(redisStream, { headers });
});
