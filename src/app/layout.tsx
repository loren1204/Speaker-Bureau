import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"

export const metadata: Metadata = {
  metadataBase: new URL("https://lee-speakers-bureau.vercel.app"),
  title: {
    default: "Lee Health Speakers Bureau",
    template: "%s | Lee Health Speakers Bureau",
  },
  description: "Browse and connect with Lee Health community education speakers.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
