import { connectDB } from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Fetches saved cart items from MongoDB for this user
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        await connectDB();
        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ success: false, message: "User not found" });

        return NextResponse.json({ success: true, cartItems: user.cartItems });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
