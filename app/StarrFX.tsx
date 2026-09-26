"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  phase: number;
};

export default function StarrFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    const burstLayer = burstRef.current;
    if (!canvas || !cursor || !burstLayer) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const lowPower = window.innerWidth <= 900 || navigator.maxTouchPoints > 0;
    let ratio = lowPower ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    let particles: Particle[] = [];
    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    let lastTime = performance.now();
    let animationId = 0;
    const colors = ["255,189,86", "173,95,255", "84,190,255", "255,255,255"];

    function makeParticles() {
      const count = reduceMotion ? 18 : lowPower ? 18 : width < 700 ? 32 : 76;
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (index % 7 === 0 ? 0.12 : 0.035),
        vy: (Math.random() - 0.5) * 0.035,
        radius: Math.random() * 1.25 + 0.25,
        alpha: Math.random() * 0.48 + 0.12,
        color: colors[index % colors.length],
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      ratio = lowPower ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      makeParticles();
    }

    function draw(time: number) {
      const delta = Math.min((time - lastTime) / 16.667, 2);
      lastTime = time;
      context.clearRect(0, 0, width, height);
      if (finePointer) {
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      particles.forEach((particle, index) => {
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;

        const dx = particle.x - mouseX;
        const dy = particle.y - mouseY;
        const pointerDistance = Math.hypot(dx, dy);
        if (finePointer && pointerDistance < 120 && pointerDistance > 1) {
          particle.x += (dx / pointerDistance) * 0.17 * delta;
          particle.y += (dy / pointerDistance) * 0.17 * delta;
        }

        const pulse = Math.sin(time * 0.001 + particle.phase) * 0.22 + 0.78;
        context.beginPath();
        context.fillStyle = `rgba(${particle.color},${particle.alpha * pulse})`;
        context.shadowColor = `rgba(${particle.color},.8)`;
        context.shadowBlur = lowPower ? 0 : particle.radius > 1 ? 9 : 4;
        context.arc(particle.x, particle.y, particle.radius * pulse, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;

        if (width > 760 && index < 48) {
          for (let otherIndex = index + 1; otherIndex < 48; otherIndex += 1) {
            const other = particles[otherIndex];
            const lineDistance = Math.hypot(particle.x - other.x, particle.y - other.y);
            if (lineDistance < 108) {
              context.beginPath();
              context.strokeStyle = `rgba(${particle.color},${(1 - lineDistance / 108) * 0.09})`;
              context.lineWidth = 0.45;
              context.moveTo(particle.x, particle.y);
              context.lineTo(other.x, other.y);
              context.stroke();
            }
          }
        }
      });

      if (!reduceMotion) animationId = window.requestAnimationFrame(draw);
    }

    function onPointerMove(event: PointerEvent) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      const x = event.clientX / width - 0.5;
      const y = event.clientY / height - 0.5;
      document.documentElement.style.setProperty("--pointer-x", x.toFixed(3));
      document.documentElement.style.setProperty("--pointer-y", y.toFixed(3));
      cursor.classList.add("is-visible");
    }

    function onPointerOut(event: PointerEvent) {
      if (!event.relatedTarget) {
        cursor.classList.remove("is-visible");
      }
    }

    function createBurst(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest("button, a, .gallery-track figure")) return;
      const palette = ["#ffbd56", "#b56cff", "#63c8ff", "#ffffff"];
      for (let index = 0; index < 8; index += 1) {
        const spark = document.createElement("i");
        const angle = (Math.PI * 2 * index) / 8 + Math.random() * 0.3;
        const distance = 20 + Math.random() * 34;
        spark.style.left = `${event.clientX}px`;
        spark.style.top = `${event.clientY}px`;
        spark.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
        spark.style.setProperty("--spark-y", `${Math.sin(angle) * distance}px`);
        spark.style.setProperty("--spark-color", palette[index % palette.length]);
        burstLayer.appendChild(spark);
        window.setTimeout(() => spark.remove(), 740);
      }
    }

    const revealTargets = document.querySelectorAll<HTMLElement>(
      ".manifesto-grid, .manifesto-image, .section-heading, .world-selector, .world-detail, .story-intro, .story-track, .services-title, .service-grid, .gallery-heading, .gallery-track, .closing-copy",
    );
    revealTargets.forEach((element) => element.classList.add("fx-reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    revealTargets.forEach((element) => observer.observe(element));

    const magneticElements = Array.from(document.querySelectorAll<HTMLElement>(".primary-button, .nav-cta"));
    const magneticCleanups = magneticElements.map((element) => {
      const move = (event: PointerEvent) => {
        if (!finePointer) return;
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
        element.style.setProperty("--mag-x", `${x}px`);
        element.style.setProperty("--mag-y", `${y}px`);
      };
      const reset = () => {
        element.style.setProperty("--mag-x", "0px");
        element.style.setProperty("--mag-y", "0px");
      };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerleave", reset);
      return () => {
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", reset);
      };
    });

    const tiltElements = Array.from(document.querySelectorAll<HTMLElement>(".service-card"));
    const tiltCleanups = tiltElements.map((element) => {
      const move = (event: PointerEvent) => {
        if (!finePointer) return;
        const rect = element.getBoundingClientRect();
        const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
        const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
        element.style.setProperty("--tilt-x", `${rx}deg`);
        element.style.setProperty("--tilt-y", `${ry}deg`);
        element.style.setProperty("--light-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
        element.style.setProperty("--light-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
      };
      const reset = () => {
        element.style.setProperty("--tilt-x", "0deg");
        element.style.setProperty("--tilt-y", "0deg");
      };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerleave", reset);
      return () => {
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", reset);
      };
    });

    resize();
    if (reduceMotion) draw(performance.now());
    else animationId = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("click", createBurst, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("click", createBurst);
      observer.disconnect();
      magneticCleanups.forEach((cleanup) => cleanup());
      tiltCleanups.forEach((cleanup) => cleanup());
      document.documentElement.style.removeProperty("--pointer-x");
      document.documentElement.style.removeProperty("--pointer-y");
    };
  }, []);

  return (
    <div className="starr-fx" aria-hidden="true">
      <canvas ref={canvasRef} className="fx-canvas" />
      <div className="fx-aurora fx-aurora-one" />
      <div className="fx-aurora fx-aurora-two" />
      <div className="fx-cursor" ref={cursorRef} />
      <div className="fx-burst-layer" ref={burstRef} />
      <div className="fx-grain" />
    </div>
  );
}
