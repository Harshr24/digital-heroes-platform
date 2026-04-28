type NotificationType =
  | "signup"
  | "subscription_update"
  | "draw_result"
  | "winner_alert";

export async function sendTransactionalEmail(
  email: string,
  type: NotificationType,
  payload: Record<string, string | number>,
) {
  // Hook for Resend/SendGrid integration.
  // Kept as a dedicated service so event triggers are centralized.
  return { email, type, payload, queued: true };
}
