import { connectDB } from "@/config/db";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Seller-only: update a product's price / offerPrice (used by the dashboard's
// inline price editor so prices can be adjusted on any device).
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const isSeller = await authSeller(userId);
        if (!isSeller) return NextResponse.json({ success: false, message: "Not authorized" });

        const { productId, price, offerPrice } = await request.json();
        if (!productId) return NextResponse.json({ success: false, message: "Product ID required" });

        const update = {};
        if (price !== undefined) update.price = Number(price);
        if (offerPrice !== undefined) update.offerPrice = Number(offerPrice);

        if (Object.values(update).some((v) => Number.isNaN(v) || v < 0)) {
            return NextResponse.json({ success: false, message: "Prices must be valid non-negative numbers" });
        }
        if (!Object.keys(update).length) {
            return NextResponse.json({ success: false, message: "Nothing to update" });
        }

        await connectDB();
        const product = await Product.findByIdAndUpdate(productId, { $set: update }, { new: true });
        if (!product) return NextResponse.json({ success: false, message: "Product not found" });

        return NextResponse.json({ success: true, product });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
