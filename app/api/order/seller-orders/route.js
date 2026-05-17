import { connectDB } from "@/config/db";
import Order from "@/models/Order";
import Address from "@/models/Address";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Returns ALL orders in the system - only accessible by sellers
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const isSeller = await authSeller(userId);
        if (!isSeller) return NextResponse.json({ success: false, message: "Not authorized" });

        await connectDB();
        Address.find();
        Product.find();

        const orders = await Order.find({})
            .populate("address")
            .populate("items.product");

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
