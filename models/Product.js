import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // Stable identifiers for the static showcase cards (New Drop / Trending) that
    // link to this product. Unlike `name`, these never change on a rename, so the
    // homepage cards keep matching. An array because one product can appear in
    // more than one showcase (e.g. both New Drop and Trending).
    skus: { type: [String], index: true, default: undefined },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    date: { type: Number, required: true },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
