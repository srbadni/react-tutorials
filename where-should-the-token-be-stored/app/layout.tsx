import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token Lab — انتخاب روش نگهداری توکن",
  description: "مقایسهٔ تعاملی چهار روش نگهداری توکن در React با توجه به امنیت و هزینهٔ پیاده‌سازی و نگهداری",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
