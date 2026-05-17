import { connectDB } from "@/config/db";
import User from "@/models/User";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }

        await connectDB();
        let user = await User.findById(userId);

        if (!user) {
            // User exists in Clerk but was never synced to MongoDB.
            // This happens when the Inngest/Clerk webhook is misconfigured or the
            // ngrok URL has changed. Auto-create the user now from Clerk's backend API
            // so the app keeps working regardless of webhook delivery.
            const clerk = await clerkClient();
            const clerkUser = await clerk.users.getUser(userId);
            user = await User.create({
                _id: userId,
                email: clerkUser.emailAddresses[0]?.emailAddress || "",
                name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
                imageUrl: clerkUser.imageUrl,
            });
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
