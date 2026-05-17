// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // Clerk user ID
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    cartItems: {
      type: Object,
      default: {},
    },
  },
  { minimize:false, timestamps: true, _id: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;