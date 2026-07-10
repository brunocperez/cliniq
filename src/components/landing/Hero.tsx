import { Stethoscope, CheckCircle2, Calendar, TrendingDown } from "lucide-react";
import { LandingButton } from "@/components/landing/LandingButton";

const APPTS = [
  { name: "Mariana Costa", info: "09:00 · Limpeza", status: "confirmado" as const },
  { name: "João Ribeiro", info: "10:30 · Canal", status: "agendado" as const },
  { name: "Beatriz Almeida", info: "14:00 · Avaliação", status: "confirmado" as const },
];

const PILL: Record<string, string> = {
  confirmado: "bg-confirmado-fill text-confirmado-ink",
  agendado: "bg-agendado-fill text-agendado-ink",
};

export function Hero() {
  return (
    <section className="bg-[var(--surface-card)]">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-16 px-6 pb-20 pt-22 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-cliniq-50 px-3 py-1.5 text-xs font-medium text-cliniq-700">
            <Stethoscope className="h-3.5 w-3.5" />
            Software para clínicas odontológicas
          </span>
          <h1 className="text-balance text-5xl font-semibold leading-[1.08] tracking-tight text-[var(--text-strong)]">
            A gestão da sua clínica odontológica, sem complicação.
          </h1>
          <p className="mt-6 max-w-[30em] text-lg leading-relaxed text-[var(--text-muted)]">
            Agenda, pacientes e métricas em um só lugar. Reduza faltas, organize a rotina da
            recepção e acompanhe o crescimento da clínica em tempo real.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <LandingButton href="/cadastro" size="lg">Teste grátis por 30 dias</LandingButton>
            <LandingButton href="/login" variant="secondary" size="lg">Ver demonstração</LandingButton>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-[var(--text-faint)]">
            <CheckCircle2 className="h-[15px] w-[15px] text-cliniq-500" />
            Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] shadow-[0_24px_60px_rgba(16,24,40,0.10)]">
            <div className="flex items-center justify-between border-b border-[var(--border-divider)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-[18px] w-[18px] text-cliniq-600" />
                <span className="text-sm font-medium text-[var(--text-strong)]">Agenda · Hoje</span>
              </div>
              <span className="font-mono text-xs text-[var(--text-faint)]">17/06</span>
            </div>
            <div className="py-2">
              {APPTS.map((a, i) => (
                <div
                  key={a.name}
                  className={`flex items-center justify-between px-5 py-3 ${i < APPTS.length - 1 ? "border-b border-[var(--border-divider)]" : ""}`}
                >
                  <div>
                    <div className="text-sm font-medium text-[var(--text-strong)]">{a.name}</div>
                    <div className="font-mono text-xs text-[var(--text-muted)]">{a.info}</div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PILL[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 rounded-xl bg-cliniq-600 px-5 py-4 text-white shadow-[0_16px_40px_rgba(15,110,86,0.32)]">
            <div className="flex items-center gap-2 text-xs text-white/85">
              <TrendingDown className="h-[15px] w-[15px]" />
              No-show este mês
            </div>
            <div className="mt-1 text-[26px] font-semibold leading-tight">−38%</div>
          </div>
        </div>
      </div>
    </section>
  );
}