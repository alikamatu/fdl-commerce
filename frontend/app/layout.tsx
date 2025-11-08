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
  title: "Forbes Digital Lifeline - Your Digital SOS.",
  description: "Forbes Digital Lifeline is your trusted source for all things tech. When your digital world throws you a curveball, we are your Digital SOS. We are the expert tech team ready to rescue your devices and get you back online, fast and reliably.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
  },
  openGraph: {
    title: "Forbes Digital Lifeline - Your Digital SOS.",
  description: "Forbes Digital Lifeline is your trusted source for all things tech. When your digital world throws you a curveball, we are your Digital SOS. We are the expert tech team ready to rescue your devices and get you back online, fast and reliably.",
  },
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
              <div className="overflow-x-hidden">
                <Navbar />
                <main>{children}</main>
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}