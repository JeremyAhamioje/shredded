'use client'
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppContextProvider = (props) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY;
    const router = useRouter();
    const { user } = useUser();
    const { getToken } = useAuth();

    const [products, setProducts] = useState([]);
    const [userData, setUserData] = useState(false);
    const [isSeller, setIsSeller] = useState(false);
    const [cartItems, setCartItems] = useState({});

    // Fetches all products from MongoDB (public, no auth needed)
    const fetchProductData = async () => {
        try {
            const { data } = await axios.get("/api/product/list");
            if (data.success) {
                setProducts(data.products);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetches logged-in user's data from MongoDB + sets isSeller + restores cart
    const fetchUserData = async () => {
        try {
            if (user.publicMetadata.role === "seller") {
                setIsSeller(true);
            }
            const token = await getToken();
            const { data } = await axios.get("/api/user/data", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setUserData(data.user);
                setCartItems(data.user.cartItems || {});
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Adds 1 of an item to cart, then syncs the whole cart object to MongoDB
    const addToCart = async (itemId) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = (cartData[itemId] || 0) + 1;
        setCartItems(cartData);
        if (user) {
            try {
                const token = await getToken();
                await axios.post("/api/cart/update",
                    { cartData },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success("Item added to cart");
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    // Updates quantity (or removes item if quantity=0), then syncs to MongoDB
    const updateCartQuantity = async (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);
        if (user) {
            try {
                const token = await getToken();
                await axios.post("/api/cart/update",
                    { cartData },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success("Cart updated");
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const getCartCount = () => {
        return Object.values(cartItems).reduce((total, qty) => total + (qty > 0 ? qty : 0), 0);
    };

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            const itemInfo = products.find((product) => product._id === itemId);
            if (itemInfo && cartItems[itemId] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[itemId];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    };

    useEffect(() => {
        fetchProductData();
    }, []);

    useEffect(() => {
        if (user) fetchUserData();
    }, [user]);

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
