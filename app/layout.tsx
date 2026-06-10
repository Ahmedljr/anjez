import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "@/styles/globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "أنجز | Anjez",
  description: "منصة إنتاجية تساعدك على تحديد ما الذي يجب أن تفعله الآن",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
