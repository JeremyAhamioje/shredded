import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  metadataBase: new URL("https://shreddedmotion.store"),
  title: "Shredded Motion",
  description:
    "Premium performance gymwear and compression apparel — built for the 1%. Nationwide delivery across Nigeria.",
  openGraph: {
    title: "Shredded Motion",
    description:
      "Premium performance gymwear and compression apparel — built for the 1%. Nationwide delivery across Nigeria.",
    url: "https://shreddedmotion.store",
    siteName: "Shredded Motion",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shredded Motion",
    description:
      "Premium performance gymwear and compression apparel — built for the 1%.",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      {/* suppressHydrationWarning: some browser extensions (e.g. TokenPocket adds
          data-tp-bcm-channel) inject attributes on <html>/<body> before React
          hydrates, which is harmless but triggers a hydration warning. */}
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="antialiased bg-black text-white" suppressHydrationWarning>
          <Toaster />
          <AppContextProvider>
            {children}
          </AppContextProvider>
        </body>
      </html>
      </ClerkProvider>
  );
}
