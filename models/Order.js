import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
        }
    ],
    amount: { type: Number, required: true },
    address: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
    status: { type: String, default: "Order Placed" },
    paymentType: { type: String, default: "Online" },
    isPaid: { type: Boolean, default: false },
    // Paystack gives every transaction a unique reference code.
    // We save it here so when Paystack sends the webhook,
    // we can find the right order and mark it as paid.
    paystackReference: { type: String, default: "" },
    date: { type: Number, required: true },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
