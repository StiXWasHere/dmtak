import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get the currently signed-in user
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clerkClient(); // <--- you must await it
    const adminUser = await client.users.getUser(userId);

    if (adminUser.publicMetadata.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, password, role, firstName, lastName } = await req.json() as {
      email?: string;
      password?: string;
      role?: string;
      firstName?: string;
      lastName?: string;
    };

    // simple input validation
    if (!email || !password || !role || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Clerk requires passwords to be at least 8 characters
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    const newUser = await client.users.createUser({
      emailAddress: [email],
      password, // Clerk requires a password if not using invite
      publicMetadata: { role },
      firstName,
      lastName,
    });

    return NextResponse.json(newUser);
  } catch (err) {
    console.error("create-user error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
