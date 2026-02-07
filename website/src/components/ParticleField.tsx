"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ── Shaders ── */

// Particle vertex: per-particle size, alpha, and color
const particleVert = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (280.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

// Particle fragment: soft radial glow with per-particle color
const particleFrag = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float strength = 1.0 - d * 2.0;
    strength = pow(strength, 2.0);
    gl_FragColor = vec4(vColor, strength * vAlpha);
  }
`;

// Curve ribbon vertex
const curveVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Curve ribbon fragment: glowing core + soft falloff + travelling pulse
const curveFrag = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uOpacity;

  void main() {
    float dist = abs(vUv.y - 0.5) * 2.0;

    // Sharp core + soft glow (dialed down)
    float core = exp(-dist * dist * 60.0) * 0.5;
    float glow = exp(-dist * dist * 6.0) * 0.18;
    float intensity = core + glow;

    // Travelling pulse
    float pulse = 0.6 + 0.4 * sin(uTime * 0.8 - vUv.x * 8.0);

    // Fade edges
    float edge = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);

    gl_FragColor = vec4(uColor, intensity * pulse * edge * uOpacity);
  }
`;

/* ── Sigmoid prediction curve ── */
function sigmoid(x: number, steepness: number, midpoint: number): number {
  return 1.0 / (1.0 + Math.exp(-steepness * (x - midpoint)));
}

/* ── Color palette ── */
// Gold (primary), warm amber, cool teal, silver-blue
const palette = [
  new THREE.Color("hsl(43, 100%, 50%)"),  // gold
  new THREE.Color("hsl(43, 100%, 50%)"),  // gold (double weight)
  new THREE.Color("hsl(30, 75%, 48%)"),   // warm amber
  new THREE.Color("hsl(20, 55%, 45%)"),   // copper
  new THREE.Color("hsl(195, 45%, 50%)"),  // muted teal
  new THREE.Color("hsl(215, 30%, 55%)"),  // silver-blue
];

export function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const gold = new THREE.Color("hsl(43, 100%, 50%)");
    const teal = new THREE.Color("hsl(195, 40%, 42%)");

    /* ── Prediction curve (ribbon mesh) ── */
    const curveSegments = 128;
    const curveWidth = 50;
    const curveHeight = 20;
    const ribbonHalfWidth = 1.8;

    const curvePositions = new Float32Array(curveSegments * 2 * 3);
    const curveUvs = new Float32Array(curveSegments * 2 * 2);
    const curveIndices: number[] = [];

    for (let i = 0; i < curveSegments; i++) {
      const u = i / (curveSegments - 1);
      curveUvs[i * 4] = u;
      curveUvs[i * 4 + 1] = 0;
      curveUvs[i * 4 + 2] = u;
      curveUvs[i * 4 + 3] = 1;
      if (i < curveSegments - 1) {
        const a = i * 2;
        curveIndices.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
      }
    }

    const curveGeom = new THREE.BufferGeometry();
    curveGeom.setAttribute("position", new THREE.BufferAttribute(curvePositions, 3));
    curveGeom.setAttribute("uv", new THREE.BufferAttribute(curveUvs, 2));
    curveGeom.setIndex(curveIndices);

    // Primary curve — gold, reduced opacity
    const curveMat = new THREE.ShaderMaterial({
      vertexShader: curveVert,
      fragmentShader: curveFrag,
      uniforms: {
        uColor: { value: gold },
        uTime: { value: 0 },
        uOpacity: { value: 0.7 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const curveMesh = new THREE.Mesh(curveGeom, curveMat);
    curveMesh.position.z = -5;
    scene.add(curveMesh);

    function updateCurve(t: number) {
      const pos = curveGeom.attributes.position.array as Float32Array;
      const mid = 0.5 + 0.15 * Math.sin(t * 0.3);
      const steepness = 6 + 2 * Math.sin(t * 0.2);

      for (let i = 0; i < curveSegments; i++) {
        const u = i / (curveSegments - 1);
        const x = (u - 0.5) * curveWidth;
        const prob = sigmoid(u, steepness, mid);
        const y = (prob - 0.5) * curveHeight;
        const noise = Math.sin(u * 20 + t * 1.5) * 0.15;

        pos[i * 6] = x;
        pos[i * 6 + 1] = y + ribbonHalfWidth + noise;
        pos[i * 6 + 2] = 0;
        pos[i * 6 + 3] = x;
        pos[i * 6 + 4] = y - ribbonHalfWidth + noise;
        pos[i * 6 + 5] = 0;
      }
      curveGeom.attributes.position.needsUpdate = true;
    }

    /* ── Ghost curve — teal tinted, much dimmer ── */
    const curve2Geom = curveGeom.clone();
    const curve2Mat = new THREE.ShaderMaterial({
      vertexShader: curveVert,
      fragmentShader: curveFrag,
      uniforms: {
        uColor: { value: teal },
        uTime: { value: 0 },
        uOpacity: { value: 0.35 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const curve2Mesh = new THREE.Mesh(curve2Geom, curve2Mat);
    curve2Mesh.position.z = -8;
    scene.add(curve2Mesh);

    function updateCurve2(t: number) {
      const pos = curve2Geom.attributes.position.array as Float32Array;
      const mid = 0.5 + 0.12 * Math.sin(t * 0.3 - 1.5);
      const steepness = 5 + 1.5 * Math.sin(t * 0.2 - 1.0);

      for (let i = 0; i < curveSegments; i++) {
        const u = i / (curveSegments - 1);
        const x = (u - 0.5) * curveWidth;
        const prob = sigmoid(u, steepness, mid);
        const y = (prob - 0.5) * curveHeight * 0.8;

        pos[i * 6] = x;
        pos[i * 6 + 1] = y + ribbonHalfWidth * 0.8;
        pos[i * 6 + 2] = 0;
        pos[i * 6 + 3] = x;
        pos[i * 6 + 4] = y - ribbonHalfWidth * 0.8;
        pos[i * 6 + 5] = 0;
      }
      curve2Geom.attributes.position.needsUpdate = true;
    }

    /* ── Particles with per-particle color ── */
    const particleCount = 160;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const alphas = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const homeU = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      homeU[i] = u;
      const x = (u - 0.5) * curveWidth;
      const prob = sigmoid(u, 6, 0.5);
      const y = (prob - 0.5) * curveHeight;

      positions[i * 3] = x + (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = y + (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;

      sizes[i] = 0.5 + Math.random() * 1.5;
      // Dialed-down opacity
      alphas[i] = 0.08 + Math.random() * 0.2;

      // Pick a color from the palette
      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeom.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    particleGeom.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
    particleGeom.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.ShaderMaterial({
      vertexShader: particleVert,
      fragmentShader: particleFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    /* ── Connection lines — very faint ── */
    const lineMat = new THREE.LineBasicMaterial({
      color: gold,
      transparent: true,
      opacity: 0.025,
      blending: THREE.AdditiveBlending,
    });
    const lineGeom = new THREE.BufferGeometry();
    const maxLines = particleCount * 8;
    const linePositions = new Float32Array(maxLines * 6);
    lineGeom.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    scene.add(lines);

    /* ── Animation loop ── */
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      curveMat.uniforms.uTime.value = t;
      curve2Mat.uniforms.uTime.value = t;
      updateCurve(t);
      updateCurve2(t);

      const curveMid = 0.5 + 0.15 * Math.sin(t * 0.3);
      const curveSteep = 6 + 2 * Math.sin(t * 0.2);

      const pos = particleGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const u = homeU[i];
        const targetX = (u - 0.5) * curveWidth;
        const prob = sigmoid(u, curveSteep, curveMid);
        const targetY = (prob - 0.5) * curveHeight;

        const dx = targetX - pos[i * 3];
        const dy = targetY - pos[i * 3 + 1];
        velocities[i * 3] += dx * 0.0003;
        velocities[i * 3 + 1] += dy * 0.0003;

        velocities[i * 3] *= 0.998;
        velocities[i * 3 + 1] *= 0.998;
        velocities[i * 3 + 2] *= 0.998;

        pos[i * 3] += velocities[i * 3];
        pos[i * 3 + 1] += velocities[i * 3 + 1];
        pos[i * 3 + 2] += velocities[i * 3 + 2];

        homeU[i] += (Math.random() - 0.5) * 0.0005;
        if (homeU[i] < 0) homeU[i] = 0;
        if (homeU[i] > 1) homeU[i] = 1;

        if (pos[i * 3 + 2] > 10) velocities[i * 3 + 2] -= 0.005;
        if (pos[i * 3 + 2] < -10) velocities[i * 3 + 2] += 0.005;
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Connection lines
      const lp = lineGeom.attributes.position.array as Float32Array;
      let li = 0;
      const thresholdSq = 64; // 8^2

      for (let i = 0; i < particleCount && li < maxLines * 6; i++) {
        for (let j = i + 1; j < particleCount && li < maxLines * 6; j++) {
          const ddx = pos[i * 3] - pos[j * 3];
          const ddy = pos[i * 3 + 1] - pos[j * 3 + 1];
          const ddz = pos[i * 3 + 2] - pos[j * 3 + 2];
          const distSq = ddx * ddx + ddy * ddy + ddz * ddz;

          if (distSq < thresholdSq) {
            lp[li++] = pos[i * 3];
            lp[li++] = pos[i * 3 + 1];
            lp[li++] = pos[i * 3 + 2];
            lp[li++] = pos[j * 3];
            lp[li++] = pos[j * 3 + 1];
            lp[li++] = pos[j * 3 + 2];
          }
        }
      }
      lineGeom.setDrawRange(0, li / 3);
      lineGeom.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      curveGeom.dispose();
      curveMat.dispose();
      curve2Geom.dispose();
      curve2Mat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      lineGeom.dispose();
      lineMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
