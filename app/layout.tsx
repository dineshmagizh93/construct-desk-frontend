import * as React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { NavigationLoading } from "@/components/ui/navigation-loading"
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "ConstructDesk",
  description: "ConstructDesk Dashboard",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <NavigationLoading />
          {children}
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}

