const BLOBS = [
  // Corner blob — overflows top-left
  { color: "rgba(255,0,0,0.8)",  size: "55%", top: "-15%", left: "-12%", anim: "lava-corner 7s ease-in-out infinite" },
  // Corner child top-left
  { color: "rgba(255,0,0,0.5)",  size: "22%", top: "-5%",  left: "8%",   anim: "lava-corner-child 6s ease-in-out infinite" },
  // Corner blob — overflows top-right
  { color: "rgba(255,0,0,0.8)",  size: "55%", top: "-30%", left: "65%",  anim: "lava-corner-r 8s ease-in-out infinite" },
  // Main blobs
  { color: "rgba(255,0,0,0.8)",  size: "45%", top: "5%",  left: "10%", anim: "lava-1 8s ease-in-out infinite" },
  { color: "rgba(255,0,0,0.75)", size: "40%", top: "10%", left: "75%", anim: "lava-2 6s ease-in-out infinite" },
  { color: "rgba(255,0,0,0.7)",  size: "50%", top: "55%", left: "70%", anim: "lava-3 7s ease-in-out infinite" },
  { color: "rgba(255,0,0,0.65)", size: "45%", top: "60%", left: "15%", anim: "lava-4 9s ease-in-out infinite" },
  { color: "rgba(255,0,0,0.6)",  size: "35%", top: "30%", left: "45%", anim: "lava-5 5s ease-in-out infinite" },
  // Child blobs
  { color: "rgba(255,0,0,0.5)",  size: "20%", top: "8%",  left: "25%", anim: "lava-child-1 6s ease-in-out infinite" },
  { color: "rgba(255,0,0,0.45)", size: "18%", top: "50%", left: "55%", anim: "lava-child-2 7s ease-in-out infinite" },
  { color: "rgba(255,0,0,0.5)",  size: "22%", top: "65%", left: "80%", anim: "lava-child-3 5s ease-in-out infinite" },
];

export function LavaBackground() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes lava-corner {
  0%, 100% { transform: translate(0,0) scale(1,1); opacity: 0.8; }
  20%  { transform: translate(5%,6%) scale(1.3,0.75); opacity: 0.85; }
  35%  { transform: translate(7%,4%) scale(1.5,0.68); opacity: 0.92; }
  42%  { transform: translate(8%,3%) scale(1.6,0.65); opacity: 1; }
  50%  { transform: translate(6%,5%) scale(1.4,0.72); opacity: 0.88; }
  60%  { transform: translate(-3%,8%) scale(0.7,1.4); opacity: 0.8; }
  80%  { transform: translate(4%,-4%) scale(0.85,1.15); opacity: 0.8; }
}
@keyframes lava-corner-child {
  0%, 100% { transform: translate(0,0) scale(0.3); opacity: 0; }
  15%  { transform: translate(5%,4%) scale(0.5); opacity: 0; }
  30%  { transform: translate(14%,10%) scale(1.1,0.85); opacity: 0.6; }
  42%  { transform: translate(22%,15%) scale(1.2,1.0); opacity: 0.85; }
  50%  { transform: translate(28%,18%) scale(1.0,1.2); opacity: 1; }
  58%  { transform: translate(24%,20%) scale(1.05,1.1); opacity: 0.85; }
  72%  { transform: translate(12%,22%) scale(1.1,0.7); opacity: 0.45; }
  90%  { transform: translate(3%,6%) scale(0.4); opacity: 0; }
}
@keyframes lava-corner-r {
  0%, 100% { transform: translate(0,0) scale(1,1); opacity: 0.8; }
  18%  { transform: translate(-6%,8%) scale(1.2,0.8); opacity: 0.85; }
  30%  { transform: translate(-9%,6%) scale(1.4,0.72); opacity: 0.92; }
  38%  { transform: translate(-10%,5%) scale(1.5,0.7); opacity: 1; }
  46%  { transform: translate(-8%,7%) scale(1.35,0.76); opacity: 0.88; }
  55%  { transform: translate(4%,10%) scale(0.7,1.35); opacity: 0.8; }
  75%  { transform: translate(-3%,-6%) scale(0.9,1.2); opacity: 0.8; }
}
@keyframes lava-1 {
  0%, 100% { transform: translate(0,0) scale(1,1); opacity: 0.8; }
  20%  { transform: translate(6%,8%) scale(1.3,0.7); opacity: 0.85; }
  40%  { transform: translate(10%,4%) scale(0.6,1.4); opacity: 0.8; }
  45%  { transform: translate(9%,5%) scale(1.1,1.0); opacity: 0.9; }
  52%  { transform: translate(8%,6%) scale(1.5,0.8); opacity: 1; }
  60%  { transform: translate(4%,8%) scale(1.35,0.85); opacity: 0.88; }
  70%  { transform: translate(-4%,10%) scale(1.0,1.1); opacity: 0.8; }
  80%  { transform: translate(3%,-5%) scale(0.8,1.2); opacity: 0.8; }
}
@keyframes lava-2 {
  0%, 100% { transform: translate(0,0) scale(1,1); opacity: 0.75; }
  15%  { transform: translate(-10%,5%) scale(0.7,1.5); opacity: 0.8; }
  25%  { transform: translate(-9%,0%) scale(1.2,0.9); opacity: 0.88; }
  32%  { transform: translate(-8%,-2%) scale(1.6,0.6); opacity: 1; }
  40%  { transform: translate(-7%,-5%) scale(1.4,0.7); opacity: 0.88; }
  55%  { transform: translate(8%,-4%) scale(0.8,1.3); opacity: 0.75; }
  75%  { transform: translate(4%,8%) scale(1.4,0.7); opacity: 0.75; }
}
@keyframes lava-3 {
  0%, 100% { transform: translate(0,0) scale(1,1); opacity: 0.7; }
  25%  { transform: translate(8%,-10%) scale(1.4,0.65); opacity: 0.75; }
  38%  { transform: translate(2%,-9%) scale(1.45,0.62); opacity: 0.88; }
  46%  { transform: translate(-2%,-8%) scale(1.5,0.6); opacity: 1; }
  54%  { transform: translate(-4%,-7%) scale(1.2,0.8); opacity: 0.85; }
  65%  { transform: translate(-5%,-6%) scale(0.6,1.5); opacity: 0.7; }
  80%  { transform: translate(-8%,6%) scale(1.5,0.75); opacity: 0.7; }
}
@keyframes lava-4 {
  0%, 100% { transform: translate(0,0) scale(1,1); opacity: 0.65; }
  20%  { transform: translate(5%,-8%) scale(0.65,1.4); opacity: 0.7; }
  34%  { transform: translate(7%,-2%) scale(1.2,0.9); opacity: 0.85; }
  42%  { transform: translate(8%,2%) scale(1.5,0.7); opacity: 1; }
  50%  { transform: translate(9%,4%) scale(1.35,0.75); opacity: 0.85; }
  60%  { transform: translate(10%,6%) scale(1.1,0.9); opacity: 0.7; }
  75%  { transform: translate(-6%,4%) scale(0.75,1.3); opacity: 0.65; }
}
@keyframes lava-5 {
  0%, 100% { transform: translate(0,0) scale(1,1); opacity: 0.6; }
  18%  { transform: translate(-5%,7%) scale(1.3,0.75); opacity: 0.75; }
  28%  { transform: translate(-8%,10%) scale(1.6,0.6); opacity: 1; }
  38%  { transform: translate(-6%,8%) scale(1.3,0.75); opacity: 0.8; }
  50%  { transform: translate(-2%,6%) scale(0.9,1.2); opacity: 0.65; }
  65%  { transform: translate(6%,5%) scale(0.5,1.6); opacity: 0.6; }
}
@keyframes lava-child-1 {
  0%, 100% { transform: translate(0,0) scale(0.3); opacity: 0; }
  12%  { transform: translate(2%,2%) scale(0.5); opacity: 0.1; }
  28%  { transform: translate(12%,6%) scale(1.0,0.85); opacity: 0.55; }
  40%  { transform: translate(20%,12%) scale(1.15,0.95); opacity: 0.8; }
  50%  { transform: translate(25%,15%) scale(0.9,1.1); opacity: 1; }
  60%  { transform: translate(20%,18%) scale(1.0,0.95); opacity: 0.75; }
  75%  { transform: translate(10%,20%) scale(1.1,0.7); opacity: 0.4; }
  90%  { transform: translate(3%,5%) scale(0.4); opacity: 0; }
}
@keyframes lava-child-2 {
  0%, 100% { transform: translate(0,0) scale(0.3); opacity: 0; }
  15%  { transform: translate(-5%,-3%) scale(0.5); opacity: 0.1; }
  32%  { transform: translate(-14%,-8%) scale(0.95,0.9); opacity: 0.6; }
  45%  { transform: translate(-16%,-14%) scale(1.0,1.1); opacity: 0.85; }
  55%  { transform: translate(-10%,-18%) scale(0.8,1.3); opacity: 1; }
  65%  { transform: translate(-8%,-14%) scale(0.9,1.1); opacity: 0.7; }
  78%  { transform: translate(-5%,-8%) scale(1.0,0.8); opacity: 0.35; }
  92%  { transform: translate(-2%,-2%) scale(0.3); opacity: 0; }
}
@keyframes lava-child-3 {
  0%, 100% { transform: translate(0,0) scale(0.2); opacity: 0; }
  18%  { transform: translate(-6%,4%) scale(0.5); opacity: 0.1; }
  35%  { transform: translate(-15%,9%) scale(1.0,0.8); opacity: 0.5; }
  48%  { transform: translate(-18%,16%) scale(1.15,1.0); opacity: 0.8; }
  58%  { transform: translate(-15%,20%) scale(0.7,1.2); opacity: 1; }
  68%  { transform: translate(-12%,18%) scale(0.8,1.05); opacity: 0.7; }
  80%  { transform: translate(-5%,8%) scale(0.5); opacity: 0.25; }
}
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {BLOBS.map((blob, i) => (
          <div
            key={i}
            className="absolute rounded-full will-change-transform"
            style={{
              width: blob.size,
              height: blob.size,
              top: blob.top,
              left: blob.left,
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              filter: "blur(80px)",
              animation: blob.anim,
            }}
          />
        ))}
      </div>
    </>
  );
}
