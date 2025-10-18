import type { Metadata } from "next";
import { Lato, Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/home/Navbar";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { Footer } from "@/components/home/Footer";

const fontPoppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontMont = Montserrat({
  variable: "--font-mont",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontLato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Forbes Digital Lifeline - Your digital sos.",
  description: "Your one-stop line for all digital products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontPoppins.variable} ${fontMont.variable} ${fontLato.variable} antialiased transition-colors duration-500 overflow-x-hidden`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}