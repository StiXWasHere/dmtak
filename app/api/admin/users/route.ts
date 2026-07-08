import { NextRequest, NextResponse } from "next/server";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const caller = await client.users.getUser(userId);
  if (caller.publicMetadata.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const res = await client.users.getUserList({
    orderBy: "-created_at",
    limit: 100,
  });

  return NextResponse.json(res.data);
}
