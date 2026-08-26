"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CountUpValue } from "./CountUpValue";

const CARD_COUNT = 9;
const ROTATE_MS = 6000;

function Card({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <div className={`flex h-[351px] w-[265px] flex-col items-center justify-center overflow-hidden rounded-[110px] p-6 ${bg}`}>
      {children}
    </div>
  );
}

function AnimatedRedrivinho({ active }: { active: boolean }) {
  const [wink, setWink] = useState(false);

  useEffect(() => {
    if (!active) { setWink(false); return; }
    const t1 = setTimeout(() => setWink(true), 1200);
    const t2 = setTimeout(() => setWink(false), 1500);
    const t3 = setTimeout(() => setWink(true), 3200);
    const t4 = setTimeout(() => setWink(false), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [active]);

  return (
    <svg
      className={`h-20 w-auto text-white transition-all duration-700 ease-out ${
        active ? "scale-110 animate-[redrivinho-entrance_0.8s_ease-out]" : "scale-75 opacity-60"
      }`}
      viewBox="0 0 59 67"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body outline */}
      <path d="M58.9766 29.4508C59.0459 27.8027 58.7589 26.1775 58.4547 24.5675C57.8783 21.9407 57.2945 19.2556 56.0007 16.885C54.1899 12.8941 51.3847 9.44083 48.1119 6.61885C44.3592 3.3988 39.7358 1.37042 34.9763 0.315666C31.4586 -0.105222 27.9063 -0.105222 24.3886 0.315666C22.5209 0.863328 20.5567 1.12702 18.7831 1.96879C15.8269 3.17314 12.9895 4.77049 10.6024 6.92818C5.53116 11.1193 2.05553 17.1842 0.687547 23.6826C0.301641 24.6816 0.35359 25.7693 0.182901 26.8139C-0.109002 28.2515 0.0493179 29.7297 0.00726411 31.1876C-0.0545798 32.5111 0.296693 33.7966 0.370906 35.115C1.20209 39.405 2.67892 43.619 5.18483 47.1991C5.85027 48.0485 5.9888 49.159 6.24607 50.1833C6.65424 51.7097 6.48603 53.307 6.51571 54.8689C6.57756 56.6412 5.95912 58.3222 5.6499 60.0488C4.97704 62.2674 3.9059 64.311 2.83971 66.3444C4.1038 66.3901 5.36789 66.3089 6.61466 66.0985C7.94307 65.8196 9.13542 65.135 10.3723 64.5975C11.6339 64.0625 12.8436 63.4058 13.9815 62.6376C15.7354 61.6031 17.4151 60.4418 19.0107 59.1614C19.2506 58.1244 18.7163 57.1305 18.6643 56.1062C18.5431 54.4581 18.4986 52.6529 19.4584 51.2229C20.631 49.2224 22.8771 48.0409 25.1307 48.0586C28.1091 48.0586 31.0851 48.0586 34.061 48.0586C36.5966 48.0586 38.9565 49.7574 40.0128 52.0849C42.4346 50.8299 44.384 48.8319 46.0438 46.659C46.4669 46.1063 47.0333 45.4902 47.7829 45.5637C48.9975 45.4268 50.034 47.0064 49.3513 48.0814C48.4162 49.8385 46.9616 51.2153 45.5639 52.5793C43.9807 53.8116 42.3926 55.2162 40.4012 55.6929C40.3221 56.5271 40.1934 57.3511 40.1068 58.1827C41.6628 57.8151 43.0877 57.0392 44.4211 56.1594C50.0637 52.9952 54.3557 47.6352 56.8764 41.6261C58.1405 37.7189 59.1696 33.614 58.9766 29.4508ZM48.8466 39.7777C47.5108 42.5313 45.2374 44.6915 42.4569 45.8502C41.5861 46.2356 40.614 46.1976 39.7185 46.4841C39.2781 46.6007 38.823 46.6489 38.3678 46.6286C32.4258 46.6108 26.4863 46.6286 20.5419 46.6286C19.8913 46.6286 19.2852 46.3497 18.6421 46.3015C17.7416 46.261 16.856 46.0328 16.0421 45.6296C14.5826 44.836 13.1009 43.9638 12.047 42.6276C10.4762 40.901 9.55843 38.6596 9.07852 36.3878C9.03647 34.2428 8.85094 32.0395 9.40506 29.9452C9.47185 29.1136 9.63265 28.2895 9.88744 27.4959C10.5776 23.893 12.705 20.5893 15.7824 18.6623C18.3131 17.1689 21.1876 16.4032 24.1066 16.4438C24.1066 15.5488 24.8141 14.8236 25.6873 14.8236H28.9477C28.9477 14.8236 28.7597 11.5022 28.6237 11.3881C27.362 10.9368 26.6941 9.5245 27.1345 8.22887C27.5748 6.93578 28.9527 6.25121 30.2168 6.70252C30.7288 6.88507 31.1642 7.2375 31.4586 7.70403C31.5377 7.82066 31.6021 7.9449 31.6565 8.07675V8.10717C31.8816 8.66751 31.8964 9.29377 31.701 9.86679C31.701 9.90736 31.6886 9.94539 31.6812 9.98849C31.5872 10.2167 31.4586 10.4271 31.2953 10.6097C31.0158 10.9621 30.6472 11.2309 30.2291 11.383C30.1079 11.4337 29.9892 11.4844 29.8605 11.5225C29.8309 12.6228 29.8482 13.7258 29.8457 14.8262H33.1778C33.9472 14.8262 34.5879 15.5057 34.7289 16.2511C35.1074 16.2511 38.6622 16.6188 40.2825 17.3515C41.9176 17.9372 43.5478 18.6547 44.8218 19.8971C46.2665 21.0279 47.1991 22.6532 48.0501 24.2632C48.953 26.2003 49.3043 28.3326 49.6926 30.4295C49.8559 31.5045 49.7471 32.6049 49.9549 33.6774C50.1255 35.7413 49.6308 37.8432 48.8466 39.7803V39.7777Z" fill="currentColor" />
      {/* Face/visor with LEFT eye cutout only */}
      <path d="M46.4099 30.4269C46.4273 28.9158 45.2473 27.8204 44.2454 26.8798C42.1031 25.432 39.4636 24.8032 36.9157 24.9072H21.2741C20.7596 24.9072 20.2475 24.9655 19.7453 25.0847C18.0261 25.4067 16.2845 25.9695 14.8968 27.0928C14.0903 27.9016 13.1577 28.7662 12.9945 29.9781C12.9128 30.9416 12.9128 31.9102 12.9945 32.8711C13.2864 34.4203 14.6271 35.5257 16.0223 36.0202C17.2246 36.5526 18.5456 36.5475 19.822 36.6971C22.417 36.6819 25.0169 36.7605 27.6094 36.6616C28.3194 36.3067 28.2699 35.1403 28.9898 34.7372C29.3163 34.6966 29.6502 34.6916 29.9793 34.7195C30.5853 35.2342 30.6397 36.1774 31.2805 36.6667C33.9645 36.7554 36.651 36.6667 39.3375 36.7047C41.502 36.5627 43.9956 36.3726 45.5169 34.5547C46.6202 33.4923 46.4495 31.8341 46.4124 30.4294L46.4099 30.4269ZM22.5407 33.5354C21.0638 33.5354 19.8665 32.3108 19.8665 30.7945C19.8665 29.2834 21.0614 28.0537 22.5407 28.0537C24.0175 28.0537 25.2148 29.2809 25.2148 30.7945C25.2148 32.3082 24.0175 33.5354 22.5407 33.5354Z" fill="currentColor" />
      {/* Right eye — dark circle that squishes for wink */}
      <ellipse
        cx="36.43"
        cy="30.79"
        rx="2.67"
        ry={wink ? 0.4 : 2.74}
        fill="#900"
        className="transition-all duration-150"
        style={{ transformOrigin: "36.43px 30.79px" }}
      />
      {/* Smile */}
      <path d="M35.0083 40.1429C34.7857 39.8462 34.3676 39.793 34.0807 40.0212C31.4956 42.473 27.5054 42.473 24.9253 40.0212C24.8981 39.9882 24.8684 39.9629 24.8363 39.935C24.5444 39.7068 24.1312 39.76 23.9086 40.0592C23.686 40.3559 23.7379 40.7793 24.0273 41.01C25.524 42.4147 27.4758 43.2007 29.5042 43.2134C31.5327 43.2007 33.487 42.4172 34.9836 41.01C35.1963 40.7666 35.2062 40.4041 35.0133 40.1454L35.0083 40.1429Z" fill="currentColor" />
    </svg>
  );
}

function BrandCard({ active }: { active: boolean }) {
  return (
    <Card bg="bg-gradient-to-b from-vermelho-redrive to-[#900]">
      <AnimatedRedrivinho active={active} />
    </Card>
  );
}

function MaestroCard({ active }: { active: boolean }) {
  return (
    <Card bg="bg-[#1c1c1c]">
      <div className="flex w-full items-center gap-2.5 px-1">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-vermelho-redrive text-lg text-white transition-transform duration-700 ${active ? "rotate-180 scale-110" : ""}`}
        >
          ✦
        </span>
        <p className="text-sm font-bold text-white">Maestro</p>
      </div>
      <div className="mt-4 w-full rounded-2xl bg-black/50 px-3 py-3 text-left">
        <p className="text-xs leading-snug text-white/70">
          Interação configurada e inteligência artificial treinada
        </p>
      </div>
    </Card>
  );
}

function VideoCard({ active }: { active: boolean }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!videoRef.current) return;
    if (active) { videoRef.current.currentTime = 0; videoRef.current.play().catch(() => {}); }
    else { videoRef.current.pause(); }
  }, [active]);
  return (
    <div className="relative size-full overflow-hidden rounded-[110px]">
      <video
        ref={videoRef}
        src="/videos/hero-card-video.mp4"
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function VideoCard2({ active }: { active: boolean }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!videoRef.current) return;
    if (active) { videoRef.current.currentTime = 0; videoRef.current.play().catch(() => {}); }
    else { videoRef.current.pause(); }
  }, [active]);
  return (
    <div className="relative size-full overflow-hidden rounded-[110px]">
      <video
        ref={videoRef}
        src="/videos/hero-card05.mp4"
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function PeoplePhotoCard({ src, alt, active }: { src: string; alt: string; active: boolean }) {
  return (
    <div className="relative size-full overflow-hidden rounded-[110px]">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-[5000ms] ease-out"
        style={{ transform: active ? "scale(1.12)" : "scale(1)" }}
        sizes="340px"
      />
    </div>
  );
}

function RelatoriosCard({ active }: { active: boolean }) {
  return (
    <Card bg="bg-bege-texto">
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between rounded-full bg-verde-destaque/15 px-3 py-1.5 text-xs font-bold text-verde-destaque">
          <span>Leads</span>
          <CountUpValue active={active} target={230} />
        </div>
        <div className="flex items-center justify-between rounded-full bg-[#2563eb]/10 px-3 py-1.5 text-xs font-bold text-[#2563eb]">
          <span>Conversão</span>
          <CountUpValue active={active} target={244.4} decimals={1} suffix="%" />
        </div>
        <div className="flex items-center justify-between rounded-full bg-vermelho-redrive/10 px-3 py-1.5 text-xs font-bold text-vermelho-redrive">
          <span>Churn</span>
          <CountUpValue active={active} target={76.2} decimals={1} suffix="%" />
        </div>
        <div className="flex items-center justify-between rounded-full bg-[#2563eb]/10 px-3 py-1.5 text-xs font-bold text-[#2563eb]">
          <span>Fechados</span>
          <span>
            21 (<CountUpValue active={active} target={82} suffix="%" />)
          </span>
        </div>
      </div>
    </Card>
  );
}

const SOCIAL_ICONS = ["/icons/social/icon-1.png", "/icons/social/icon-2.png", "/icons/social/icon-3.png", "/icons/social/icon-4.png"];

function SocialIconsCard() {
  return (
    <Card bg="bg-gradient-to-b from-vermelho-redrive to-[#900]">
      <div className="flex flex-col items-center gap-5">
        {SOCIAL_ICONS.map((src) => (
          <span key={src} className="relative h-7 w-7">
            <Image src={src} alt="" fill className="object-contain" />
          </span>
        ))}
      </div>
    </Card>
  );
}

const REEL_VALUES = ["10K", "200K", "500K", "800K", "1Mi", "2Mi", "5Mi"];
const REEL_LONG_LIST = Array.from({ length: 70 }, (_, i) => REEL_VALUES[i % REEL_VALUES.length]);
const REEL_ROW_HEIGHT = 72;

function MoneyReelCard({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % (REEL_LONG_LIST.length - 4));
    }, 900);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <Card bg="bg-[#282828]">
      <div className="relative w-full overflow-hidden" style={{ height: REEL_ROW_HEIGHT * 4 }}>
        <div
          className="transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(${-step * REEL_ROW_HEIGHT}px)` }}
        >
          {REEL_LONG_LIST.map((value, i) => {
            const dist = i - step - 1;
            const isCenter = dist === 0;
            const isNear = Math.abs(dist) === 1;
            const isFar = Math.abs(dist) === 2;
            return (
              <div
                key={i}
                className="flex items-center font-display transition-all duration-500"
                style={{
                  height: REEL_ROW_HEIGHT,
                  fontSize: "3rem",
                  fontWeight: 900,
                  color: isCenter ? "#ffffff" : isNear ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)",
                  filter: isFar ? "blur(3px)" : "none",
                  opacity: Math.abs(dist) > 2 ? 0 : 1,
                }}
              >
                <span className="mr-1 text-lg" style={{ color: isCenter ? "rgba(255,255,255,0.5)" : isNear ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)" }}>R$</span>
                {value}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

const NOTIF_PEOPLE = [
  { name: "Carlos", img: "/images/notif-avatar-01.png", align: "right" as const },
  { name: "Mauren", img: "/images/notif-avatar-02.png", align: "left" as const },
  { name: "Ana", img: "/images/notif-avatar-03.png", align: "right" as const },
  { name: "Antônio", img: "/images/notif-avatar-04.png", align: "left" as const },
  { name: "João", img: "/images/notif-avatar-05.png", align: "right" as const },
];
const NOTIF_LONG_LIST = Array.from({ length: 50 }, (_, i) => NOTIF_PEOPLE[i % NOTIF_PEOPLE.length]);
const NOTIF_ROW_HEIGHT = 71;

function NotificationListCard({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % (NOTIF_LONG_LIST.length - 5));
    }, 1100);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <Card bg="bg-creme-destaque">
      <div
        className="relative w-full"
        style={{
          height: NOTIF_ROW_HEIGHT * 5,
          maskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
        }}
      >
        <div
          className="transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(${-step * NOTIF_ROW_HEIGHT}px)` }}
        >
          {NOTIF_LONG_LIST.map((person, i) => {
            const dist = i - step - 2;
            return (
              <div
                key={i}
                className="flex px-2 transition-all duration-500"
                style={{
                  height: NOTIF_ROW_HEIGHT,
                  justifyContent: person.align === "right" ? "flex-end" : "flex-start",
                  opacity: Math.abs(dist) > 3 ? 0 : 1,
                }}
              >
                <div className="flex items-center gap-2 rounded-full bg-verde-destaque px-3 py-2" style={{ width: "165px", height: "59px" }}>
                  <span className="relative h-[41px] w-[41px] shrink-0 overflow-hidden rounded-full">
                    <Image src={person.img} alt={person.name} fill className="object-cover" sizes="41px" />
                  </span>
                  <span className="text-xs font-semibold text-mogno">{person.name} chamou</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function ChatPreviewCard({ active }: { active: boolean }) {
  return (
    <Card bg="bg-[#f5f5f5]">
      <div className="flex w-full flex-col gap-3">
        {/* Conversas block */}
        <div className="relative w-full rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="text-vermelho-redrive text-sm">💬</span>
            <span className="text-xs font-bold text-[#1c1c1c]">Conversas</span>
          </div>
          <div className="mt-2 rounded-lg bg-[#f5f5f5] px-2.5 py-2 text-[9px] leading-snug text-[#444]">
            Ótimo! 🎯 A demo dura uns 20 minutos e eu vou te mostrar: ✅ Como a Re...
          </div>
          {/* Red dot connector right */}
          <span className="absolute -right-2 top-1/2 h-3.5 w-3.5 rounded-full border-2 border-vermelho-redrive bg-white" />
        </div>

        {/* Dashed connection + green line */}
        <div className="relative flex justify-center" style={{ height: 40 }}>
          <div className="absolute left-6 top-0 h-full border-l-2 border-dashed border-gray-300" />
          <div
            className="absolute left-6 bottom-0 w-0.5 bg-verde-destaque"
            style={{
              height: active ? "100%" : "0%",
              transition: "height 1.5s ease-in-out",
            }}
          />
        </div>

        {/* Ação block */}
        <div className="relative w-full rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="text-verde-destaque text-sm">⚡</span>
            <span className="text-xs font-bold text-[#1c1c1c]">Ação</span>
          </div>
          <div className="mt-2 text-[9px] leading-snug text-[#444]">
            Adicionar tag: demo agendada<br />
            Adicionar tag: Instagram
          </div>
          {/* Red dot connector left */}
          <span className="absolute -left-2 top-1/2 h-3.5 w-3.5 rounded-full border-2 border-vermelho-redrive bg-white" />
          {/* Green line on left */}
          <div
            className="absolute -left-[1px] top-0 w-0.5 rounded-full bg-verde-destaque"
            style={{
              height: active ? "100%" : "0%",
              transition: "height 2s ease-in-out 0.8s",
            }}
          />
        </div>
      </div>
    </Card>
  );
}

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % CARD_COUNT);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, []);

  {/* Ordered so two red-gradient cards never land next to each other (including the
      wrap-around seam), otherwise the side-peek of one disappears into the other. */}
  const cards = [
    <MaestroCard key={0} active={current === 0} />,
    <BrandCard key={1} active={current === 1} />,
    <VideoCard key={2} active={current === 2} />,
    <RelatoriosCard key={3} active={current === 3} />,
    <VideoCard2 key={4} active={current === 4} />,
    <SocialIconsCard key={5} />,
    <MoneyReelCard key={6} active={current === 6} />,
    <NotificationListCard key={7} active={current === 7} />,
    <ChatPreviewCard key={8} active={current === 8} />,
  ];

  return (
    <div className="relative size-full overflow-visible">
      {cards.map((card, cardIndex) => {
        const raw = (cardIndex - current + CARD_COUNT) % CARD_COUNT;
        const distance = raw > CARD_COUNT / 2 ? raw - CARD_COUNT : raw;
        const isCenter = distance === 0;
        const isSide = Math.abs(distance) === 1;

        let transform = "";
        let opacity = 0;
        let zIndex = 0;

        if (isCenter) {
          transform = "translateX(0) scale(1)";
          opacity = 1;
          zIndex = 30;
        } else if (isSide) {
          // Only ~20% of the side card's width pokes out from behind the center card.
          transform = `translateX(${distance > 0 ? 20 : -20}%) scale(0.86)`;
          opacity = 1;
          zIndex = 20;
        } else {
          transform = `translateX(${distance > 0 ? 40 : -40}%) scale(0.8)`;
          opacity = 0;
          zIndex = 0;
        }

        return (
          <div
            key={cardIndex}
            className="absolute inset-0 transition-all duration-700 ease-out"
            style={{ transform, opacity, zIndex, borderRadius: "110px" }}
          >
            {card}
          </div>
        );
      })}
    </div>
  );
}
