import type React from "react";
import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Markdown View Article - ドキュメント閲覧",
  description: "GitHub リポジトリから Markdown ファイルを取得し、静的サイトとして配信します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          // ペイント前にテーマを適用して FOUC を防ぐ
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark';}catch(e){document.documentElement.dataset.theme='dark';}})();`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${notoSansJp.variable} antialiased flex flex-col min-h-screen bg-background text-foreground selection:bg-teal-500/30 transition-colors duration-500`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
