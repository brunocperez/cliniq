import { Check } from "lucide-react";
import { LandingButton } from "@/components/landing/LandingButton";

const FEATURES = [
  "Agenda e agendamento online",
  "Lembretes automáticos por WhatsApp",
  "Cadastro de pacientes e serviços",
  "Métricas e relatórios em tempo real",
  "Suporte por e-mail e WhatsApp",
];

export function Pricing() {
  return (
    <section id="preco" className="bg-[var(--surface-card)]">
      <div className="mx-auto max-w-[1120px] px-6 py-22">
        <div className="mx-auto mb-11 max-w-[42em] text-center">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--text-strong)]">
            Um preço simples e justo
          </h2>
          <p className="mt-3.5 text-lg text-[var(--text-muted)]">
            Tudo incluído. Sem taxas escondidas, sem surpresas.
          </p>
        </div>
        <div className="mx-auto max-w-[420px] overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] shadow-[0_12px_36px_rgba(16,24,40,0.06)]">
          <div className="border-b border-[var(--border-divider)] p-8 text-center">
            <div className="text-xs font-medium uppercase tracking-[0.06em] text-cliniq-600">
              Plano único
            </div>
            <div className="mt-3.5 flex items-baseline justify-center gap-1">
              <span className="text-2xl text-[var(--text-muted)]">R$</span>
              <span className="text-[56px] font-semibold leading-none tracking-tight text-[var(--text-strong)]">99</span>
              <span className="text-base text-[var(--text-muted)]">/mês</span>
            </div>
            <p className="mt-2.5 text-sm text-[var(--text-muted)]">por clínica · profissionais ilimitados</p>
          </div>
          <div className="px-8 py-7">
            <ul className="flex flex-col gap-3.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--text-body)]">
                  <Check className="h-[18px] w-[18px] shrink-0 text-cliniq-600" />
                  {f}
                </li>
              ))}
            </ul>
            <LandingButton href="/cadastro" size="lg" className="mt-6.5 w-full">
              Começar teste grátis
            </LandingButton>
            <p className="mt-3.5 text-center text-xs text-[var(--text-faint)]">
              30 dias grátis · sem cartão de crédito
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}