import "./globals.css";
import { Inter } from "next/font/google";

import { TopNavbar } from "@/components/TopNavbar";
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
      {/* <body className="min-h-screen flex bg-gradient-to-r from-purple-500/15 to-blue-500/15"> */}
      <body
        //className={`${inter.className} min-h-screen flex bg-gradient-to-r from-indigo-200/50 via-purple-200/50 to-pink-200/50`}
        className={`${inter.className} mb-20 flex min-h-screen bg-sky-50/10`}
      >
        {/* <SidebarNav /> */}
        <div className="flex w-full flex-1 flex-col">
          <TopNavbar />

          <div className="flex flex-1 flex-col">
            <span className="flex-1">{children}</span>

            {/* <Footer /> */}
          </div>
        </div>
      </body>
    </html>
  );
}
