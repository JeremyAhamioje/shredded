'use client'
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "@/lib/axios";

const PaymentSuccessContent = () => {
    const { router, getToken, setCartItems } = useAppContext();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    // Paystack also puts the reference in the URL as ?reference=xxx or ?trxref=xxx
    const paystackRef = searchParams.get("reference") || searchParams.get("trxref");

    const [status, setStatus] = useState("checking");

    useEffect(() => {
        if (!orderId) { router.push("/"); return; }

        let attempts = 0;

        const checkPayment = async () => {
            try {
                const token = await getToken();

                // First: check if webhook already flipped isPaid to true in our DB
                const { data } = await axios.get(`/api/order/status?orderId=${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (data.isPaid) {
                    setStatus("paid");
                    setCartItems({});
                    return;
                }

                attempts++;

                // After 3 failed polls (6 seconds), try manually verifying with Paystack
                // This is the fallback for when ngrok blocks the webhook
                if (attempts === 3 && paystackRef) {
                    const verifyRes = await axios.post("/api/paystack/verify",
                        { reference: paystackRef, orderId },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (verifyRes.data.isPaid) {
                        setStatus("paid");
                        setCartItems({});
                        return;
                    }
                }

                if (attempts < 8) {
                    setTimeout(checkPayment, 2000);
                } else {
                    setStatus("pending");
                }
            } catch (err) {
                setStatus("pending");
            }
        };

        checkPayment();
    }, [orderId]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            {status === "checking" && (
                <div>
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Confirming your payment...</p>
                </div>
            )}
            {status === "paid" && (
                <div className="space-y-4">
                    <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-white">Payment Successful!</h1>
                    <p className="text-gray-400">Your order has been confirmed and is being processed.</p>
                    <button onClick={() => router.push("/my-orders")}
                        className="mt-4 bg-orange-600 text-white px-8 py-3 hover:bg-orange-700">
                        View My Orders
                    </button>
                </div>
            )}
            {status === "pending" && (
                <div className="space-y-4">
                    <div className="w-20 h-20 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-white">Payment Processing</h1>
                    <p className="text-gray-400">Your payment is being confirmed. Check My Orders in a moment.</p>
                    <button onClick={() => router.push("/my-orders")}
                        className="mt-4 bg-orange-600 text-white px-8 py-3 hover:bg-orange-700">
                        View My Orders
                    </button>
                </div>
            )}
        </div>
    );
};

const PaymentSuccess = () => (
    <div className="bg-black min-h-screen">
        <Navbar />
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
        <Footer />
    </div>
);

export default PaymentSuccess;
