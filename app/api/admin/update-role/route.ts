import { NextRequest, NextResponse } from "next/server";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId: callerId } = getAuth(req);
  if (!callerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const client = await clerkClient();
  const caller = await client.users.getUser(callerId);
  if (caller.publicMetadata.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, role }: { userId: string; role: string } = await req.json();

  await client.users.updateUser(userId, {
    publicMetadata: {
      role,
    },
  });

  return NextResponse.json({ ok: true });
}
