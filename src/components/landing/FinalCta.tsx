import { LandingButton } from "@/components/landing/LandingButton";

export function FinalCta() {
  return (
    <section className="bg-cliniq-600">
      <div className="mx-auto max-w-[1120px] px-6 py-18 text-center">
        <h2 className="text-balance text-[38px] font-semibold leading-tight tracking-tight text-white">
          Pronto para organizar a sua clínica?
        </h2>
        <p className="mx-auto mt-4 max-w-[34em] text-lg text-white/85">
          Comece hoje o seu teste gratuito de 30 dias. Leva menos de 5 minutos para configurar.
        </p>
        <div className="mt-7.5 flex justify-center">
          <LandingButton href="/cadastro" variant="secondary" size="lg">
            Teste grátis por 30 dias
          </LandingButton>
        </div>
      </div>
    </section>
  );
}