import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"
import { NotificationProvider } from "@/lib/notification-context"
import { LibraryProvider } from "@/lib/library-context"
import { ConfirmationProvider } from "@/components/confirmation-modal"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LibraryHub - Smart Library Management",
  description: "Modern library management system with AI recommendations, reputation scoring, and smart reservations",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <ConfirmationProvider>
              <LibraryProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </LibraryProvider>
            </ConfirmationProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
