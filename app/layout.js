import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "Shreddded-Gymwear",
  description: "Gymwear and fitness apparel for the modern athlete.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      {/* suppressHydrationWarning: some browser extensions (e.g. TokenPocket adds
          data-tp-bcm-channel) inject attributes on <html>/<body> before React
          hydrates, which is harmless but triggers a hydration warning. */}
      <html lang="en" suppressHydrationWarning>
        <body className={`${outfit.className} antialiased bg-black text-white`} suppressHydrationWarning>
          <Toaster />
          <AppContextProvider>
            {children}
          </AppContextProvider>
        </body>
      </html>
      </ClerkProvider>
  );
}
