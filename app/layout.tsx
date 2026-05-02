import type { Metadata } from "next";
import { Space_Grotesk, Inter, Noto_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import WalletConnectionProvider from "./components/WalletProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "DEBTIFY | Conquer Your Debt",
  description:
    "AI debt coaching with accountability staking on Stellar. Analyze liabilities, execute a focused plan, and eliminate debt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("[RootLayout] Rendering...");
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${inter.variable} ${notoSerif.variable}`}
    >
      <head>
      </head>
      <body>
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <WalletConnectionProvider>
            {children}
          </WalletConnectionProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
