import { connectDB } from "@/config/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { inngest } from "@/config/inngest";
import { notifyPaymentSuccess, notifyPaymentFailed } from "@/lib/notify";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
    try {
        const body = await request.text();
        const signature = request.headers.get("x-paystack-signature");

        const hash = crypto
            .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
            .update(body)
            .digest("hex");

        if (hash !== signature) {
            return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
        }

        const event = JSON.parse(body);

        // Payment succeeded — mark order paid and email the owner
        if (event.event === "charge.success") {
            const reference = event.data.reference;
            await connectDB();

            const order = await Order.findOne({ paystackReference: reference });
            if (!order) {
                return NextResponse.json({ message: "Order not found" }, { status: 404 });
            }

            await Order.findByIdAndUpdate(order._id, {
                isPaid: true,
                status: "Payment Confirmed",
            });

            await User.findByIdAndUpdate(order.userId, { cartItems: {} });

            await inngest.send({
                name: "order/created",
                data: {
                    orderId: order._id.toString(),
                    userId: order.userId,
                    amount: order.amount,
                },
            });

            // Email owner: "money arrived, time to ship"
            await notifyPaymentSuccess(order);
        }

        // Payment failed — email the owner so they know
        if (event.event === "charge.failed") {
            const reference = event.data?.reference;
            if (reference) {
                await connectDB();
                const order = await Order.findOne({ paystackReference: reference });
                if (order) {
                    await notifyPaymentFailed(order, event.data?.gateway_response);
                }
            }
        }

        // Always 200 — if we return an error Paystack retries for hours
        return NextResponse.json({ message: "ok" }, { status: 200 });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
