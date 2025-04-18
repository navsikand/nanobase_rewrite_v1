import "./globals.css";
import { Inter } from "next/font/google";

import { Navbar } from "@/components/Navbar";
import type { Metadata } from "next";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Nanobase",
  description: "A repository for DNA/RNA nanotechnology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} mb-20 flex min-h-screen bg-indigo-50/90`}
      >
        <div className="flex w-full flex-1 flex-col">
          <Navbar />
          <div className="flex flex-1 flex-col">
            <span className="flex-1">{children}</span>
          </div>
        </div>
      </body>
    </html>
  );
}
