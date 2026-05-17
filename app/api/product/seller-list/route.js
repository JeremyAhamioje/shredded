import { connectDB } from "@/config/db";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Seller-only endpoint: returns all products so seller can manage their list
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const isSeller = await authSeller(userId);
        if (!isSeller) return NextResponse.json({ success: false, message: "Not authorized" });

        await connectDB();
        const products = await Product.find({});
        return NextResponse.json({ success: true, products });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
