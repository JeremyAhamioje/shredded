import { NextResponse } from "next/server";
import { notifyNewSubscriber } from "@/lib/notify";

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json({ success: false, message: "Invalid email" });
        }

        await notifyNewSubscriber(email);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
