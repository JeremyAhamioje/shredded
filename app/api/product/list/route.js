import { connectDB } from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

// Always hit the DB so price/name edits show up everywhere immediately.
export const dynamic = "force-dynamic";

// Public endpoint - no auth needed. Returns all products for the shop page
export async function GET() {
    try {
        await connectDB();
        const products = await Product.find({});
        return NextResponse.json({ success: true, products });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
