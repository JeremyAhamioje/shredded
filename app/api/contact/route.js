import { NextResponse } from "next/server";
import { notifyContactMessage } from "@/lib/notify";

export async function POST(request) {
    try {
        const { name, email, subject, message } = await request.json();

        if (!name || !email || !email.includes("@") || !subject || !message) {
            return NextResponse.json({ success: false, message: "All fields are required" });
        }

        await notifyContactMessage({ name, email, subject, message });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
