import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "./components/messaging";
import { AuthProvider } from "./contexts/AuthContext";

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
        <AuthProvider>
          <ToastProvider maxMessages={3}>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
