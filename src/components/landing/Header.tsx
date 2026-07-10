import Image from "next/image";
import Link from "next/link";
import { LandingButton } from "@/components/landing/LandingButton";

const NAV = [
  { href: "#beneficios", label: "Benefícios" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#preco", label: "Preço" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-default)] bg-white/90 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-[1120px] items-center gap-8 px-6 py-3.5">
        <Image src="/logo.svg" alt="Cliniq" width={120} height={30} priority />
        <nav className="ml-2 flex gap-7">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-body)]">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3.5">
          <Link href="/login" className="text-sm font-medium text-[var(--text-body)] hover:text-[var(--text-strong)]">
            Entrar
          </Link>
          <LandingButton href="/cadastro" size="sm">
            Teste grátis
          </LandingButton>
        </div>
      </div>
    </header>
  );
}