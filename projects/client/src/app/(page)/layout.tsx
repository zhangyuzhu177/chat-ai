'use client'

import Menu from "../components/Menu";
import Header from "../components/Header";
import { ChatProvider } from "@/contexts/ChatContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChatProvider>
      <div className="h-screen w-full flex">
        <Menu />
        <div className="flex-1 flex flex-col bg-white dark:bg-[#212121]">
          <Header />
          <div className="flex-1 overflow-hidden">
            { children }
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
