import React, { useEffect, useRef, memo } from "react";

const WAVE_LAYERS = [
  { c: "w1", y: 430, a: 26, f: 1.1, p: 0.2, speed: 0.00045 },
  { c: "w2", y: 545, a: 30, f: 0.85, p: 1.9, speed: -0.00035 },
  { c: "w3", y: 665, a: 26, f: 1.3, p: 3.1, speed: 0.00055 },
  { c: "w4", y: 790, a: 22, f: 0.95, p: 4.6, speed: -0.0004 },
];

const buildWavePath = (baseY, amp, freq, phase) => {
  let d = `M0,${baseY}`;
  for (let x = 0; x <= 1440; x += 40) {
    const primary = Math.sin((x / 1440) * Math.PI * 2 * freq + phase) * amp;
    const harmonic = Math.sin((x / 1440) * Math.PI * 6 * freq + phase * 2) * amp * 0.25;
    d += ` L${x},${(baseY + primary + harmonic).toFixed(1)}`;
  }
  return d;
};

const SeaBackdrop = memo(() => {
  const svgRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let frameId;
    let start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      if (svgRef.current) {
        WAVE_LAYERS.forEach((layer) => {
          const currentPhase = layer.p + elapsed * layer.speed;
          const crestD = buildWavePath(layer.y, layer.a, layer.f, currentPhase);
          const fillPath = svgRef.current.querySelector(`path.${layer.c}`);
          const crestPath = svgRef.current.querySelector(`path.crest-${layer.c}`);
          if (fillPath) fillPath.setAttribute("d", `${crestD} L1440,900 L0,900 Z`);
          if (crestPath) crestPath.setAttribute("d", crestD);
        });
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="sea" aria-hidden="true">
      <svg
        ref={svgRef}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="sea-sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--sun)" stopOpacity="1" />
            <stop offset="0.55" stopColor="var(--sun)" stopOpacity="0.45" />
            <stop offset="1" stopColor="var(--sun)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="sea__sun" cx="1080" cy="360" r="340" />
        {WAVE_LAYERS.map((layer) => {
          const initialD = buildWavePath(layer.y, layer.a, layer.f, layer.p);
          return (
            <g key={layer.c}>
              <path
                className={layer.c}
                d={`${initialD} L1440,900 L0,900 Z`}
              />
              <path
                className={`crest crest-${layer.c}`}
                d={initialD}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
});

SeaBackdrop.displayName = "SeaBackdrop";

export default SeaBackdrop;

