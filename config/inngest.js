import { Inngest } from "inngest";
import { connectDB } from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "shreddedEcommerce-next" });

// Inngest Function to save user to a database
export const syncUserCreation = inngest.createFunction(
  { name: "Sync User Creation", id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_addresses?.[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url,
    };

    await connectDB();
    await User.create(userData);
  }
);

// Inngest Function to update user data in the database
export const syncUserUpdation = inngest.createFunction(
  { name: "Sync User Update", id: "sync-user-update-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_addresses?.[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url,
    };

    await connectDB();
    await User.findByIdAndUpdate(id, userData);
  }
);

// Inngest function to delete user from the database when deleted in Clerk
export const syncUserDeletion = inngest.createFunction(
  { name: "Sync User Deletion", id: "sync-user-deletion-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    await connectDB();
    await User.findByIdAndDelete(id);
  }
);