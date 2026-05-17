import { connectDB } from "@/config/db";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Simple endpoint the payment-success page polls to check if isPaid flipped to true.
// The webhook sets isPaid: true asynchronously, so the page checks every 2 seconds.
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("orderId");

        await connectDB();
        const order = await Order.findById(orderId);
        if (!order || order.userId !== userId) {
            return NextResponse.json({ success: false, message: "Order not found" });
        }

        return NextResponse.json({ success: true, isPaid: order.isPaid, status: order.status });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
