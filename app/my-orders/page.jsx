'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

const MyOrders = () => {
    const { currency, getToken, user } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get("/api/order/list", {
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
        if (user) fetchOrders();
    }, [user]);

    return (
        <div className="bg-black min-h-screen">
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
                <div className="space-y-5">
                    <h2 className="text-lg font-medium mt-6 text-white">My Orders</h2>
                    {loading ? <Loading /> : (
                        <div className="max-w-5xl border-t border-gray-800 text-sm">
                            {orders.length === 0 && (
                                <p className="py-10 text-center text-gray-500">No orders yet.</p>
                            )}
                            {orders.map((order, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-800">
                                    <div className="flex-1 flex gap-5 max-w-80">
                                        <Image className="max-w-16 max-h-16 object-cover brightness-0 invert" src={assets.box_icon} alt="box_icon" />
                                        <p className="flex flex-col gap-3">
                                            <span className="font-medium text-base text-white">
                                                {order.items.map((item) => item.product?.name + ` x ${item.quantity}`).join(", ")}
                                            </span>
                                            <span className="text-gray-400">Items : {order.items.length}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="flex flex-col gap-1 text-gray-400">
                                            <span className="font-medium text-white">{order.address?.fullName}</span>
                                            <span>{order.address?.area}</span>
                                            <span>{`${order.address?.city}, ${order.address?.state}`}</span>
                                            <span>{order.address?.phoneNumber}</span>
                                        </p>
                                    </div>
                                    <p className="font-medium my-auto text-white">{currency}{order.amount}</p>
                                    <div className="flex flex-col gap-1 my-auto text-gray-400">
                                        <span>Date: {new Date(order.date).toLocaleDateString()}</span>
                                        <span>Method: {order.paymentType}</span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${
                                            order.isPaid
                                                ? "bg-green-900/50 text-green-400"
                                                : "bg-yellow-900/50 text-yellow-400"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${order.isPaid ? "bg-green-500" : "bg-yellow-500"}`} />
                                            {order.isPaid ? "Paid" : "Awaiting Payment"}
                                        </span>
                                        <span className="text-gray-500 text-xs">{order.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default MyOrders;
