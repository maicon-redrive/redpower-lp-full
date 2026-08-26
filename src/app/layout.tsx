import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const glancyr = localFont({
  src: "./fonts/GlancyrNeue-VF.ttf",
  variable: "--font-glancyr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RedPower | Redrive",
  description:
    "RedPower — o programa que une método, conhecimento e execução para colocar sua máquina de vendas com IA em operação completa.",
};

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} ${glancyr.variable} h-full antialiased`}>
      <head>
        {PIXEL_ID && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {GTM_ID && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
        {PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        )}
        <Script id="rp-utms" strategy="afterInteractive">
          {`(function(){try{var p=new URLSearchParams(location.search),k=["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","gclid"],d={};k.forEach(function(n){var v=p.get(n);if(v)d[n]=v});if(Object.keys(d).length)document.cookie="rp_utms="+encodeURIComponent(JSON.stringify(d))+";max-age=2592000;path=/;SameSite=Lax"}catch(e){}})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
