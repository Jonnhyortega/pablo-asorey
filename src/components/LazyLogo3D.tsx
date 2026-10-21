"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Hero3DLogo = dynamic(() => import("./Hero3DLogo"), { ssr: false });

// Monta el logo 3D (three.js) solo cuando el contenedor se acerca al viewport
export default function LazyLogo3D() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-[220px] w-full md:h-[320px]">
      {visible && <Hero3DLogo className="h-[220px] md:h-[320px]" />}
    </div>
  );
}
