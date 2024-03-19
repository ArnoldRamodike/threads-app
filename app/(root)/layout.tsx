import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import TopBar from "@/components/shared/TopBar";
import Leftsidebar from "@/components/shared/Leftsidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import BottomBar from "@/components/shared/BottomBar";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Threads',
  description:'A Next.js 14 Meta Thereads Application',
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={inter.className}>
        <TopBar/>
        <main className="flex flex-row">
          <Leftsidebar/>
          <section className="main-container">
            <div className="w-fill max-w-4xl">
               {children}
            </div>
          </section>
          <RightSidebar/>
        </main>
       
        <BottomBar/>
      </body>
    </html>
    </ClerkProvider>
  );
}
