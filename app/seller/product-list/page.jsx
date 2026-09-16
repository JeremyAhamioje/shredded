'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

const ProductList = () => {
    const { router, getToken, user, currency } = useAppContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({ name: "", price: "", offerPrice: "" });
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Fetches all products from MongoDB - seller-only route
    const fetchSellerProduct = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get("/api/product/seller-list", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setProducts(data.products);
                setLoading(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const startEdit = (product) => {
        setEditingId(product._id);
        setEditValues({ name: product.name, price: product.price, offerPrice: product.offerPrice });
    };

    const handleSave = async (productId) => {
        if (!String(editValues.name).trim()) return toast.error("Name can't be empty");
        setSaving(true);
        try {
            const token = await getToken();
            const { data } = await axios.post("/api/product/update",
                { productId, name: editValues.name, price: Number(editValues.price), offerPrice: Number(editValues.offerPrice) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setProducts((prev) => prev.map((p) =>
                    p._id === productId ? { ...p, name: data.product.name, price: data.product.price, offerPrice: data.product.offerPrice } : p));
                setEditingId(null);
                toast.success("Product updated");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (productId) => {
        try {
            const token = await getToken();
            const { data } = await axios.delete(`/api/product/delete?id=${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setProducts((prev) => prev.filter((p) => p._id !== productId));
                toast.success("Product deleted");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeleteTarget(null);
        }
    };

    useEffect(() => {
        if (user) fetchSellerProduct();
    }, [user]);

    const iconBtn = "flex items-center justify-center gap-1 p-2 md:px-3 rounded-md text-white text-xs";

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between">
            {loading ? <Loading /> : (
                <div className="w-full md:p-10 p-4">
                    <h2 className="pb-4 text-lg font-medium">All Products</h2>
                    <div className="max-w-4xl w-full overflow-x-auto rounded-md bg-gray-900 border border-gray-700">
                        <table className="min-w-full">
                            <thead className="text-gray-300 text-sm text-left">
                                <tr>
                                    <th className="px-3 md:px-4 py-3 font-medium">Product</th>
                                    <th className="px-4 py-3 font-medium max-sm:hidden">Category</th>
                                    <th className="px-3 md:px-4 py-3 font-medium">Price</th>
                                    <th className="px-3 md:px-4 py-3 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-400">
                                {products.map((product) => {
                                    const editing = editingId === product._id;
                                    return (
                                        <tr key={product._id} className="border-t border-gray-700 align-top">
                                            <td className="px-3 md:px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gray-800 rounded p-1.5 shrink-0">
                                                        <Image src={product.image[0]} alt={product.name}
                                                            className="w-12 h-12 object-contain" width={48} height={48} />
                                                    </div>
                                                    {editing ? (
                                                        <input type="text" value={editValues.name}
                                                            onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                                                            className="w-40 md:w-64 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white" />
                                                    ) : (
                                                        <span className="line-clamp-2 max-w-[9rem] md:max-w-none">{product.name}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 max-sm:hidden">{product.category}</td>
                                            <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                                                {editing ? (
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="flex items-center gap-1">
                                                            <span className="text-[10px] uppercase text-gray-500 w-8">Now</span>
                                                            <input type="number" min="0" value={editValues.offerPrice}
                                                                onChange={(e) => setEditValues((v) => ({ ...v, offerPrice: e.target.value }))}
                                                                className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white" />
                                                        </label>
                                                        <label className="flex items-center gap-1">
                                                            <span className="text-[10px] uppercase text-gray-500 w-8">Was</span>
                                                            <input type="number" min="0" value={editValues.price}
                                                                onChange={(e) => setEditValues((v) => ({ ...v, price: e.target.value }))}
                                                                className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-300" />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="text-white">{currency}{product.offerPrice.toLocaleString()}</span>
                                                        {product.price > product.offerPrice && (
                                                            <span className="text-xs text-gray-500 line-through">{currency}{product.price.toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 md:px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    {editing ? (
                                                        <>
                                                            <button onClick={() => handleSave(product._id)} disabled={saving}
                                                                className={`${iconBtn} bg-green-600 hover:bg-green-700 text-white disabled:opacity-60`}>
                                                                {saving ? "Saving…" : "Save"}
                                                            </button>
                                                            <button onClick={() => setEditingId(null)} disabled={saving}
                                                                className={`${iconBtn} bg-gray-700`}>Cancel</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => startEdit(product)} title="Edit price"
                                                                className={`${iconBtn} bg-gray-700 hover:bg-gray-600`}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                <span className="hidden md:block">Edit</span>
                                                            </button>
                                                            <button onClick={() => router.push(`/product/${product._id}`)} title="Visit"
                                                                className={`${iconBtn} bg-gray-700 hover:bg-gray-600`}>
                                                                <Image className="h-3.5 w-3.5 brightness-0 invert" src={assets.redirect_icon} alt="visit" />
                                                                <span className="hidden md:block">Visit</span>
                                                            </button>
                                                            <button onClick={() => setDeleteTarget(product)} title="Delete"
                                                                className={`${iconBtn} bg-red-600 hover:bg-red-700`}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                <span className="hidden md:block">Delete</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setDeleteTarget(null)}>
                    <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-lg p-6"
                        onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-medium text-white">Delete product?</h3>
                        <p className="mt-2 text-sm text-gray-400 break-words">
                            &ldquo;{deleteTarget.name}&rdquo; will be permanently removed. This can&apos;t be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-sm rounded-md bg-gray-700 text-white hover:bg-gray-600">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteTarget._id)}
                                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ProductList;
