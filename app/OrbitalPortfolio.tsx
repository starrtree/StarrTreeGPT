"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, Line, useGLTF, useProgress } from "@react-three/drei";
import { gsap } from "gsap";
import { createPortal } from "react-dom";
import * as THREE from "three";
import BranchGallery from "./BranchGallery";
import { ReleasePopup } from "./ReleasePromotion";

export type OrbitalWorld = {
  id: string;
  number: string;
  symbol: string;
  title: string;
  short: string;
  image?: string;
  description: string;
  color: string;
  projects: { name: string; detail: string; status: string; href?: string; cta?: string }[];
};

type OrbitalPortfolioProps = {
  worlds: OrbitalWorld[];
  onNavigateToWorld: (id: string) => void;
  onOpenMusicVault: () => void;
  onIntroComplete: () => void;
};

type OrbConfig = {
  modelUrl: string;
  size: number;
  fallback: "crystal" | "knot";
};

const MODEL_URLS = {
  systems: "/models/Meshy_AI_Auric_Orb_0804231703_texture-optimized_ehvv1v.glb",
  music: "/models/Meshy_AI_Cosmic_Arcade_Console_0717200039_texture-optimized_aexkjw.glb",
  media: "/models/Meshy_AI_Cronuts_A_New_Dream_0717200127_texture-optimized_rjpxfn.glb",
  education: "/models/orb-plant-bio-mv_fvbz1y.glb",
  collaborations: "/models/Meshy_AI_Prismatic_Diamond_0804231813_texture-optimized_rem9i7.glb",
  wisdom: "/models/TechRaEye_orb-optimized_navvdf.glb",
  design: "/models/Meshy_AI_Liquid_Diamond_0804231912_texture-optimized_qeygwd.glb",
} as const;

const STARRX_MODELS = {
  current: "/models/Meshy_AI_Celestial_Ascension_0812024244_texture-optimized_t1hprl.glb",
  starrX2: "/models/Meshy_AI_Cosmic_Ascendant_0812022756_texture-optimized_ppeonk.glb",
  holdingOrb: "/models/Meshy_AI_Cosmic_Arbor_0811152136_texture-optimized_au3seg.glb",
} as const;

const STARRX_URL = STARRX_MODELS.holdingOrb;
const MAX_STARR_BIO_URL = "https://max-starr-bio.mastarrmindx.chatgpt.site/";
const STARRTREE_SYMBOL_URL = "/models/StarrTree1-optimized_jzc43w.glb";
const FORMATION_RADIUS = 3.62;
const FORMATION_TILT = THREE.MathUtils.degToRad(7.5);
const FORMATION_START = -Math.PI / 2;
const FORMATION_Y_OFFSET = -0.34;

type IntroPhase = "symbol" | "welcome" | "studio" | "loading" | "birth" | "system";

const FRONT_VIEW_ANGLES = [
  { x: 0, y: 0, z: 0 },
  { x: -0.12, y: 0.48, z: 0.025 },
  { x: 0.22, y: -0.5, z: -0.025 },
  { x: -0.28, y: 0.16, z: 0.015 },
  { x: 0.15, y: 0.34, z: -0.02 },
] as const;

const ORBITS: Record<string, OrbConfig> = {
  systems: { modelUrl: MODEL_URLS.systems, size: 0.66, fallback: "crystal" },
  music: { modelUrl: MODEL_URLS.music, size: 0.68, fallback: "knot" },
  media: { modelUrl: MODEL_URLS.media, size: 0.7, fallback: "crystal" },
  education: { modelUrl: MODEL_URLS.education, size: 0.64, fallback: "crystal" },
  collaborations: { modelUrl: MODEL_URLS.collaborations, size: 0.7, fallback: "crystal" },
  wisdom: { modelUrl: MODEL_URLS.wisdom, size: 0.68, fallback: "crystal" },
  design: { modelUrl: MODEL_URLS.design, size: 0.66, fallback: "knot" },
};

type MutableValue = { current: number };
type TransitionValue = { current: { value: number } };

function CinematicIntro({ phase, onStart }: { phase: IntroPhase; onStart: () => void }) {
  const { progress, item } = useProgress();
  return (
    <div className={`cinematic-intro phase-${phase}`} aria-live="polite" aria-hidden={phase === "system"}>
      <div className="cinematic-stars" />
      <div className="cinematic-symbol-vignette" aria-hidden="true" />
      {phase === "symbol" && (
        <button type="button" className="seed-spark-prompt" onClick={onStart}>
          <span aria-hidden="true">✦</span>
          Click to Spark the Seed
        </button>
      )}
      <div className="cinematic-welcome" aria-hidden={phase !== "welcome"}>
        <span>Welcome</span>
      </div>
      <div className="cinematic-studio-lockup">
        <span className="cinematic-to-line">To the...</span>
        <h2>STARRTREE</h2>
        <p>THE LIGHT THAT GROWS THROUGH DARKNESS</p>
      </div>
      <div className="orb-loader">
        <div className="orb-loader-mark" aria-hidden="true"><img src="/images/starrtree-gold-logo.png" alt="" /><i /><b /></div>
        <p>ASSEMBLING THE STARR SYSTEM</p>
        <div className="orb-loader-track"><i style={{ transform: `scaleX(${Math.max(progress, 0) / 100})` }} /></div>
        <small>{Math.round(progress)}% {item ? "· AWAKENING STARRX" : "· CALIBRATING ORBITS"}</small>
      </div>
    </div>
  );
}

function StarrTreeIntroSymbol({ active, onActivate, lowPower }: { active: boolean; onActivate: () => void; lowPower: boolean }) {
  const { scene } = useGLTF(STARRTREE_SYMBOL_URL);
  const root = useRef<THREE.Group>(null);
  const symbol = useRef<THREE.Group>(null);
  const outerOrbit = useRef<THREE.Mesh>(null);
  const innerOrbit = useRef<THREE.Mesh>(null);
  const aura = useRef<THREE.Mesh>(null);
  const startedAt = useRef<number | null>(null);
  const normalized = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = 3.25 / Math.max(size.x, size.y, size.z, 0.001);
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = !lowPower;
      child.receiveShadow = false;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const illuminated = materials.map((sourceMaterial) => {
        const material = sourceMaterial.clone();
        if (material instanceof THREE.MeshStandardMaterial) {
          material.envMapIntensity = Math.max(material.envMapIntensity, 2.25);
          material.emissive.lerp(new THREE.Color("#ffbd56"), 0.18);
          material.emissiveIntensity = Math.max(material.emissiveIntensity, 0.72);
          material.needsUpdate = true;
        }
        return material;
      });
      child.material = Array.isArray(child.material) ? illuminated : illuminated[0];
    });
    return { clone, center, scale };
  }, [scene, lowPower]);

  useFrame(({ clock }, delta) => {
    if (!root.current || !symbol.current || !outerOrbit.current || !innerOrbit.current || !aura.current) return;
    if (!active) {
      startedAt.current = null;
      root.current.visible = false;
      root.current.scale.setScalar(0.001);
      return;
    }

    root.current.visible = true;
    if (startedAt.current === null) startedAt.current = clock.elapsedTime;
    const elapsed = clock.elapsedTime - startedAt.current;
    const entrance = THREE.MathUtils.smoothstep(elapsed, 0.05, 0.62);
    const breathe = 1 + Math.sin(elapsed * 1.9) * 0.025;

    root.current.scale.setScalar(Math.max(0.001, entrance * breathe));
    root.current.position.x = Math.sin(elapsed * 0.42) * 0.045 * entrance;
    root.current.position.y = 0.1 + Math.sin(elapsed * 1.25) * 0.065 * entrance;
    root.current.position.z = 0;
    symbol.current.rotation.y = Math.sin(elapsed * 0.38) * 0.14;
    symbol.current.rotation.x = Math.sin(elapsed * 0.52) * 0.035;
    symbol.current.rotation.z = Math.sin(elapsed * 0.44) * 0.018;
    outerOrbit.current.rotation.z += delta * 0.72;
    outerOrbit.current.rotation.y += delta * 0.24;
    innerOrbit.current.rotation.z -= delta * 0.96;
    innerOrbit.current.rotation.x += delta * 0.18;
    outerOrbit.current.scale.setScalar(0.9 + entrance * 0.12 + Math.sin(elapsed * 2.1) * 0.025);
    innerOrbit.current.scale.setScalar(0.86 + entrance * 0.12 + Math.cos(elapsed * 2.5) * 0.02);
    const auraMaterial = aura.current.material as THREE.MeshBasicMaterial;
    auraMaterial.opacity = entrance * (0.03 + Math.sin(elapsed * 3.2) * 0.008);
  });

  return (
    <group
      ref={root}
      scale={0.001}
      visible={false}
      onClick={(event) => {
        event.stopPropagation();
        onActivate();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <group ref={symbol}>
        <group scale={normalized.scale}>
          <primitive object={normalized.clone} position={[-normalized.center.x, -normalized.center.y, -normalized.center.z]} />
        </group>
      </group>
      <mesh ref={outerOrbit} rotation={[Math.PI / 2.35, 0.26, 0]}>
        <torusGeometry args={[1.92, 0.008, 12, 160]} />
        <meshBasicMaterial color="#ffd06d" transparent opacity={0.66} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={innerOrbit} rotation={[Math.PI / 2.8, -0.5, Math.PI / 2]}>
        <torusGeometry args={[1.58, 0.006, 12, 160]} />
        <meshBasicMaterial color="#9c6cff" transparent opacity={0.52} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={aura}>
        <sphereGeometry args={[1.84, 40, 40]} />
        <meshBasicMaterial color="#ffbd56" transparent opacity={0} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#fff0c5" intensity={18} distance={8} decay={1.8} position={[0.2, 1.4, 2.6]} />
      <pointLight color="#8f5cff" intensity={11} distance={7} decay={1.8} position={[-1.8, -0.5, 0.4]} />
    </group>
  );
}

function ModelOrb({ url, color, lowPower }: { url: string; color: string; lowPower: boolean }) {
  const { scene } = useGLTF(url);
  const normalized = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = 1.7 / Math.max(size.x, size.y, size.z, 0.001);
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = false;
      child.receiveShadow = false;
      const sourceMaterials = Array.isArray(child.material) ? child.material : [child.material];
      const texturedMaterials = sourceMaterials.map((sourceMaterial) => {
        const material = sourceMaterial.clone();
        if (material instanceof THREE.MeshStandardMaterial) {
          if (lowPower) {
            // Preserve the GLB's original maps, colors, alpha, UVs and PBR response.
            // Mobile savings come from the renderer and loading strategy, not by
            // replacing textured materials with flat white silhouettes.
            material.envMapIntensity = Math.max(material.envMapIntensity, 0.9);
          } else {
            material.envMapIntensity = Math.max(material.envMapIntensity, 1.35);
            material.emissiveIntensity = Math.max(material.emissiveIntensity, 0.55);
          }
          material.needsUpdate = true;
        }
        return material;
      });
      child.material = Array.isArray(child.material) ? texturedMaterials : texturedMaterials[0];
    });
    return { clone, center, scale };
  }, [scene, lowPower]);

  return (
    <group scale={normalized.scale}>
      <primitive object={normalized.clone} position={[-normalized.center.x, -normalized.center.y, -normalized.center.z]} />
      {!lowPower && <pointLight color={color} intensity={2.2} distance={3.5} decay={2} />}
    </group>
  );
}

function StarrXFigure({ transition, birthReady, onReady, lowPower, mobileLayout, interactionDragged }: { transition: TransitionValue; birthReady: boolean; onReady: () => void; lowPower: boolean; mobileLayout: boolean; interactionDragged: React.MutableRefObject<boolean> }) {
  const { scene } = useGLTF(STARRX_URL);
  const root = useRef<THREE.Group>(null);
  const figure = useRef<THREE.Group>(null);
  const stellarField = useRef<THREE.ShaderMaterial>(null);
  const birthParticles = useRef<THREE.Points>(null);
  const shockRings = useRef<Array<THREE.Mesh | null>>([]);
  const keyLight = useRef<THREE.SpotLight>(null);
  const rimLight = useRef<THREE.PointLight>(null);
  const fillLight = useRef<THREE.PointLight>(null);
  const coreLight = useRef<THREE.PointLight>(null);
  const hoverLight = useRef<THREE.PointLight>(null);
  const originHalo = useRef<THREE.Group>(null);
  const birthStartedAt = useRef<number | null>(null);
  const hovered = useRef(false);
  const [showBioHint, setShowBioHint] = useState(false);
  const auraOutline = useRef<THREE.MeshBasicMaterial>(null);
  const hoverEnergy = useRef(0);
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(150 * 3);
    for (let index = 0; index < 150; index += 1) {
      const angle = index * 2.399963229728653;
      const radius = 0.14 + ((index * 47) % 100) / 100 * 0.9;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle) * radius;
      positions[index * 3 + 2] = -0.18 - ((index * 29) % 30) / 100;
    }
    return positions;
  }, []);
  const normalized = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = 3.05 / Math.max(size.y, 0.001);
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = !lowPower;
      child.receiveShadow = !lowPower;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const naturalMaterials = materials.map((sourceMaterial) => {
        const material = sourceMaterial.clone();
        if (material instanceof THREE.MeshStandardMaterial) {
          // Preserve the authored color, maps and emissive channels. The environment
          // supplies a controlled sheen without washing StarrX in artificial gold.
          material.envMapIntensity = lowPower ? 0.85 : 1.15;
          material.roughness = Math.min(material.roughness, 0.44);
          material.needsUpdate = true;
        }
        return material;
      });
      child.material = Array.isArray(child.material) ? naturalMaterials : naturalMaterials[0];
    });
    return { clone, center, scale };
  }, [scene, lowPower]);

  useEffect(() => {
    onReady();
  }, [onReady, scene]);

  useFrame(({ clock }, delta) => {
    if (!root.current || !figure.current || !originHalo.current || !stellarField.current || !birthParticles.current || !keyLight.current || !rimLight.current || !fillLight.current || !coreLight.current || !hoverLight.current) return;
    if (!birthReady) {
      birthStartedAt.current = null;
      figure.current.scale.setScalar(0.001);
      stellarField.current.uniforms.uFlare.value = 0;
      stellarField.current.uniforms.uAfterglow.value = 0;
      stellarField.current.uniforms.uHover.value = 0;
      return;
    }
    if (birthStartedAt.current === null) birthStartedAt.current = clock.elapsedTime;
    const elapsed = clock.elapsedTime - birthStartedAt.current;
    const birth = THREE.MathUtils.smoothstep(elapsed, 0.32, 1.72);
    const systemVisibility = 1 - transition.current.value;
    const float = Math.sin(clock.elapsedTime * 1.15) * 0.075;
    root.current.position.x = THREE.MathUtils.damp(root.current.position.x, mobileLayout ? -1.05 : 0, 5, delta);
    root.current.position.y = float;
    root.current.rotation.y = Math.sin(clock.elapsedTime * 0.45) * 0.045;
    figure.current.scale.setScalar(Math.max(0.001, birth * systemVisibility));
    originHalo.current.rotation.z += delta * 0.22;
    originHalo.current.scale.setScalar(0.94 + Math.sin(clock.elapsedTime * 1.8) * 0.04);

    const ignition = THREE.MathUtils.smoothstep(elapsed, 0, 0.42);
    const collapse = 1 - THREE.MathUtils.smoothstep(elapsed, 0.62, 1.68);
    const flare = ignition * collapse * systemVisibility;
    const stellarPulse = 0.82 + Math.sin(clock.elapsedTime * 2.4) * 0.18;
    const afterglow = birth * systemVisibility;
    const fadingAfterglow = afterglow * (1 - THREE.MathUtils.smoothstep(elapsed, 1.2, 1.95));
    stellarField.current.uniforms.uTime.value = clock.elapsedTime;
    stellarField.current.uniforms.uFlare.value = flare;
    stellarField.current.uniforms.uAfterglow.value = fadingAfterglow * (0.35 + stellarPulse * 0.12);
    const hoverTarget = (hovered.current ? 1 : mobileLayout ? 0.16 : 0) * systemVisibility;
    hoverEnergy.current = THREE.MathUtils.damp(hoverEnergy.current, hoverTarget, 5.8, delta);
    figure.current.scale.setScalar(Math.max(0.001, birth * systemVisibility * (1 + hoverEnergy.current * 0.055)));
    if (auraOutline.current) auraOutline.current.opacity = hoverEnergy.current * 0.45;
    stellarField.current.uniforms.uHover.value = hoverEnergy.current;
    hoverLight.current.intensity = hoverEnergy.current * 4.5;
    birthParticles.current.scale.setScalar(0.15 + THREE.MathUtils.smoothstep(elapsed, 0.18, 1.55) * 4.5);
    birthParticles.current.rotation.z += delta * 0.12;
    const particleMaterial = birthParticles.current.material as THREE.PointsMaterial;
    particleMaterial.opacity = flare * 0.8;
    shockRings.current.forEach((ring, index) => {
      if (!ring) return;
      const delay = index * 0.24;
      const ringLife = THREE.MathUtils.clamp((elapsed - 0.68 - delay) / 1.75, 0, 1);
      ring.scale.setScalar(0.22 + ringLife * (4.1 + index * 0.7));
      ring.rotation.z += delta * (index % 2 === 0 ? 0.22 : -0.17);
      (ring.material as THREE.MeshBasicMaterial).opacity = Math.sin(ringLife * Math.PI) * 0.3 * systemVisibility;
    });
    keyLight.current.intensity = flare * 10 + afterglow * 1.7;
    rimLight.current.intensity = flare * 7 + afterglow * 1.15;
    fillLight.current.intensity = flare * 4 + afterglow * 0.4;
    coreLight.current.intensity = flare * 15 + afterglow * 0.25;
  });

  return (
    <group ref={root} position={[0, 0, 0]}>
      <group
        ref={figure}
        scale={0.001}
        onClick={(event) => {
          event.stopPropagation();
          if (interactionDragged.current || event.delta > 8) return;
          window.location.assign(MAX_STARR_BIO_URL);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          hovered.current = true;
          setShowBioHint(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          hovered.current = false;
          setShowBioHint(false);
          document.body.style.cursor = "";
        }}
      >
        <group scale={normalized.scale}>
          <primitive object={normalized.clone} position={[-normalized.center.x, -normalized.center.y, -normalized.center.z]} />
        </group>
        <mesh position={[0, 0, -0.18]} scale={[0.72, 1.5, 1]}>
          <torusGeometry args={[1, 0.008, 8, 96]} />
          <meshBasicMaterial ref={auraOutline} color="#ffe3a0" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        {showBioHint && !mobileLayout && <Html center position={[1.15, 0.95, 0]} style={{ pointerEvents: "none" }}>
          <div className="starrx-bio-hud"><small>STARRTREE / THE CREATOR</small><strong>MAX STARR</strong><span>EXPLORE THE BIOGRAPHY ↗</span></div>
        </Html>}
        <group ref={originHalo} position={[0, -1.34, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.76, 0.018, 10, 96]} />
            <meshBasicMaterial color="#ffd978" transparent opacity={0.72} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh rotation={[0.16, 0, 0.52]}>
            <torusGeometry args={[0.92, 0.008, 8, 96]} />
            <meshBasicMaterial color="#9668ff" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh rotation={[-0.12, 0, -0.35]}>
            <ringGeometry args={[0.48, 1.05, 96]} />
            <meshBasicMaterial color="#ffbd56" transparent opacity={0.055} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
        <spotLight ref={keyLight} color="#fff1c8" position={[0.5, 2.7, 3.7]} intensity={0} distance={9} angle={0.62} penumbra={0.85} decay={1.7} castShadow={!lowPower} />
        <pointLight ref={rimLight} color="#8f64ff" position={[-1.65, 0.9, -0.25]} intensity={0} distance={7} decay={1.7} />
        <pointLight ref={fillLight} color="#ff9f3f" position={[1.25, -1.35, 1.4]} intensity={0} distance={6} decay={1.8} />
        <pointLight ref={coreLight} color="#ffd36f" position={[0, 0.22, 0.65]} intensity={0} distance={6.5} decay={1.65} />
        <pointLight ref={hoverLight} color="#ffe2a1" position={[0, 0.25, -0.35]} intensity={0} distance={6.8} decay={1.55} />
      </group>
      <mesh position={[0, 0, -1.35]} renderOrder={-12}>
        <planeGeometry args={[6.8, 6.8]} />
        <shaderMaterial
          ref={stellarField}
          transparent
          depthWrite={false}
          depthTest
          blending={THREE.AdditiveBlending}
          uniforms={{
            uTime: { value: 0 },
            uFlare: { value: 0 },
            uAfterglow: { value: 0 },
            uHover: { value: 0 },
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            uniform float uTime;
            uniform float uFlare;
            uniform float uAfterglow;
            uniform float uHover;
            void main() {
              vec2 p = vUv - 0.5;
              float r = length(p);
              float a = atan(p.y, p.x);
              float core = exp(-r * 34.0);
              float corona = exp(-r * 10.5) * (0.72 + 0.28 * sin(a * 9.0 + uTime * 2.2));
              float crossRay = pow(abs(cos(a * 2.0)), 54.0) * exp(-r * 4.8);
              float fineRay = pow(abs(cos(a * 6.0 + 0.32)), 92.0) * exp(-r * 6.5);
              float ringA = exp(-pow((r - (0.11 + uFlare * 0.18)) * 76.0, 2.0));
              float ringB = exp(-pow((r - (0.18 + uFlare * 0.28)) * 92.0, 2.0));
              float shimmer = 0.88 + 0.12 * sin(uTime * 7.0 + a * 13.0);
              float burst = uFlare * (core * 1.55 + corona * 0.75 + crossRay * 0.82 + fineRay * 0.5 + ringA * 0.42 + ringB * 0.24);
              float glow = uAfterglow * (core * 0.68 + corona * 0.12 + crossRay * 0.06);
              float hoverRing = exp(-pow((r - 0.19) * 11.0, 2.0));
              float hoverGlow = uHover * (exp(-r * 4.4) * 0.38 + crossRay * 0.2 + fineRay * 0.12 + hoverRing * 0.16);
              float energy = (burst + glow + hoverGlow) * shimmer;
              vec3 whiteGold = vec3(1.0, 0.88, 0.58);
              vec3 violet = vec3(0.54, 0.29, 1.0);
              vec3 color = mix(whiteGold, violet, smoothstep(0.05, 0.42, r));
              gl_FragColor = vec4(color * energy, clamp(energy, 0.0, 0.94));
            }
          `}
        />
      </mesh>
      <points ref={birthParticles} position={[0, 0, -1.12]} renderOrder={-10}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ffe2a1" size={0.026} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(node) => {
            shockRings.current[index] = node;
          }}
          position={[0, 0, -1.2 - index * 0.03]}
          rotation={[0, 0, index * 0.62]}
          renderOrder={-11 + index}
        >
          <ringGeometry args={[0.16, 0.168, 96]} />
          <meshBasicMaterial color={index === 1 ? "#9e6cff" : "#ffd77d"} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function ProceduralOrb({ kind, color }: { kind: "crystal" | "knot"; color: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        {kind === "crystal" ? <dodecahedronGeometry args={[0.83, 1]} /> : <torusKnotGeometry args={[0.56, 0.2, 144, 18, 2, 3]} />}
        <meshStandardMaterial color={color} metalness={0.72} roughness={0.18} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      {kind === "crystal" && (
        <mesh scale={1.025}>
          <dodecahedronGeometry args={[0.83, 1]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.13} />
        </mesh>
      )}
      <pointLight color={color} intensity={2} distance={3.5} decay={2} />
    </group>
  );
}

type OrbNodeProps = {
  world: OrbitalWorld;
  config: OrbConfig;
  index: number;
  totalOrbs: number;
  selectedId: string | null;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onSelect: (id: string) => void;
  transition: TransitionValue;
  pageScroll: MutableValue;
  cardIndex: number;
  showDetailedModels: boolean;
  systemReady: boolean;
  lowPower: boolean;
  interactionDragged: React.MutableRefObject<boolean>;
};

function OrbNode({ world, config, index, totalOrbs, selectedId, hoveredId, setHoveredId, onSelect, transition, pageScroll, cardIndex, showDetailedModels, systemReady, lowPower, interactionDragged }: OrbNodeProps) {
  const group = useRef<THREE.Group>(null);
  const { size: viewportSize } = useThree();
  const currentScale = useRef(0.001);
  const selectedBaseRotation = useRef(0);
  const wasSelected = useRef(false);
  const currentPosition = useMemo(() => new THREE.Vector3(), []);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const selected = selectedId === world.id;
  const hovered = hoveredId === world.id;

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const phase = transition.current.value;
    const formationOffset = (index / totalOrbs) * Math.PI * 2;
    const acceleratedAngle = FORMATION_START + formationOffset + pageScroll.current;
    const orbitDepth = Math.sin(acceleratedAngle) * FORMATION_RADIUS;
    const selectionBlend = selected ? phase : 0;
    const selectionFloat = selected ? Math.sin(clock.elapsedTime * 1.05 + index * 0.4) * 0.055 * phase : 0;
    // Keep the planet anchored to the upper-right of the viewport behind the gallery.
    const scrollTravel = THREE.MathUtils.clamp(cardIndex, 0, 1);
    const selectedX = (viewportSize.width / Math.max(viewportSize.height, 1)) * 0.92 * Math.cos(scrollTravel * Math.PI * 2);
    targetPosition.set(
      Math.cos(acceleratedAngle) * FORMATION_RADIUS * (1 - selectionBlend) + selectedX * selectionBlend,
      (orbitDepth * Math.sin(FORMATION_TILT) + FORMATION_Y_OFFSET) * (1 - selectionBlend) + (0.62 + Math.sin(scrollTravel * Math.PI * 2) * 0.3) * selectionBlend + selectionFloat,
      orbitDepth * Math.cos(FORMATION_TILT) * (1 - selectionBlend),
    );
    currentPosition.copy(group.current.position).lerp(targetPosition, 1 - Math.exp(-delta * 5.5));
    group.current.position.copy(currentPosition);

    const hiddenScale = selectedId && !selected ? config.size * (1 - phase) : config.size;
    const expandedScale = viewportSize.width < 700 ? 1.65 : 2.15;
    const selectedScale = selected ? THREE.MathUtils.lerp(config.size, expandedScale, phase) : hiddenScale;
    const targetScale = selectedScale * (hovered && !selectedId ? 1.15 : 1) * (systemReady ? 1 : 0);
    currentScale.current = THREE.MathUtils.damp(currentScale.current, targetScale, 7, delta);
    group.current.scale.setScalar(Math.max(0.001, currentScale.current));

    if (selected && !wasSelected.current) selectedBaseRotation.current = group.current.rotation.y;
    wasSelected.current = selected;

    const idleTiltX = Math.sin(clock.elapsedTime * 0.62 + index * 0.83) * 0.055;
    const idleTiltZ = Math.cos(clock.elapsedTime * 0.53 + index * 0.71) * 0.045;
    const staysCameraFacing = world.id === "media" || world.id === "music";
    const usesFrontViews = world.id === "media" || world.id === "music";
    const frontView = FRONT_VIEW_ANGLES[Math.floor(cardIndex * (FRONT_VIEW_ANGLES.length - 1))];
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, selected ? (usesFrontViews ? frontView.x : 0) : idleTiltX, 4.8, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, selected ? (usesFrontViews ? frontView.z : 0) : idleTiltZ, 4.8, delta);
    if (staysCameraFacing) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, selected && usesFrontViews ? frontView.y + scrollTravel * Math.PI * 2 : 0, 5.4, delta);
    } else if (selected) {
      const projectRotation = scrollTravel * Math.PI * 2;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, selectedBaseRotation.current + projectRotation, 5.4, delta);
    } else {
      group.current.rotation.y += delta * (0.105 + index * 0.009);
    }
  });

  return (
    <group
      ref={group}
      scale={0.001}
      onPointerOver={(event) => {
        event.stopPropagation();
        if (!selectedId) {
          document.body.style.cursor = "pointer";
          setHoveredId(world.id);
        }
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "";
        setHoveredId(null);
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (systemReady && !selectedId && !interactionDragged.current && event.delta <= 8) onSelect(world.id);
      }}
    >
      {config.modelUrl && showDetailedModels ? (
        <Suspense fallback={lowPower ? <ProceduralOrb kind={config.fallback} color={world.color} /> : null}>
          <ModelOrb url={config.modelUrl} color={world.color} lowPower={lowPower} />
        </Suspense>
      ) : <ProceduralOrb kind={config.fallback} color={world.color} />}
      {systemReady && hovered && !selectedId && (
        <Html center position={[0, 1.3, 0]} distanceFactor={7} zIndexRange={[36, 20]}>
          <div className="orb-hover-label" style={{ "--orb-color": world.color } as React.CSSProperties}>
            <span>{world.number}</span><b>{world.title}</b><small>CLICK TO ENTER</small>
          </div>
        </Html>
      )}
    </group>
  );
}

function OrbitGuides({ transition, systemReady }: { transition: TransitionValue; systemReady: boolean }) {
  const group = useRef<THREE.Group>(null);
  const ring = useMemo(
    () => Array.from({ length: 97 }, (_, index) => {
      const angle = (index / 96) * Math.PI * 2;
      const orbitDepth = Math.sin(angle) * FORMATION_RADIUS;
      return new THREE.Vector3(
        Math.cos(angle) * FORMATION_RADIUS,
        orbitDepth * Math.sin(FORMATION_TILT) + FORMATION_Y_OFFSET,
        orbitDepth * Math.cos(FORMATION_TILT),
      );
    }),
    [],
  );
  useFrame(() => {
    if (group.current) group.current.scale.setScalar(Math.max(0.001, (1 - transition.current.value) * (systemReady ? 1 : 0)));
  });
  return (
    <group ref={group} scale={0.001}>
      <Line points={ring} color="#ffc56b" lineWidth={0.48} transparent opacity={0.12} />
    </group>
  );
}

function CameraRig({ selectedId, transition, planetScroll }: { selectedId: string | null; transition: TransitionValue; planetScroll: MutableValue }) {
  const { camera, size } = useThree();
  const landing = useMemo(() => new THREE.Vector3(), []);
  const close = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    landing.set(0, 0.12, size.width < 700 ? 13.2 : 9.1);
    close.set(size.width < 700 ? 0.12 : 0.1, size.width < 700 ? 0.08 : 0.14, size.width < 700 ? 4.55 : 4.25);
    target.copy(landing).lerp(close, transition.current.value);
    camera.position.lerp(target, 1 - Math.exp(-delta * 6));
    camera.lookAt(
      selectedId ? Math.sin(planetScroll.current * Math.PI * 2) * 0.08 : 0,
      selectedId ? Math.cos(planetScroll.current * Math.PI * 2) * 0.06 : 0,
      0,
    );
  });
  return null;
}

type OrbitalSceneProps = {
  worlds: OrbitalWorld[];
  selectedId: string | null;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onSelect: (id: string) => void;
  transition: TransitionValue;
  planetScroll: MutableValue;
  pageScroll: MutableValue;
  birthReady: boolean;
  cardIndex: number;
  showDetailedModels: boolean;
  detailedModelLimit: number;
  systemReady: boolean;
  lowPower: boolean;
  showIntroSymbol: boolean;
  onIntroActivate: () => void;
  onStarrXReady: () => void;
  mobileLayout: boolean;
  interactionDragged: React.MutableRefObject<boolean>;
};

function OrbitalScene(props: OrbitalSceneProps) {
  return (
    <>
      <ambientLight intensity={0.48} color="#6d72c8" />
      <directionalLight position={[5, 7, 6]} intensity={2.35} color="#ffe7b3" castShadow={!props.lowPower} shadow-mapSize-width={props.lowPower ? 512 : 1024} shadow-mapSize-height={props.lowPower ? 512 : 1024} />
      <pointLight position={[-5, -2, 4]} intensity={12} distance={13} color="#7d42ff" />
      <pointLight position={[4, 1, 2]} intensity={9} distance={10} color="#ffad3d" />
      <Environment resolution={props.lowPower ? 32 : 96}>
        <group rotation={[-Math.PI / 4, -0.2, 0]}>
          <Lightformer form="ring" intensity={4} color="#ffe0a1" scale={7} position={[0, 5, -4]} />
          <Lightformer form="rect" intensity={2.5} color="#7750ff" scale={[7, 2]} position={[-5, 0, 2]} rotation={[0, Math.PI / 2, 0]} />
          <Lightformer form="rect" intensity={2} color="#43bfff" scale={[5, 1]} position={[5, -2, 1]} rotation={[0, -Math.PI / 2, 0]} />
        </group>
      </Environment>
      <Suspense fallback={null}>
        <StarrTreeIntroSymbol active={props.showIntroSymbol} onActivate={props.onIntroActivate} lowPower={props.lowPower} />
      </Suspense>
      {!props.mobileLayout && <OrbitGuides transition={props.transition} systemReady={props.systemReady} />}
      <Suspense fallback={null}>
        <StarrXFigure transition={props.transition} birthReady={props.birthReady} onReady={props.onStarrXReady} lowPower={props.lowPower} mobileLayout={props.mobileLayout} interactionDragged={props.interactionDragged} />
      </Suspense>
      {props.worlds.map((world, index) => (!props.mobileLayout || props.selectedId === world.id) && (
        <OrbNode
          key={world.id}
          world={world}
          config={ORBITS[world.id] ?? ORBITS.systems}
          index={index}
          totalOrbs={props.worlds.length}
          selectedId={props.selectedId}
          hoveredId={props.hoveredId}
          setHoveredId={props.setHoveredId}
          onSelect={props.onSelect}
          transition={props.transition}
          pageScroll={props.pageScroll}
          cardIndex={props.cardIndex}
          showDetailedModels={
            props.showDetailedModels &&
            (!props.lowPower || index < props.detailedModelLimit || props.selectedId === world.id)
          }
          systemReady={props.systemReady}
          lowPower={props.lowPower}
          interactionDragged={props.interactionDragged}
        />
      ))}
      {!props.selectedId && props.systemReady && (
        <Html center position={[props.mobileLayout ? -1.05 : 0, props.mobileLayout ? -2.05 : -2.15, 0]} distanceFactor={8} zIndexRange={[12, 5]}>
          <a className="starrx-origin-label" href={MAX_STARR_BIO_URL} aria-label="Open Max Starr's visual biography" onClick={(event) => { if (props.interactionDragged.current) event.preventDefault(); }}>
            <i /><span><b>MAX</b><small>MEET THE CREATOR</small></span><i />
          </a>
        </Html>
      )}
      <CameraRig selectedId={props.selectedId} transition={props.transition} planetScroll={props.planetScroll} />
    </>
  );
}

function MobileWorldPicker({ worlds, activeIndex, onChange, onEnter }: { worlds: OrbitalWorld[]; activeIndex: number; onChange: (index: number) => void; onEnter: (id: string) => void }) {
  const drag = useRef({ pointerId: -1, startX: 0, startY: 0, lastY: 0, remainder: 0 });
  const moved = useRef(false);
  const total = Math.max(worlds.length, 1);
  const step = useCallback((direction: number) => {
    onChange((activeIndex + direction + total) % total);
  }, [activeIndex, onChange, total]);

  const finishDrag = useCallback((element?: HTMLDivElement, pointerId?: number) => {
    if (element && pointerId !== undefined && element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
    drag.current.pointerId = -1;
    drag.current.remainder = 0;
    // Keep the completed gesture classified until the next pointerdown.
  }, []);

  return (
    <aside className="mobile-world-picker" aria-label="Explore StarrTree worlds">
      <div className="mobile-picker-kicker"><span>07 WORLDS</span><small>SWIPE THE WHEEL</small></div>
      <div
        className="mobile-picker-shell"
        role="listbox"
        aria-label="StarrTree world picker"
        aria-activedescendant={`mobile-world-${worlds[activeIndex]?.id ?? "systems"}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") { event.preventDefault(); step(-1); }
          if (event.key === "ArrowDown") { event.preventDefault(); step(1); }
          if (event.key === "Enter" && worlds[activeIndex]) onEnter(worlds[activeIndex].id);
        }}
        onPointerDown={(event) => {
          drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, lastY: event.clientY, remainder: 0 };
          moved.current = false;
          // Preserve the button as the click target until a drag is established.
        }}
        onPointerMove={(event) => {
          if (drag.current.pointerId !== event.pointerId) return;
          const delta = event.clientY - drag.current.lastY;
          drag.current.lastY = event.clientY;
          drag.current.remainder += delta;
          if (Math.hypot(event.clientX - drag.current.startX, event.clientY - drag.current.startY) > 8) {
            moved.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          if (Math.abs(drag.current.remainder) >= 34) {
            moved.current = true;
            step(drag.current.remainder < 0 ? 1 : -1);
            drag.current.remainder = 0;
          }
        }}
        onPointerUp={(event) => finishDrag(event.currentTarget, event.pointerId)}
        onPointerCancel={(event) => { moved.current = true; finishDrag(event.currentTarget, event.pointerId); }}
        onWheel={(event) => {
          event.preventDefault();
          if (Math.abs(event.deltaY) > 4) step(event.deltaY > 0 ? 1 : -1);
        }}
      >
        <div className="mobile-picker-band" aria-hidden="true"><span>SELECTED</span></div>
        <div className="mobile-picker-list">
          {worlds.map((world, index) => {
            let offset = index - activeIndex;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;
            const distance = Math.abs(offset);
            const scale = 1 - Math.min(distance * 0.1, 0.32);
            const opacity = Math.max(0.12, 1 - distance * 0.24);
            return (
              <button
                type="button"
                id={`mobile-world-${world.id}`}
                role="option"
                aria-selected={index === activeIndex}
                key={world.id}
                className={`mobile-picker-item ${index === activeIndex ? "active" : ""}`}
                style={{
                  "--world-color": world.color,
                  opacity,
                  transform: `translate3d(0, calc(-50% + ${offset * 54}px), ${-distance * 18}px) rotateX(${offset * -16}deg) scale(${scale})`,
                } as React.CSSProperties}
                onClick={() => {
                  if (moved.current) return;
                  if (index === activeIndex) onEnter(world.id);
                  else onChange(index);
                }}
              >
                <span>{world.number}</span>
                <b>{world.title}</b>
                {index === activeIndex && <small>ENTER ↗</small>}
              </button>
            );
          })}
        </div>
      </div>
      <p>Tap the highlighted world to enter</p>
    </aside>
  );
}

export default function OrbitalPortfolio({ worlds, onNavigateToWorld, onOpenMusicVault, onIntroComplete }: OrbitalPortfolioProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [starrXReady, setStarrXReady] = useState(false);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("symbol");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [soundtrackIndex, setSoundtrackIndex] = useState(0);
  const soundtrackName = soundtrackIndex === 0 ? "21st" : "Defibrilator";
  const [lowPower, setLowPower] = useState(false);
  const [mobileLayout, setMobileLayout] = useState(false);
  const [mobilePickerIndex, setMobilePickerIndex] = useState(0);
  const [isOrbitDragging, setIsOrbitDragging] = useState(false);
  const [detailedModelLimit, setDetailedModelLimit] = useState(0);
  const transition = useRef({ value: 0 });
  const planetScroll = useRef(0);
  const pageScroll = useRef(0);
  const interactionDragged = useRef(false);
  const orbitDrag = useRef({ pointerId: -1, lastX: 0, lastY: 0, totalX: 0, totalY: 0, mobileRemainder: 0 });
  const soundtrack = useRef<HTMLAudioElement>(null);
  const selectedWorld = worlds.find((world) => world.id === selectedId) ?? null;

  useEffect(() => {
    const updatePowerMode = () => {
      setLowPower(window.innerWidth <= 900);
      setMobileLayout(window.innerWidth <= 620);
    };
    updatePowerMode();
    window.addEventListener("resize", updatePowerMode, { passive: true });
    return () => window.removeEventListener("resize", updatePowerMode);
  }, []);

  useEffect(() => {
    useGLTF.preload(STARRTREE_SYMBOL_URL);
    useGLTF.preload(STARRX_URL);
    const readyTimer = window.setTimeout(() => setReady(true), 900);
    const modelFallbackTimer = window.setTimeout(() => setStarrXReady(true), 6500);
    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(modelFallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (soundtrack.current) soundtrack.current.volume = 0.16;
  }, []);

  useEffect(() => {
    if (lowPower) return;
    Object.values(MODEL_URLS).forEach((url) => useGLTF.preload(url));
  }, [lowPower]);

  useEffect(() => {
    if (!lowPower || introPhase !== "system") return;
    const timers = [
      window.setTimeout(() => setDetailedModelLimit(1), 0),
      ...Array.from({ length: Math.max(0, worlds.length - 1) }, (_, index) =>
        window.setTimeout(() => setDetailedModelLimit(index + 2), 420 * (index + 1)),
      ),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [introPhase, lowPower, worlds.length]);

  const handleStarrXReady = useCallback(() => setStarrXReady(true), []);

  const sparkSeed = useCallback(() => {
    if (introPhase !== "symbol") return;
    document.body.style.cursor = "";
    setIntroPhase("welcome");
    const audio = soundtrack.current;
    if (!audio) return;
    audio.volume = 0.16;
    void audio.play().catch(() => setAudioPlaying(false));
  }, [introPhase]);

  const toggleSoundtrack = useCallback(() => {
    const audio = soundtrack.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => setAudioPlaying(false));
    } else {
      audio.pause();
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("starr-intro-active", introPhase !== "system");
    if (introPhase === "system") onIntroComplete();
    let timer: number | undefined;
    if (introPhase === "welcome") timer = window.setTimeout(() => setIntroPhase("studio"), 720);
    if (introPhase === "studio") {
      timer = window.setTimeout(() => setIntroPhase(ready && starrXReady ? "birth" : "loading"), 1450);
    }
    if (introPhase === "loading" && ready && starrXReady) timer = window.setTimeout(() => setIntroPhase("birth"), 180);
    if (introPhase === "birth") timer = window.setTimeout(() => setIntroPhase("system"), 1950);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [introPhase, ready, starrXReady, onIntroComplete]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.querySelector("dialog[open]") || selectedId || introPhase !== "system" || !["ArrowLeft", "ArrowRight"].includes(event.key) || window.scrollY > window.innerHeight * 0.9) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      if (mobileLayout) setMobilePickerIndex((current) => (current + direction + worlds.length) % worlds.length);
      else pageScroll.current += direction * ((Math.PI * 2) / worlds.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [introPhase, mobileLayout, selectedId, worlds.length]);

  const startOrbitDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (selectedId || introPhase !== "system" || event.button !== 0) return;
    orbitDrag.current = { pointerId: event.pointerId, lastX: event.clientX, lastY: event.clientY, totalX: 0, totalY: 0, mobileRemainder: 0 };
    interactionDragged.current = false;
    // Capturing on pointerdown steals R3F clicks from the canvas.
  }, [introPhase, selectedId]);

  const moveOrbitDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (orbitDrag.current.pointerId !== event.pointerId || selectedId) return;
    const deltaX = event.clientX - orbitDrag.current.lastX;
    const deltaY = event.clientY - orbitDrag.current.lastY;
    orbitDrag.current.lastX = event.clientX;
    orbitDrag.current.lastY = event.clientY;
    orbitDrag.current.totalX += deltaX;
    orbitDrag.current.totalY += deltaY;
    if (Math.hypot(orbitDrag.current.totalX, orbitDrag.current.totalY) <= 8 && !interactionDragged.current) return;
    interactionDragged.current = true;
    if (Math.abs(orbitDrag.current.totalX) <= Math.abs(orbitDrag.current.totalY)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsOrbitDragging(true);
    if (mobileLayout) {
      orbitDrag.current.mobileRemainder += deltaX;
      if (Math.abs(orbitDrag.current.mobileRemainder) >= 44) {
        const direction = orbitDrag.current.mobileRemainder < 0 ? 1 : -1;
        setMobilePickerIndex((current) => (current + direction + worlds.length) % worlds.length);
        orbitDrag.current.mobileRemainder = 0;
      }
    } else {
      pageScroll.current -= deltaX * 0.012;
    }
  }, [mobileLayout, selectedId, worlds.length]);

  const finishOrbitDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (orbitDrag.current.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    orbitDrag.current.pointerId = -1;
    setIsOrbitDragging(false);
    if (event.type === "pointercancel") interactionDragged.current = true;
    // Do not reset before the browser dispatches click; reset on the next press.
  }, []);

  useEffect(() => {
    const tween = gsap.to(transition.current, {
      value: selectedId ? 1 : 0,
      duration: selectedId ? 1.45 : 1.15,
      ease: selectedId ? "power4.inOut" : "power3.inOut",
    });
    if (selectedId) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("planet-open");
      planetScroll.current = 0;
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("planet-open");
    }
    return () => {
      tween.kill();
    };
  }, [selectedId]);

  useEffect(() => () => {
    document.body.style.overflow = "";
    document.body.style.cursor = "";
    document.body.classList.remove("planet-open");
    document.body.classList.remove("starr-intro-active");
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePlanet();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [selectedId]);

  useEffect(() => {
    const onSiteNavigate = () => {
      if (selectedId) closePlanet();
      document.body.style.overflow = "";
      document.body.classList.remove("planet-open");
    };
    window.addEventListener("starrtree:navigate", onSiteNavigate);
    return () => window.removeEventListener("starrtree:navigate", onSiteNavigate);
  }, [selectedId]);

  function closePlanet() {
    document.body.style.overflow = "";
    document.body.classList.remove("planet-open");
    setHoveredId(null);
    setSelectedId(null);
  }

  function selectPlanet(id: string) {
    setCardIndex(0);
    setSelectedId(id);
  }

  return (
    <div className={`orbital-portfolio ${selectedId ? "is-selected" : ""}`}>
      <audio
        ref={soundtrack}
        src={soundtrackIndex === 0 ? "/audio/21st.m4a" : "/audio/defibrilator.m4a"}
        preload="auto"
        loop={soundtrackIndex === 1}
        onEnded={() => setSoundtrackIndex(1)}
        onLoadedData={() => {
          if (soundtrackIndex === 1) void soundtrack.current?.play().catch(() => setAudioPlaying(false));
        }}
        onPlay={() => setAudioPlaying(true)}
        onPause={() => setAudioPlaying(false)}
      />
      {introPhase !== "symbol" && (
        <button
          type="button"
          className={`site-audio-toggle ${audioPlaying ? "is-playing" : ""}`}
          onClick={toggleSoundtrack}
          aria-label={`${audioPlaying ? "Pause" : "Play"} ${soundtrackName}`}
          aria-pressed={audioPlaying}
        >
          <span aria-hidden="true">{audioPlaying ? "Ⅱ" : "▶"}</span>
          <small>{soundtrackName.toUpperCase()}</small>
        </button>
      )}
      <CinematicIntro phase={introPhase} onStart={sparkSeed} />
      <ReleasePopup ready={introPhase === "system"} />
      <div
        className={`orbital-canvas-input ${isOrbitDragging ? "is-dragging" : ""}`}
        onPointerDownCapture={startOrbitDrag}
        onPointerMoveCapture={moveOrbitDrag}
        onPointerUp={finishOrbitDrag}
        onPointerCancel={finishOrbitDrag}
        onClickCapture={(event) => {
          if (interactionDragged.current) { event.preventDefault(); event.stopPropagation(); }
        }}
        onWheel={(event) => {
          if (selectedId || introPhase !== "system" || mobileLayout || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
          event.preventDefault();
          pageScroll.current += THREE.MathUtils.clamp(event.deltaX, -100, 100) * 0.01;
        }}
      >
        <Canvas
          className="orbital-canvas"
          camera={{ position: [0, 0.12, 9.1], fov: 38, near: 0.04, far: 60 }}
          dpr={lowPower ? 1 : [1, 1.35]}
          gl={{ alpha: true, antialias: !lowPower, powerPreference: "high-performance", preserveDrawingBuffer: false }}
          shadows={!lowPower}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.12;
          }}
        >
          <OrbitalScene
            worlds={worlds}
            selectedId={selectedId}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
            onSelect={selectPlanet}
            transition={transition}
            planetScroll={planetScroll}
            pageScroll={pageScroll}
            birthReady={introPhase === "birth" || introPhase === "system"}
            cardIndex={cardIndex}
            showDetailedModels={!lowPower || starrXReady}
            detailedModelLimit={detailedModelLimit}
            systemReady={introPhase === "system"}
            showIntroSymbol={introPhase === "symbol"}
            lowPower={lowPower}
            mobileLayout={mobileLayout}
            interactionDragged={interactionDragged}
            onIntroActivate={sparkSeed}
            onStarrXReady={handleStarrXReady}
          />
        </Canvas>
      </div>

      {!selectedId && introPhase === "system" && (
        <>
          {mobileLayout && (
            <MobileWorldPicker
              worlds={worlds}
              activeIndex={mobilePickerIndex}
              onChange={setMobilePickerIndex}
              onEnter={selectPlanet}
            />
          )}
          <div className="system-spark-guide" role="note">
            <img src="/images/starrtree-gold-logo.png" alt="" aria-hidden="true" />
            <span>
              <b>{mobileLayout ? "Swipe the wheel · tap the highlighted world" : "Drag left or right to orbit the worlds"}</b>
              <small>{mobileLayout ? "Tap MAX to meet the creator" : "Click a world to enter · click MAX to meet the creator"}</small>
            </span>
          </div>
          {!mobileLayout && <div className="orbit-instruction"><span>DRAG TO ORBIT</span><i />SELECT A WORLD</div>}
        </>
      )}

      {selectedWorld && typeof document !== "undefined" && createPortal(
        <BranchGallery key={selectedWorld.id} world={selectedWorld} onClose={closePlanet} onScrollProgress={(progress) => {
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          planetScroll.current = progress;
          setCardIndex(progress);
        }} onExplore={() => {
          const id = selectedWorld.id;
          closePlanet();
          window.setTimeout(() => onNavigateToWorld(id), 100);
        }} />,
        document.body,
      )}
    </div>
  );
}
