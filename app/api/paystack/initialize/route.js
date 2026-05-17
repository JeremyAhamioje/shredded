import { connectDB } from "@/config/db";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Step 2 of 2 in the payment flow.
// Receives the orderId from the frontend, calls Paystack's API to create
// a payment session, and returns a URL that we redirect the customer to.
//
// Why call Paystack from the SERVER and not directly from the browser?
// Because your SECRET key would be exposed if you called Paystack from the browser.
// The server calls Paystack secretly, gets back a payment URL, and passes just the URL to the browser.
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const { orderId } = await request.json();
        await connectDB();

        const order = await Order.findById(orderId).populate("address");
        if (!order) return NextResponse.json({ success: false, message: "Order not found" });
        if (order.userId !== userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        // Paystack expects amount in KOBO (smallest Nigerian currency unit)
        // So ₦1,000 = 100,000 kobo. We multiply by 100.
        const amountInKobo = Math.round(order.amount * 100);

        // Derive the base URL from the live request so the callback always
        // matches the domain the user is on — critical for ngrok dev tunnels
        // where the subdomain changes every restart and the env var goes stale.
        const proto = request.headers.get("x-forwarded-proto") || "https";
        const host = request.headers.get("host");
        const baseUrl = `${proto}://${host}`;

        // Call Paystack's API to create a payment session
        const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // Paystack needs an email to send the receipt to.
                // We use the address holder's name + a placeholder since we don't store email separately.
                // In production you'd pass the user's real email from Clerk.
                email: `${userId}@quickcart.app`,
                amount: amountInKobo,
                currency: "NGN",
                // callback_url is where Paystack sends the customer BACK after they pay.
                // We include the orderId in the URL so we know which order to verify.
                callback_url: `${baseUrl}/payment-success?orderId=${orderId}`,
                metadata: {
                    orderId: orderId,
                    userId: userId,
                },
            }),
        });

        const paystackData = await paystackResponse.json();

        if (!paystackData.status) {
            return NextResponse.json({ success: false, message: paystackData.message });
        }

        // Save the Paystack reference to our order in MongoDB.
        // When the webhook arrives later, it includes this reference
        // so we can find the right order and mark it paid.
        await Order.findByIdAndUpdate(orderId, {
            paystackReference: paystackData.data.reference,
        });

        // Return the Paystack-hosted payment URL to the frontend
        return NextResponse.json({
            success: true,
            paymentUrl: paystackData.data.authorization_url,
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
