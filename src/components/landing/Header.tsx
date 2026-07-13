'use client'

import Image from "next/image"
import Link from "next/link"
import { LandingButton } from "@/components/landing/LandingButton"
import ThemeToggle from "@/components/ThemeToggle"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

const NAV = [
  { href: "#beneficios", label: "Benefícios" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#preco", label: "Preço" },
]

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb)
  return () => window.removeEventListener('storage', cb)
}

function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}

export function Header() {
  const { theme } = useTheme()
  const isClient = useIsClient()
  const isDark = isClient && theme === 'dark'

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      borderBottom: '1px solid var(--border-default)',
      background: isDark ? 'rgba(22,29,27,0.9)' : 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div className="mx-auto flex max-w-[1120px] items-center gap-8 px-6 py-3.5">
        <Image
          src={isDark ? "/logo-dark-mode.svg" : "/logo.svg"}
          alt="Cliniq"
          width={120}
          height={30}
          priority
        />
        <nav className="ml-2 flex gap-7">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-body)]">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3.5">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-[var(--text-body)] hover:text-[var(--text-strong)]">
            Entrar
          </Link>
          <LandingButton href="/cadastro" size="sm">
            Teste grátis
          </LandingButton>
        </div>
      </div>
    </header>
  )
}