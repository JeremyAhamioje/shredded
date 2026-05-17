import { connectDB } from "@/config/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { inngest } from "@/config/inngest";
import { notifyPaymentSuccess, notifyPaymentFailed } from "@/lib/notify";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const { reference, orderId } = await request.json();
        if (!reference || !orderId) {
            return NextResponse.json({ success: false, message: "Missing reference or orderId" });
        }

        const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        });

        const paystackData = await paystackRes.json();
        const paymentStatus = paystackData.data?.status;

        await connectDB();
        const order = await Order.findById(orderId);
        if (!order) return NextResponse.json({ success: false, message: "Order not found" });
        if (order.userId !== userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        // Webhook already handled it — just tell the frontend it's paid
        if (order.isPaid) {
            return NextResponse.json({ success: true, isPaid: true });
        }

        if (paymentStatus === "success") {
            await Order.findByIdAndUpdate(orderId, {
                isPaid: true,
                status: "Payment Confirmed",
                paystackReference: reference,
            });
            await User.findByIdAndUpdate(userId, { cartItems: {} });
            await inngest.send({
                name: "order/created",
                data: { orderId, userId, amount: order.amount },
            });
            // Only email if webhook didn't already (webhook would have set isPaid)
            await notifyPaymentSuccess(order);
            return NextResponse.json({ success: true, isPaid: true });
        }

        // Payment failed or abandoned — notify owner, don't bother them again next poll
        if (paymentStatus === "failed" || paymentStatus === "abandoned") {
            await notifyPaymentFailed(order, paymentStatus);
        }

        return NextResponse.json({ success: true, isPaid: false });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
