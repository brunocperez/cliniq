const STEPS = [
  { n: 1, title: "Crie sua conta", body: "Cadastre a clínica em minutos. Tudo na nuvem, nada para instalar." },
  { n: 2, title: "Configure a agenda", body: "Adicione profissionais, serviços e horários de atendimento." },
  { n: 3, title: "Comece a atender", body: "Receba agendamentos online e acompanhe tudo pelo painel." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-[var(--border-divider)] bg-[var(--surface-app)]">
      <div className="mx-auto max-w-[1120px] px-6 py-22">
        <div className="mx-auto mb-13 max-w-[42em] text-center">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--text-strong)]">
            Comece em três passos
          </h2>
          <p className="mt-3.5 text-lg text-[var(--text-muted)]">
            Sem instalação, sem treinamento. Em minutos sua clínica está no ar.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-[30px]">
              <div className="mb-[18px] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-cliniq-600 text-base font-semibold text-white">
                {s.n}
              </div>
              <h3 className="text-base font-semibold text-[var(--text-strong)]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}