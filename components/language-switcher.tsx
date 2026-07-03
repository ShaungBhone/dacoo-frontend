"use client"

import { Globe } from "lucide-react"
import { useTranslation, type Locale } from "@/contexts/language-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()

  const languages: { code: Locale; name: string; flag: string }[] = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "my", name: "မြန်မာ", flag: "🇲🇲" },
  ]

  const activeLanguage = languages.find((lang) => lang.code === locale) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 hover:bg-accent hover:text-accent-foreground">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium">{activeLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[120px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className="flex items-center justify-between cursor-pointer text-xs"
            onClick={() => setLocale(lang.code)}
          >
            <span>{lang.name}</span>
            <span>{lang.flag}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
