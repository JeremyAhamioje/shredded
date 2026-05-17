import { connectDB } from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Called every time user adds/removes/changes quantity in cart
// Saves the entire cart object to the user's record in MongoDB
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const { cartData } = await request.json();
        await connectDB();
        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ success: false, message: "User not found" });

        user.cartItems = cartData;
        await user.save();
        return NextResponse.json({ success: true, message: "Cart updated" });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
