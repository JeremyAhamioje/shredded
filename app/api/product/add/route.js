import { connectDB } from "@/config/db";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using env vars you set up
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Only sellers can call this. Images are uploaded to Cloudinary, 
// then the returned URLs + product info are saved in MongoDB
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const isSeller = await authSeller(userId);
        if (!isSeller) return NextResponse.json({ success: false, message: "Not authorized" });

        const formData = await request.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const category = formData.get("category");
        const price = formData.get("price");
        const offerPrice = formData.get("offerPrice");

        // Upload each image file to Cloudinary and collect back the URLs
        const imageFiles = formData.getAll("images");
        const uploadedImages = await Promise.all(
            imageFiles.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "quickcart" },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    );
                    stream.end(buffer);
                });
            })
        );

        await connectDB();
        const product = await Product.create({
            name,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            image: uploadedImages,
            date: Date.now(),
        });

        return NextResponse.json({ success: true, message: "Product added", product });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
