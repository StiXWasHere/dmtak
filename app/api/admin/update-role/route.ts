import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId, role }: { userId: string; role: string } = await req.json();

  const client = await clerkClient();

  await client.users.updateUser(userId, {
    publicMetadata: {
      role,
    },
  });

  return NextResponse.json({ ok: true });
}
