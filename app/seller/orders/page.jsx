'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

const Orders = () => {
    const { currency, getToken, user } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellerOrders = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get("/api/order/seller-orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setOrders(data.orders.reverse());
                setLoading(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (user) fetchSellerOrders();
    }, [user]);

    return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
            {loading ? <Loading /> : (
                <div className="md:p-10 p-4 space-y-5">
                    <h2 className="text-lg font-medium">Orders ({orders.length})</h2>
                    <div className="max-w-4xl rounded-md">
                        {orders.length === 0 && (
                            <p className="text-gray-400">No orders yet.</p>
                        )}
                        {orders.map((order, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-800">
                                <div className="flex-1 flex gap-5 max-w-80">
                                    <Image className="max-w-16 max-h-16 object-cover brightness-0 invert" src={assets.box_icon} alt="box_icon" />
                                    <p className="flex flex-col gap-2">
                                        <span className="font-medium text-white">
                                            {order.items.map((item) => item.product?.name + ` x ${item.quantity}`).join(", ")}
                                        </span>
                                        <span className="text-gray-400">Items: {order.items.length}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-white">{order.address?.fullName}</span>
                                    <span className="text-gray-400">{order.address?.area}</span>
                                    <span className="text-gray-400">{order.address?.city}, {order.address?.state}</span>
                                    <span className="text-gray-400">{order.address?.phoneNumber}</span>
                                </div>
                                <p className="font-medium my-auto text-white">{currency}{order.amount}</p>
                                <div className="flex flex-col gap-2 my-auto">
                                    <span className="text-gray-400">Date: {new Date(order.date).toLocaleDateString()}</span>
                                    {/* Green = money received. Yellow = order placed but not paid yet */}
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${
                                        order.isPaid
                                            ? "bg-green-900/50 text-green-400"
                                            : "bg-yellow-900/50 text-yellow-400"
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${order.isPaid ? "bg-green-500" : "bg-yellow-500"}`} />
                                        {order.isPaid ? "Paid" : "Awaiting Payment"}
                                    </span>
                                    <span className="text-gray-400 text-xs">{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Orders;
