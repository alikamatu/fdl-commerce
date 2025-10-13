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
  title: "TechStore - Your One-Stop Tech Shop",
  description: "Your one-stop shop for all tech products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontPoppins.variable} ${fontMont.variable} ${fontLato.variable} antialiased transition-colors duration-500`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {/* <div className="flex min-w-screen min-h-screen items-center justify-center bg-white font-sans text-black dark:bg-black dark:text-white">
                <p className="mont text-4xl">Website is under development!!!</p>
              </div> */}
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