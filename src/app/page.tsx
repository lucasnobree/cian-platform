import {
  Heart,
  Palette,
  PenTool,
  Globe,
  Sparkles,
  ArrowRight,
  Mail,
  AtSign,
  MapPin,
  Phone,
} from "lucide-react";

const services = [
  {
    icon: PenTool,
    title: "Convites",
    description:
      "Convites exclusivos que traduzem a essência do casal em cada detalhe tipográfico e visual.",
  },
  {
    icon: Palette,
    title: "Identidade Visual",
    description:
      "Criamos uma linguagem visual única para o casamento, do monograma à paleta de cores.",
  },
  {
    icon: Sparkles,
    title: "Papelaria",
    description:
      "Menu, placas de mesa, save the date e toda a papelaria coordenada com elegância.",
  },
  {
    icon: Globe,
    title: "Sites de Casamento",
    description:
      "Sites personalizados com a identidade do casal, lista de presentes e confirmação online.",
  },
];

const portfolio = [
  {
    couple: "Carolina & Eduardo",
    style: "Clássico Romântico",
    gradient: "from-cian-800 to-cian-950",
  },
  {
    couple: "Beatriz & Rafael",
    style: "Minimalista Moderno",
    gradient: "from-sand-600 to-sand-800",
  },
  {
    couple: "Isabela & Thiago",
    style: "Jardim Botânico",
    gradient: "from-cian-700 to-cian-900",
  },
  {
    couple: "Fernanda & Lucas",
    style: "Art Déco Dourado",
    gradient: "from-sand-700 to-cian-950",
  },
];

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center bg-cian-950">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-cian-800/20 blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-cian-700/15 blur-3xl animate-float delay-300" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cian-900/30 blur-3xl" />
        </div>

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Overline */}
          <div className="animate-fade-up flex items-center justify-center gap-3 mb-8">
            <span className="h-px w-12 bg-cian-400/60 animate-draw-line delay-200" />
            <span className="text-cian-300/80 text-xs font-medium tracking-[0.3em] uppercase font-sans">
              Estúdio de Arte para Casamentos
            </span>
            <span className="h-px w-12 bg-cian-400/60 animate-draw-line delay-200" />
          </div>

          {/* Main title */}
          <h1 className="animate-fade-up delay-100">
            <span className="block text-8xl md:text-9xl lg:text-[10rem] font-bold text-cian-300 tracking-tight leading-none font-display">
              CIAN
            </span>
            <span className="block text-lg md:text-xl tracking-[0.5em] uppercase text-white/30 mt-2 font-light">
              art studio
            </span>
          </h1>

          {/* Divider */}
          <div className="animate-draw-line delay-300 h-px w-48 mx-auto bg-gradient-to-r from-transparent via-cian-400/50 to-transparent my-10" />

          {/* Tagline */}
          <p className="animate-fade-up delay-400 text-xl md:text-2xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
            Transformamos a essência de cada casal em{" "}
            <span className="text-cian-300/80">identidades visuais únicas</span>{" "}
            que tornam cada casamento inesquecível.
          </p>

          {/* CTA */}
          <div className="animate-fade-up delay-600 mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-cian-600 hover:bg-cian-500 text-white rounded-full transition-all duration-300 font-medium text-sm tracking-wide"
            >
              Solicite um Orçamento
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#portfolio"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 hover:border-white/25 text-white/60 hover:text-white/80 rounded-full transition-all duration-300 text-sm tracking-wide"
            >
              Ver Portfolio
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in delay-800">
          <div className="w-px h-16 bg-gradient-to-b from-transparent to-cian-400/40" />
        </div>

        {/* Bottom wave */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full"
          viewBox="0 0 1440 80"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,80 L0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 Z"
            fill="#FEFDFB"
          />
        </svg>
      </section>

      {/* ── Services ── */}
      <section className="py-28 md:py-36 bg-sand-50">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-20">
            <span className="text-cian-600 text-xs font-medium tracking-[0.3em] uppercase">
              O que fazemos
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-sand-800 tracking-tight">
              Cada detalhe conta uma{" "}
              <span className="text-cian-600">história</span>
            </h2>
            <div className="mt-6 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-cian-500 to-transparent" />
          </div>

          {/* Service cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="group relative p-8 rounded-2xl bg-white border border-sand-200 hover:border-cian-200 transition-all duration-500 hover:shadow-lg hover:shadow-cian-500/5"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-cian-50 flex items-center justify-center mb-6 group-hover:bg-cian-100 transition-colors duration-300">
                  <service.icon className="w-5 h-5 text-cian-600" />
                </div>

                <h3 className="text-lg font-semibold text-sand-800 mb-3 font-display">
                  {service.title}
                </h3>
                <p className="text-sand-500 text-sm leading-relaxed">
                  {service.description}
                </p>

                {/* Hover accent */}
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cian-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section className="py-28 md:py-36 bg-sand-100 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-[20rem] font-display font-bold text-sand-200/60 leading-none select-none pointer-events-none">
          &amp;
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-cian-600 text-xs font-medium tracking-[0.3em] uppercase">
                Nossa Filosofia
              </span>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold text-sand-800 tracking-tight leading-tight">
                Arte que nasce
                <br />
                do <span className="text-cian-600">amor</span>
              </h2>
              <div className="mt-6 h-px w-24 bg-gradient-to-r from-cian-500 to-transparent" />
              <p className="mt-8 text-sand-500 leading-relaxed text-lg">
                Cada casamento é uma história singular. Nosso trabalho começa
                ouvindo o casal, entendendo suas referências, personalidade e
                sonhos para criar uma identidade visual que seja autenticamente
                deles.
              </p>
              <p className="mt-4 text-sand-500 leading-relaxed">
                Do primeiro traço ao último detalhe da papelaria, cada peça é
                pensada para criar uma experiência visual coesa que emociona e
                encanta.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { number: "200+", label: "Casamentos" },
                { number: "5", label: "Anos de Estúdio" },
                { number: "100%", label: "Personalizado" },
                { number: "50+", label: "Avaliações 5 estrelas" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-8 rounded-2xl bg-white/80 border border-sand-200 text-center"
                >
                  <span className="block text-3xl md:text-4xl font-bold text-cian-700 font-display">
                    {stat.number}
                  </span>
                  <span className="block mt-2 text-sand-500 text-sm">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Portfolio ── */}
      <section id="portfolio" className="py-28 md:py-36 bg-sand-50">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-20">
            <span className="text-cian-600 text-xs font-medium tracking-[0.3em] uppercase">
              Portfolio
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-sand-800 tracking-tight">
              Histórias que{" "}
              <span className="text-cian-600">desenhamos</span>
            </h2>
            <div className="mt-6 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-cian-500 to-transparent" />
          </div>

          {/* Portfolio grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {portfolio.map((item) => (
              <div
                key={item.couple}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
              >
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`}
                />

                {/* Pattern overlay */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 2px 2px, white 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/40 via-transparent to-transparent">
                  <Heart className="w-5 h-5 text-white/40 mb-4 group-hover:text-coral transition-colors duration-300" />
                  <h3 className="text-2xl font-bold text-white font-display">
                    {item.couple}
                  </h3>
                  <p className="text-white/50 text-sm mt-1 tracking-wide">
                    {item.style}
                  </p>
                </div>

                {/* Hover border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 md:py-36 bg-cian-950 overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 left-0 right-0 w-full">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full rotate-180">
            <path
              d="M0,80 L0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 Z"
              fill="#FEFDFB"
            />
          </svg>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cian-800/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-cian-700/15 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <Heart className="w-8 h-8 text-cian-400/60 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight font-display">
            Vamos criar algo
            <br />
            <span className="text-cian-300">lindo juntos?</span>
          </h2>
          <p className="mt-6 text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
            Entre em contato e conte-nos sobre o seu casamento. Cada projeto
            começa com uma conversa.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-cian-600 hover:bg-cian-500 text-white rounded-full transition-all duration-300 font-medium text-sm tracking-wide"
            >
              <Phone className="w-4 h-4" />
              Fale Conosco
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 border border-white/10 hover:border-white/25 text-white/60 hover:text-white/80 rounded-full transition-all duration-300 text-sm tracking-wide"
            >
              <AtSign className="w-4 h-4" />
              @cian.artstudio
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-cian-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-cian-300 font-display tracking-tight">
                CIAN
              </span>
              <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase">
                art studio
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/30 text-sm">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Brasil
              </span>
              <span className="inline-flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                contato@cianstudio.com
              </span>
            </div>

            {/* Copyright */}
            <p className="text-white/20 text-xs">
              &copy; {new Date().getFullYear()} CIAN Art Studio
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
