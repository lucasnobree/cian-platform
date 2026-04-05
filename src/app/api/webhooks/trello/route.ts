import { NextRequest, NextResponse } from "next/server";

/**
 * HEAD — Trello sends a HEAD request to verify the webhook callback URL.
 * Must return 200 for Trello to consider the webhook valid.
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

/**
 * POST — Receive Trello webhook events.
 * This endpoint is public (excluded from auth middleware via /api/webhooks prefix).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const actionType = body?.action?.type;
    const actionData = body?.action?.data;

    // Log webhook event for debugging
    console.log("[Trello Webhook]", actionType, JSON.stringify(actionData ?? {}).slice(0, 500));

    // Handle card movement between lists
    if (actionType === "updateCard" && actionData?.listBefore && actionData?.listAfter) {
      console.log(
        `[Trello Webhook] Card "${actionData.card?.name}" moved from "${actionData.listBefore.name}" to "${actionData.listAfter.name}"`
      );
      // Future: update project status based on list mapping
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Trello Webhook] Error processing webhook:", error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
