import { CalendarCheck, BellRing, BarChart2, LucideIcon } from "lucide-react";

const ITEMS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: CalendarCheck,
    title: "Agenda inteligente",
    body: "Agendamento online e visão por dia, semana ou mês. A recepção no controle, sem ligações perdidas.",
  },
  {
    icon: BellRing,
    title: "Redução de no-show",
    body: "Confirmações e lembretes automáticos por WhatsApp reduzem faltas em até 40%.",
  },
  {
    icon: BarChart2,
    title: "Métricas em tempo real",
    body: "Receita, taxa de comparecimento e desempenho da clínica, atualizados a cada consulta.",
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="bg-white">
      <div className="mx-auto max-w-[1120px] px-6 py-22">
        <div className="mx-auto mb-13 max-w-[42em] text-center">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-gray-900">
            Tudo o que a sua clínica precisa
          </h2>
          <p className="mt-3.5 text-lg text-gray-500">
            Menos planilhas e papéis. Mais tempo para cuidar dos seus pacientes.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-gray-200 bg-white p-[30px]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cliniq-50">
                <Icon className="h-6 w-6 text-cliniq-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-gray-500">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}