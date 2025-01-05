import React from "react";
import { Provider } from "@/components/ui/provider";
import { Header } from "./header";
import Head from "next/head";

export const metadata = {
  title: "WebRTC Video Streaming",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          <Header />
          {children}
        </Provider>
      </body>
    </html>
  );
}
