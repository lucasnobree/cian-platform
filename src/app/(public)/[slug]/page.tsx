import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Countdown } from "@/components/public/countdown";
import { RsvpForm } from "@/components/public/rsvp-form";
import { safeFontFamily, safeCssColor } from "@/lib/validators/css-safe";
import {
  MapPin,
  Clock,
  Heart,
  Gift,
  Camera,
  CalendarHeart,
  Shirt,
  Lightbulb,
  ChevronDown,
  Flower,
  Crown,
  ZoomIn,
  Sparkles,
} from "lucide-react";

// ────────────────── Types ──────────────────

interface ScheduleItem {
  time: string;
  event: string;
  location?: string;
}

interface TipItem {
  title: string;
  text: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ────────────────── Data Fetching ──────────────────

async function getWeddingData(slug: string) {
  const client = await prisma.client.findFirst({
    where: {
      websiteSlug: slug,
      websiteStatus: "published",
    },
    include: {
      websiteConfig: true,
    },
  });

  return client;
}

function CustomSiteIframe({ slug }: { slug: string }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const iframeSrc = `${supabaseUrl}/storage/v1/object/public/custom-sites/${slug}/index.html`;

  return (
    <iframe
      src={iframeSrc}
      title="Site de casamento"
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
        display: "block",
      }}
    />
  );
}

// ────────────────── Metadata ──────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const client = await getWeddingData(slug);

  if (!client || !client.websiteConfig) {
    return { title: "Casamento" };
  }

  const cfg = client.websiteConfig;
  const defaultTitle = `${client.brideFullName.split(" ")[0]} & ${client.groomFullName.split(" ")[0]}`;

  return {
    title: cfg.metaTitle || defaultTitle,
    description:
      cfg.metaDescription ||
      `Casamento de ${client.brideFullName} e ${client.groomFullName}`,
    openGraph: {
      title: cfg.metaTitle || defaultTitle,
      description:
        cfg.metaDescription ||
        `Casamento de ${client.brideFullName} e ${client.groomFullName}`,
      type: "website",
      ...(cfg.heroImageUrl ? { images: [{ url: cfg.heroImageUrl }] } : {}),
    },
  };
}

// ────────────────── Section Wrapper ──────────────────

function WeddingSection({
  children,
  id,
  className = "",
  ariaLabel,
}: {
  children: React.ReactNode;
  id: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <section
      id={id}
      role="region"
      aria-label={ariaLabel || id}
      className={`px-6 py-16 sm:py-20 md:py-24 wedding-section-enter ${className}`}
    >
      <div className="max-w-3xl mx-auto">{children}</div>
    </section>
  );
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-4 py-3">
      <div
        className="h-px w-16 sm:w-24"
        style={{
          background: `linear-gradient(to right, transparent, var(--wedding-accent))`,
          opacity: 0.4,
        }}
      />
      <Heart
        size={12}
        style={{ color: "var(--wedding-accent)", opacity: 0.45 }}
        fill="currentColor"
      />
      <div
        className="h-px w-16 sm:w-24"
        style={{
          background: `linear-gradient(to left, transparent, var(--wedding-accent))`,
          opacity: 0.4,
        }}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-3xl sm:text-4xl text-center mb-2"
      style={{
        fontFamily: "var(--wedding-font-heading)",
        color: "var(--wedding-primary)",
      }}
    >
      {children}
    </h2>
  );
}

// ────────────────── Main Page ──────────────────

export default async function WeddingPage({ params }: PageProps) {
  const { slug } = await params;
  const client = await getWeddingData(slug);

  if (!client) {
    return <NotFoundPage />;
  }

  // If custom site, render full-page iframe
  if (client.websiteType === "custom") {
    return <CustomSiteIframe slug={slug} />;
  }

  if (!client.websiteConfig) {
    return <NotFoundPage />;
  }

  const cfg = client.websiteConfig;
  const brideName = client.brideFullName.split(" ")[0];
  const groomName = client.groomFullName.split(" ")[0];

  // Parse JSON fields
  const schedule: ScheduleItem[] = Array.isArray(cfg.schedule) ? (cfg.schedule as unknown as ScheduleItem[]) : [];
  const tips: TipItem[] = Array.isArray(cfg.tips) ? (cfg.tips as unknown as TipItem[]) : [];
  const galleryImages: string[] = cfg.galleryImages || [];

  // Sanitize user-provided CSS values
  const safeHeading = safeFontFamily(cfg.fontHeading);
  const safeBody = safeFontFamily(cfg.fontBody);
  const safePrimary = safeCssColor(cfg.primaryColor);
  const safeSecondary = safeCssColor(cfg.secondaryColor);
  const safeAccent = safeCssColor(cfg.accentColor);
  const safeBg = safeCssColor(cfg.backgroundColor, "#FFFFFF");
  const safeText = safeCssColor(cfg.textColor);

  // Build Google Fonts URL
  const fontsUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(safeHeading)}&family=${encodeURIComponent(safeBody)}:wght@400;600&display=swap`;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href={fontsUrl} rel="stylesheet" />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes weddingFadeUp {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .wedding-section-enter {
              animation: weddingFadeUp 0.8s ease-out both;
            }
            @supports (animation-timeline: view()) {
              .wedding-section-enter {
                animation-timeline: view();
                animation-range: entry 0% entry 30%;
              }
            }
            @keyframes weddingScrollLine {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 0.7; }
            }
            .wedding-scroll-hint > div:first-child {
              animation: weddingScrollLine 2.5s ease-in-out infinite;
            }
            .wedding-success-check {
              animation: weddingFadeUp 0.5s ease-out both;
            }
          `,
        }}
      />
      <div
        style={
          {
            "--wedding-primary": safePrimary,
            "--wedding-secondary": safeSecondary,
            "--wedding-accent": safeAccent,
            "--wedding-bg": safeBg,
            "--wedding-text": safeText,
            "--wedding-font-heading": `'${safeHeading}', cursive`,
            "--wedding-font-body": `'${safeBody}', serif`,
            backgroundColor: safeBg,
            color: safeText,
            fontFamily: `'${safeBody}', serif`,
          } as React.CSSProperties
        }
        className="min-h-screen"
      >
        {/* ═══════ HERO ═══════ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background with parallax hint */}
          {cfg.heroImageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center bg-fixed"
              style={{
                backgroundImage: `url(${cfg.heroImageUrl})`,
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              {/* Vignette overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)",
                }}
              />
            </div>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${safePrimary}22 0%, ${safeBg} 50%, ${safeAccent}22 100%)`,
              }}
            />
          )}

          {/* Content */}
          <div className="relative z-10 text-center px-6 py-20">
            {cfg.monogram && (
              <div className="flex items-center justify-center mb-8">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
                  style={{
                    border: `1px solid ${cfg.heroImageUrl ? "rgba(255,255,255,0.5)" : safeAccent + "60"}`,
                    boxShadow: cfg.heroImageUrl
                      ? "0 0 30px rgba(255,255,255,0.08)"
                      : `0 0 30px ${safeAccent}10`,
                  }}
                >
                  <p
                    className="text-sm sm:text-base tracking-[0.3em] uppercase opacity-90"
                    style={{
                      fontFamily: `'${safeBody}', serif`,
                      color: cfg.heroImageUrl ? "#fff" : safeText,
                    }}
                  >
                    {cfg.monogram}
                  </p>
                </div>
              </div>
            )}

            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6"
              style={{
                fontFamily: `'${safeHeading}', cursive`,
                color: cfg.heroImageUrl ? "#fff" : safePrimary,
                lineHeight: 1.1,
                textShadow: cfg.heroImageUrl
                  ? "0 2px 20px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)"
                  : `0 1px 8px ${safePrimary}15`,
              }}
            >
              {cfg.heroTitle || `${brideName} & ${groomName}`}
            </h1>

            {(cfg.heroDate || client.weddingDate) && (
              <p
                className="text-base sm:text-lg tracking-[0.15em] mb-3 opacity-90"
                style={{
                  fontFamily: `'${safeBody}', serif`,
                  color: cfg.heroImageUrl ? "#fff" : safeText,
                  textShadow: cfg.heroImageUrl ? "0 1px 6px rgba(0,0,0,0.3)" : "none",
                }}
              >
                {cfg.heroDate ||
                  new Date(client.weddingDate).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
              </p>
            )}

            {cfg.heroLocation && (
              <p
                className="text-sm sm:text-base opacity-70 flex items-center justify-center gap-2"
                style={{
                  fontFamily: `'${safeBody}', serif`,
                  color: cfg.heroImageUrl ? "#fff" : safeText,
                  textShadow: cfg.heroImageUrl ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                }}
              >
                <MapPin size={14} />
                {cfg.heroLocation}
              </p>
            )}

            {/* Scroll hint — elegant animated line + chevron */}
            <div className="mt-16 flex flex-col items-center gap-2 opacity-50 wedding-scroll-hint">
              <div
                className="w-px h-8"
                style={{
                  background: `linear-gradient(to bottom, transparent, ${cfg.heroImageUrl ? "#fff" : safeText})`,
                }}
              />
              <ChevronDown
                size={18}
                className="animate-bounce"
                style={{ color: cfg.heroImageUrl ? "#fff" : safeText }}
              />
            </div>
          </div>
        </section>

        {/* ═══════ COUNTDOWN ═══════ */}
        {cfg.showCountdown && (
          <WeddingSection id="countdown" ariaLabel="Contagem regressiva">
            <Countdown weddingDate={client.weddingDate.toISOString()} />
          </WeddingSection>
        )}

        {/* ═══════ WELCOME ═══════ */}
        {cfg.showWelcome && (cfg.welcomeTitle || cfg.welcomeText) && (
          <WeddingSection id="welcome" ariaLabel="Boas-vindas">
            <div className="text-center">
              <SectionTitle>{cfg.welcomeTitle || "Bem-vindos"}</SectionTitle>
              <Divider />

              {cfg.couplePhotoUrl && (
                <div className="my-8 flex justify-center">
                  <div
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 shadow-lg"
                    style={{ borderColor: safeAccent }}
                  >
                    <img
                      src={cfg.couplePhotoUrl}
                      alt={`${brideName} & ${groomName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {cfg.welcomeText && (
                <p
                  className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto opacity-80 whitespace-pre-line"
                  style={{ fontFamily: "var(--wedding-font-body)" }}
                >
                  {cfg.welcomeText}
                </p>
              )}
            </div>
          </WeddingSection>
        )}

        {/* ═══════ EVENT ═══════ */}
        {cfg.showEvent && (cfg.eventTitle || cfg.eventVenue) && (
          <WeddingSection id="event" ariaLabel="Evento">
            <div className="text-center">
              <SectionTitle>{cfg.eventTitle || "Cerimônia & Recepção"}</SectionTitle>
              <Divider />

              {cfg.eventText && (
                <p
                  className="text-base leading-relaxed max-w-xl mx-auto opacity-80 mb-8 whitespace-pre-line"
                  style={{ fontFamily: "var(--wedding-font-body)" }}
                >
                  {cfg.eventText}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                {cfg.eventVenue && (
                  <div className="flex items-center gap-3">
                    <MapPin size={20} style={{ color: "var(--wedding-accent)" }} />
                    <span
                      className="text-sm sm:text-base"
                      style={{ fontFamily: "var(--wedding-font-body)" }}
                    >
                      {cfg.eventVenue}
                    </span>
                  </div>
                )}
                {cfg.eventTime && (
                  <div className="flex items-center gap-3">
                    <Clock size={20} style={{ color: "var(--wedding-accent)" }} />
                    <span
                      className="text-sm sm:text-base"
                      style={{ fontFamily: "var(--wedding-font-body)" }}
                    >
                      {cfg.eventTime}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </WeddingSection>
        )}

        {/* ═══════ SCHEDULE ═══════ */}
        {cfg.showSchedule && schedule.length > 0 && (
          <WeddingSection id="schedule" ariaLabel="Programação">
            <div className="text-center mb-10">
              <SectionTitle>Programação</SectionTitle>
              <Divider />
            </div>

            <div className="relative max-w-md mx-auto">
              {/* Timeline line — subtle gradient */}
              <div
                className="absolute left-4 top-0 bottom-0 w-px"
                style={{
                  background: `linear-gradient(to bottom, transparent, var(--wedding-accent), transparent)`,
                  opacity: 0.3,
                }}
              />

              <div className="space-y-8">
                {schedule.map((item, i) => (
                  <div key={i} className="flex gap-5 pl-4">
                    {/* Timeline dot — decorative ring */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-3 h-3 rounded-full -ml-1.5 mt-1.5"
                        style={{
                          backgroundColor: "var(--wedding-accent)",
                          boxShadow: "0 0 0 3px var(--wedding-bg), 0 0 0 4px var(--wedding-accent)",
                        }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-xs uppercase tracking-[0.15em] opacity-60 mb-0.5"
                        style={{ fontFamily: "var(--wedding-font-body)" }}
                      >
                        {item.time}
                      </p>
                      <p
                        className="text-base font-semibold"
                        style={{ fontFamily: "var(--wedding-font-body)" }}
                      >
                        {item.event}
                      </p>
                      {item.location && (
                        <p
                          className="text-sm opacity-60 mt-0.5"
                          style={{ fontFamily: "var(--wedding-font-body)" }}
                        >
                          {item.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </WeddingSection>
        )}

        {/* ═══════ DRESS CODE ═══════ */}
        {cfg.showDressCode && (cfg.dressCodeWomen || cfg.dressCodeMen) && (
          <WeddingSection id="dresscode" ariaLabel="Dress Code">
            <div className="text-center mb-10">
              <SectionTitle>Dress Code</SectionTitle>
              <Divider />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {cfg.dressCodeWomen && (
                <div
                  className="rounded-xl p-6 text-center overflow-hidden relative"
                  style={{
                    backgroundColor: `${safeSecondary}80`,
                    border: `1px solid ${safeAccent}40`,
                    borderTop: `3px solid var(--wedding-accent)`,
                  }}
                >
                  <Flower
                    size={24}
                    className="mx-auto mb-3"
                    style={{ color: "var(--wedding-accent)" }}
                  />
                  <h3
                    className="text-lg mb-3"
                    style={{
                      fontFamily: "var(--wedding-font-heading)",
                      color: "var(--wedding-primary)",
                    }}
                  >
                    Feminino
                  </h3>
                  <p
                    className="text-sm leading-relaxed opacity-80 whitespace-pre-line"
                    style={{ fontFamily: "var(--wedding-font-body)" }}
                  >
                    {cfg.dressCodeWomen}
                  </p>
                </div>
              )}
              {cfg.dressCodeMen && (
                <div
                  className="rounded-xl p-6 text-center overflow-hidden relative"
                  style={{
                    backgroundColor: `${safeSecondary}80`,
                    border: `1px solid ${safeAccent}40`,
                    borderTop: `3px solid var(--wedding-accent)`,
                  }}
                >
                  <Crown
                    size={24}
                    className="mx-auto mb-3"
                    style={{ color: "var(--wedding-accent)" }}
                  />
                  <h3
                    className="text-lg mb-3"
                    style={{
                      fontFamily: "var(--wedding-font-heading)",
                      color: "var(--wedding-primary)",
                    }}
                  >
                    Masculino
                  </h3>
                  <p
                    className="text-sm leading-relaxed opacity-80 whitespace-pre-line"
                    style={{ fontFamily: "var(--wedding-font-body)" }}
                  >
                    {cfg.dressCodeMen}
                  </p>
                </div>
              )}
            </div>
          </WeddingSection>
        )}

        {/* ═══════ GIFTS ═══════ */}
        {cfg.showGifts && (
          <WeddingSection id="gifts" ariaLabel="Lista de presentes">
            <div className="text-center">
              <SectionTitle>Lista de Presentes</SectionTitle>
              <Divider />
              <p
                className="text-base leading-relaxed max-w-xl mx-auto opacity-80 mt-6 mb-8"
                style={{ fontFamily: "var(--wedding-font-body)" }}
              >
                Sua presença é o nosso maior presente. Mas se desejar nos presentear,
                preparamos uma lista especial.
              </p>
              <a
                href="#gifts"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--wedding-primary)",
                  fontFamily: "var(--wedding-font-body)",
                }}
              >
                <Gift size={16} />
                Ver Lista de Presentes
              </a>
            </div>
          </WeddingSection>
        )}

        {/* ═══════ RSVP ═══════ */}
        {cfg.showRsvp && (
          <WeddingSection id="rsvp" ariaLabel="Confirme sua presença">
            <div className="text-center mb-10">
              <SectionTitle>Confirme sua Presença</SectionTitle>
              <Divider />
              <p
                className="text-base leading-relaxed max-w-xl mx-auto opacity-80 mt-4"
                style={{ fontFamily: "var(--wedding-font-body)" }}
              >
                Será uma alegria contar com você neste dia especial!
              </p>
            </div>
            <RsvpForm slug={slug} />
          </WeddingSection>
        )}

        {/* ═══════ TIPS ═══════ */}
        {cfg.showTips && tips.length > 0 && (
          <WeddingSection id="tips" ariaLabel="Dicas">
            <div className="text-center mb-10">
              <SectionTitle>Dicas</SectionTitle>
              <Divider />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: `${safeSecondary}60`,
                    border: `1px solid ${safeAccent}30`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb
                      size={18}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "var(--wedding-accent)" }}
                    />
                    <div>
                      <h4
                        className="text-sm font-semibold mb-1"
                        style={{ fontFamily: "var(--wedding-font-body)" }}
                      >
                        {tip.title}
                      </h4>
                      <p
                        className="text-sm opacity-70 leading-relaxed"
                        style={{ fontFamily: "var(--wedding-font-body)" }}
                      >
                        {tip.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </WeddingSection>
        )}

        {/* ═══════ GALLERY ═══════ */}
        {cfg.showGallery && galleryImages.length > 0 && (
          <WeddingSection id="gallery" ariaLabel="Galeria de fotos">
            <div className="text-center mb-10">
              <SectionTitle>Galeria</SectionTitle>
              <Divider />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryImages.map((url, i) => (
                <div
                  key={i}
                  className={`rounded-lg overflow-hidden group relative ${
                    i % 5 === 0
                      ? "aspect-3/4"
                      : i % 5 === 3
                        ? "aspect-4/3"
                        : "aspect-square"
                  }`}
                  style={{ border: `1px solid ${safeAccent}20` }}
                >
                  <img
                    src={url}
                    alt={`Galeria ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
                  >
                    <ZoomIn size={20} className="text-white/80" />
                  </div>
                </div>
              ))}
            </div>
          </WeddingSection>
        )}

        {/* ═══════ FOOTER ═══════ */}
        <footer className="text-center pt-4 pb-12 px-6">
          {/* Decorative line above footer */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div
              className="h-px w-20 sm:w-32"
              style={{
                background: `linear-gradient(to right, transparent, var(--wedding-accent))`,
                opacity: 0.25,
              }}
            />
            <Sparkles
              size={10}
              style={{ color: "var(--wedding-accent)", opacity: 0.35 }}
            />
            <div
              className="h-px w-20 sm:w-32"
              style={{
                background: `linear-gradient(to left, transparent, var(--wedding-accent))`,
                opacity: 0.25,
              }}
            />
          </div>
          <p
            className="text-lg sm:text-xl opacity-50"
            style={{
              fontFamily: "var(--wedding-font-heading)",
              color: "var(--wedding-primary)",
            }}
          >
            {cfg.heroTitle || `${brideName} & ${groomName}`}
          </p>
          <p
            className="text-[10px] mt-3 opacity-30 tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--wedding-font-body)" }}
          >
            Feito com amor por CIAN Art Studio
          </p>
        </footer>
      </div>
    </>
  );
}

// ────────────────── 404 ──────────────────

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50 px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
          <Heart size={32} className="text-teal-600" />
        </div>
        <h1
          className="text-3xl font-bold text-teal-800 mb-3"
          style={{ fontFamily: "serif" }}
        >
          Página não encontrada
        </h1>
        <p className="text-teal-600/70 text-sm leading-relaxed mb-6">
          Este site de casamento não existe ou ainda não foi publicado.
          Verifique o endereço e tente novamente.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  );
}
