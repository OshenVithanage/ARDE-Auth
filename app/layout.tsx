import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARDE Auth",
  description: "Authenticate your Garnic apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
