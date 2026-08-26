import { RedriveWordmark } from "@/components/icons/RedriveWordmark";

export function RedPowerDivider() {
  return (
    <section
      className="pointer-events-none relative flex items-center overflow-x-clip"
      style={{ height: "330px", marginTop: "-120px", zIndex: 0 }}
    >
      <div className="animate-marquee-left flex w-max items-center gap-24">
        {Array.from({ length: 4 }).map((_, i) => (
          <RedriveWordmark
            key={i}
            className="pointer-events-none w-auto shrink-0 opacity-50"
            style={{ height: "330px" }}
          />
        ))}
      </div>
    </section>
  );
}
