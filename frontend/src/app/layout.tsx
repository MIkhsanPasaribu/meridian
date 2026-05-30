import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Meridian — Supply Chain ESG Intelligence",
  description:
    "Autonomous supply chain compliance intelligence. Meridian reads signals nobody has seen, from places nobody could reach.",
  icons: {
    icon: "/meridian-logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-[#080A0F] text-[#E8EDF5]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
