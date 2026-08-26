"use client";

import { useEffect, useState } from "react";

/** Animates from 0 up to a numeric target while `active`, keeping any prefix/suffix text. */
export function CountUpValue({
  active,
  target,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  active: boolean;
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    const duration = 800;
    const start = performance.now();

    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return (
    <span className="tabular-nums">
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
