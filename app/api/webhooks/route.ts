import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Webhook endpoint — handles incoming webhooks from Supabase or external services.
  // Implement signature verification before processing.
  await request.json();

  return NextResponse.json({ received: true, timestamp: new Date().toISOString() });
}
