import { cookies } from "next/headers"
import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { LanguageProvider, type Locale } from "@/contexts/language-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

import { AuthProvider } from "@/contexts/auth-context"
import { OrganizationProvider } from "@/contexts/organization-context"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const initialLocale = (cookieStore.get("locale")?.value || "en") as Locale

  return (
    <html
      lang={initialLocale}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider initialLocale={initialLocale}>
            <AuthProvider>
              <OrganizationProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </OrganizationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
