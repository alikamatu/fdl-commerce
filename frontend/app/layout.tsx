import type { Metadata } from "next";
import { Lato, Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/home/Navbar";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { Footer } from "@/components/home/Footer";
import Script from "next/script";
import GoogleTagManager from "@/components/analytics/GoogleTagManager";
import GoogleTagManagerNoScript from "@/components/analytics/GoogleTagManagerNoScript";

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
  keywords: ["tech products", "electronics", "gadgets", "digital lifeline", "Forbes Digital Lifeline", "tech support", "device repair", "laptops", "phones", "accessories"],
  authors: [{ name: "Forbes Digital Lifeline" }],
  creator: "Forbes Digital Lifeline",
  publisher: "Forbes Digital Lifeline",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Forbes Digital Lifeline - Your Digital SOS.",
    description: "Forbes Digital Lifeline is your trusted source for all things tech. When your digital world throws you a curveball, we are your Digital SOS. We are the expert tech team ready to rescue your devices and get you back online, fast and reliably.",
    url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com',
    siteName: 'Forbes Digital Lifeline',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/logo/logo.png`,
        width: 1200,
        height: 630,
        alt: 'Forbes Digital Lifeline Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Forbes Digital Lifeline - Your Digital SOS.",
    description: "Forbes Digital Lifeline is your trusted source for all things tech.",
    images: [`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/logo/logo.png`],
    creator: '@forbesdigitals',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code', // Add your Google verification code
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
        <GoogleTagManager />
        <GoogleTagManagerNoScript />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="overflow-x-hidden">
                <Navbar />
                      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="lazyOnload"
      />
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