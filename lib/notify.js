// lib/notify.js
// Sends an email to the shop owner whenever something happens with an order.
// Owner-only — never emails customers from here.
// If Resend isn't configured (e.g. local dev), logs instead of crashing.
// Order flow must never break because the notifier is misconfigured.

async function sendEmail(subject, body) {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.OWNER_EMAIL;

    if (!apiKey || !to) {
        console.log("[notify] not configured, would have sent:", subject);
        return;
    }

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "QuickCart <onboarding@resend.dev>",
                to: [to],
                subject,
                html: `<pre style="font-family:system-ui;font-size:14px">${body}</pre>`,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error("[notify] resend failed:", err);
        }
    } catch (error) {
        console.error("[notify] error:", error);
    }
}

const naira = (n) => `₦${Number(n).toLocaleString()}`;

export async function notifyOrderPlaced(order, customerEmail) {
    await sendEmail(
        `🛒 New order — ${naira(order.amount)}`,
        `NEW ORDER\n` +
        `─────────────\n` +
        `Order ID: ${order._id}\n` +
        `Amount: ${naira(order.amount)}\n` +
        `Customer: ${customerEmail || "unknown"}\n` +
        `Items: ${order.items.length}\n` +
        `Status: Awaiting payment\n` +
        `Date: ${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}`
    );
}

export async function notifyPaymentSuccess(order) {
    await sendEmail(
        `✅ Payment successful — ${naira(order.amount)}`,
        `PAYMENT SUCCESSFUL\n` +
        `─────────────\n` +
        `Order ID: ${order._id}\n` +
        `Amount: ${naira(order.amount)}\n` +
        `Time to ship!\n` +
        `Date: ${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}`
    );
}

export async function notifyPaymentFailed(order, reason) {
    await sendEmail(
        `❌ Payment failed — ${naira(order.amount)}`,
        `PAYMENT FAILED\n` +
        `─────────────\n` +
        `Order ID: ${order._id}\n` +
        `Amount: ${naira(order.amount)}\n` +
        `Reason: ${reason || "unknown"}\n` +
        `Date: ${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}`
    );
}

export async function notifyNewSubscriber(email) {
    await sendEmail(
        `📬 New newsletter subscriber`,
        `NEW SUBSCRIBER\n` +
        `─────────────\n` +
        `Email: ${email}\n` +
        `Date: ${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}`
    );
}

export async function notifyContactMessage({ name, email, subject, message }) {
    await sendEmail(
        `✉️ Contact form — ${subject}`,
        `CONTACT FORM MESSAGE\n` +
        `─────────────\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Subject: ${subject}\n` +
        `Message:\n${message}\n` +
        `─────────────\n` +
        `Date: ${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}`
    );
}
