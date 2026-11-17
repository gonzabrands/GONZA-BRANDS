import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gonza Brands | Better brands, built together",
  description: "Connect with the right graphic designer, share your brief, and bring your brand to life.",
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
