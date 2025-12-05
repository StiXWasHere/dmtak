import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const client = await clerkClient();

  const res = await client.users.getUserList({
    orderBy: "-created_at",
    limit: 100,
  });

  console.log("Fetched users:", res);

  return NextResponse.json(res.data);
}
