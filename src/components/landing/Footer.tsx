import Image from "next/image";

const COLS = [
  { title: "Produto", links: ["Benefícios", "Como funciona", "Preço"] },
  { title: "Empresa", links: ["Sobre", "Blog", "Contato"] },
  { title: "Suporte", links: ["Central de ajuda", "WhatsApp", "Status"] },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-[1120px] px-6 pb-8 pt-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Image src="/logo.svg" alt="Cliniq" width={120} height={30} className="mb-4" />
            <p className="max-w-[24em] text-sm leading-relaxed text-gray-500">
              Gestão simplificada para clínicas odontológicas. Agenda, pacientes e métricas em um só
              lugar.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="mb-3.5 text-xs font-semibold uppercase tracking-[0.05em] text-gray-400">
                {c.title}
              </div>
              <div className="flex flex-col gap-2.5 text-sm text-gray-500">
                {c.links.map((l) => (
                  <a key={l} href="#" className="hover:text-gray-700">
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-6">
          <span className="text-xs text-gray-400">© 2026 Cliniq. Todos os direitos reservados.</span>
          <div className="flex gap-5 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-700">Privacidade</a>
            <a href="#" className="hover:text-gray-700">Termos</a>
            <a href="#" className="hover:text-gray-700">LGPD</a>
          </div>
        </div>
      </div>
    </footer>
  );
}