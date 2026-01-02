import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Get the currently signed-in user
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient(); // <--- you must await it
  const adminUser = await client.users.getUser(userId);

  if (adminUser.publicMetadata.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, password, role, firstName, lastName }: { email: string; password: string; role: string; firstName: string; lastName: string } = await req.json();

  const newUser = await client.users.createUser({
    emailAddress: [email],
    password: password, // Clerk requires a password if not using invite
    publicMetadata: {role},
    firstName: firstName,
    lastName: lastName,
  });

  return NextResponse.json(newUser);
}
