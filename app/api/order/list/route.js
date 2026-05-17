import { connectDB } from "@/config/db";
import Order from "@/models/Order";
import Address from "@/models/Address";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Returns all orders for the currently logged-in user (My Orders page)
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        await connectDB();
        // Initialize so Mongoose can populate across models
        Address.find();
        Product.find();

        // populate("address") replaces the address ID with the full address object
        // populate("items.product") replaces product IDs with full product data
        const orders = await Order.find({ userId })
            .populate("address")
            .populate("items.product");

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
