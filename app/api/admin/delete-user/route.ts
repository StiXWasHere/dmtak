import { NextResponse, NextRequest } from "next/server";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // validate session and ensure caller is admin
    const auth = getAuth(req);
    if (!auth.userId || !auth.sessionId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // get user data to check role metadata
    const client = await clerkClient();
    const caller = await client.users.getUser(auth.userId);
    const role = caller.publicMetadata?.role;
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // delete the user
    await client.users.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
