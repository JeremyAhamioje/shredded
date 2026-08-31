'use client'
import { useAppContext } from "@/context/AppContext";
import axios from "@/lib/axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {
    const { currency, router, getCartCount, getCartAmount, getToken, user, cartItems } = useAppContext();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userAddresses, setUserAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUserAddresses = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get("/api/user/get-address", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) setUserAddresses(data.addresses);
            else toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        setIsDropdownOpen(false);
    };

    // THE FULL PAYMENT FLOW in one function:
    // 1. Save order to MongoDB (isPaid: false)
    // 2. Ask Paystack for a payment page URL
    // 3. Send customer to that URL
    // 4. Paystack handles card/bank/USSD — we're out of the picture
    // 5. Paystack webhook hits /api/paystack/webhook and marks order paid
    // 6. Paystack redirects customer to /payment-success
    const handlePlaceOrder = async () => {
        if (!selectedAddress) return toast.error("Please select a delivery address");
        if (getCartCount() === 0) return toast.error("Your cart is empty");

        setIsLoading(true);
        try {
            const token = await getToken();

            // Step 1: Create the order in MongoDB
            const orderRes = await axios.post("/api/order/create",
                { addressId: selectedAddress._id, cartItems },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!orderRes.data.success) {
                toast.error(orderRes.data.message);
                setIsLoading(false);
                return;
            }

            const orderId = orderRes.data.orderId;

            // Step 2: Get the Paystack payment URL for this order
            const paystackRes = await axios.post("/api/paystack/initialize",
                { orderId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!paystackRes.data.success) {
                toast.error(paystackRes.data.message);
                setIsLoading(false);
                return;
            }

            // Step 3: Send the customer to Paystack's hosted payment page
            // window.location.href is used instead of router.push because
            // Paystack is an external site — Next.js router only works within your app
            window.location.href = paystackRes.data.paymentUrl;

        } catch (error) {
            toast.error(error.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchUserAddresses();
    }, [user]);

    return (
        <div className="w-full md:w-96 bg-gray-900 border border-gray-800 p-5">
            <h2 className="text-xl md:text-2xl font-medium text-white">Order Summary</h2>
            <hr className="border-gray-800 my-5" />
            <div className="space-y-6">
                <div>
                    <label className="text-base font-medium uppercase text-gray-400 block mb-2">Select Address</label>
                    <div className="relative inline-block w-full text-sm border border-gray-700">
                        <button
                            className="peer w-full text-left px-4 pr-2 py-2 bg-gray-800 text-gray-300 focus:outline-none"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span>
                                {selectedAddress
                                    ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                                    : "Select Address"}
                            </span>
                            <svg className={`w-5 h-5 inline float-right transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {isDropdownOpen && (
                            <ul className="absolute w-full bg-gray-800 border border-gray-700 shadow-md mt-1 z-10 py-1.5">
                                {userAddresses.map((address, index) => (
                                    <li key={index}
                                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-300"
                                        onClick={() => handleAddressSelect(address)}>
                                        {address.fullName}, {address.area}, {address.city}, {address.state}
                                    </li>
                                ))}
                                <li onClick={() => router.push("/add-address")}
                                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-center text-gray-300">
                                    + Add New Address
                                </li>
                            </ul>
                        )}
                    </div>
                </div>

                <div>
                    <label className="text-base font-medium uppercase text-gray-400 block mb-2">Promo Code</label>
                    <div className="flex flex-col items-start gap-3">
                        <input type="text" placeholder="Enter promo code"
                            className="flex-grow w-full outline-none p-2.5 bg-gray-900 text-white border border-gray-700 placeholder-gray-600" />
                        <button className="bg-white text-black px-9 py-2 hover:bg-gray-200">Apply</button>
                    </div>
                </div>

                <hr className="border-gray-800 my-5" />

                <div className="space-y-4">
                    <div className="flex justify-between text-base font-medium">
                        <p className="uppercase text-gray-400">Items {getCartCount()}</p>
                        <p className="text-white">{currency}{getCartAmount().toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-400">Shipping Fee</p>
                        <p className="font-medium text-white">Free</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-400">Tax (2%)</p>
                        <p className="font-medium text-white">{currency}{Math.floor(getCartAmount() * 0.02).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between text-lg md:text-xl font-medium border-t border-gray-800 pt-3">
                        <p className="text-white">Total</p>
                        <p className="text-white">{currency}{(getCartAmount() + Math.floor(getCartAmount() * 0.02)).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full bg-white text-black py-3 mt-5 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Redirecting to payment...
                    </>
                ) : "Place Order & Pay"}
            </button>

            <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
                Free nationwide delivery — 1–3 days in Lagos, 3–7 days other states. See{" "}
                <Link href="/shipping" className="text-gray-300 underline underline-offset-2 hover:text-white">Delivery</Link>
                {" "}&amp;{" "}
                <Link href="/returns" className="text-gray-300 underline underline-offset-2 hover:text-white">Returns</Link>.
            </p>
        </div>
    );
};

export default OrderSummary;
