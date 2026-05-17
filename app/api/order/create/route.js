import { connectDB } from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Address from "@/models/Address";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { notifyOrderPlaced } from "@/lib/notify";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const { addressId, cartItems } = await request.json();
        if (!addressId || !cartItems || Object.keys(cartItems).length === 0) {
            return NextResponse.json({ success: false, message: "Missing address or cart items" });
        }

        await connectDB();
        Address.find();
        Product.find();

        const items = Object.entries(cartItems).map(([productId, quantity]) => ({
            product: productId,
            quantity,
        }));

        const productIds = Object.keys(cartItems);
        const products = await Product.find({ _id: { $in: productIds } });
        const amount = products.reduce((total, product) => {
            return total + product.offerPrice * cartItems[product._id.toString()];
        }, 0);

        const order = await Order.create({
            userId,
            items,
            amount,
            address: addressId,
            paymentType: "Online",
            isPaid: false,
            date: Date.now(),
        });

        // Email the owner — get customer's email from Clerk then fire notify
        // Wrapped in try/catch so a Resend hiccup never breaks the order
        try {
            const clerk = await clerkClient();
            const u = await clerk.users.getUser(userId);
            const email = u.emailAddresses?.[0]?.emailAddress;
            await notifyOrderPlaced(order, email);
        } catch (e) {
            console.error("Notify failed:", e);
        }

        return NextResponse.json({ success: true, orderId: order._id.toString() });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
