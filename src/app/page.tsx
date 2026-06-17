import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Benefits } from "@/components/landing/Benefits";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Cliniq — Gestão para clínicas odontológicas",
  description:
    "Agenda, pacientes e métricas em um só lugar. Reduza faltas e organize a rotina da sua clínica odontológica. Teste grátis por 30 dias.",
};

export default function LandingPage() {
  return (
    <main className="antialiased">
      <Header />
      <Hero />
      <Benefits />
      <HowItWorks />
      <Pricing />
      <FinalCta />
      <Footer />
    </main>
  );
}