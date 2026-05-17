import { connectDB } from "@/config/db";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const isSeller = await authSeller(userId);
        if (!isSeller) return NextResponse.json({ success: false, message: "Not authorized" });

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("id");

        if (!productId) return NextResponse.json({ success: false, message: "Product ID required" });

        await connectDB();
        const deleted = await Product.findByIdAndDelete(productId);

        if (!deleted) return NextResponse.json({ success: false, message: "Product not found" });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
