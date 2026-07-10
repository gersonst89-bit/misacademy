import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  ox: number; // original X for oscillation
  oy: number; // original Y
  oz: number; // original Z
}

export default function Scroll3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();

    // Perspective Camera: we place it at Z = 500 initially
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 3000);
    camera.position.z = 500;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle distribution setup
    const particleCount = 120;
    const maxDistance = 150;
    const boxWidth = 1000;
    const boxHeight = 800;
    const boxDepth = 2000; // Deep Z axis for the scroll path

    const particles: Particle[] = [];
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Distribute particles inside a long 3D volume
      const p = {
        x: (Math.random() - 0.5) * boxWidth,
        y: (Math.random() - 0.5) * boxHeight,
        z: (Math.random() - 0.5) * boxDepth - 300, // extends from Z = -1300 to Z = 700
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        vz: (Math.random() - 0.5) * 0.1,
        ox: 0,
        oy: 0,
        oz: 0,
      };
      p.ox = p.x;
      p.oy = p.y;
      p.oz = p.z;
      particles.push(p);

      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    }

    // Helper: Create a glowing soft circular texture dynamically
    const createCircleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.25, "rgba(56, 189, 248, 0.8)"); // Light Sky Blue
        gradient.addColorStop(0.6, "rgba(14, 165, 233, 0.2)");  // Theme Sky Blue
        gradient.addColorStop(1, "rgba(14, 165, 233, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    // 1. Points geometry
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const pointMaterial = new THREE.PointsMaterial({
      color: 0xffffff, // Point texture defines the color
      size: 8,
      map: createCircleTexture(),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const pointCloud = new THREE.Points(pointsGeometry, pointMaterial);
    scene.add(pointCloud);

    // 2. Lines geometry
    const lineMaxConnections = 600;
    const linePositions = new Float32Array(lineMaxConnections * 2 * 3);
    const lineColors = new Float32Array(lineMaxConnections * 2 * 3);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3)
    );
    lineGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(lineColors, 3)
    );

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      linewidth: 1,
    });

    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    // Parallax & Scroll Variables
    let scrollY = 0;
    let targetCameraZ = 500;
    let currentCameraZ = 500;

    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;

    // Listeners
    const handleScroll = () => {
      scrollY = window.scrollY;
      // Map scrollY to camera depth movement
      // Fly-through: camera moves forward (negative Z) as we scroll down
      targetCameraZ = 500 - scrollY * 1.5;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.12;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.12;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.005;

      // 1. Smoothly interpolate camera position
      currentCameraZ += (targetCameraZ - currentCameraZ) * 0.08;
      camera.position.z = currentCameraZ;

      // Mouse Parallax (adds horizontal and vertical tilt)
      targetCameraX += (mouseX - targetCameraX) * 0.06;
      targetCameraY += (mouseY - targetCameraY) * 0.06;
      camera.position.x = targetCameraX;
      camera.position.y = -targetCameraY;
      camera.lookAt(new THREE.Vector3(0, 0, currentCameraZ - 400));

      // 2. Animate and wrap particles
      const rawPositions = pointsGeometry.attributes.position.array as Float32Array;
      const themeColor = new THREE.Color(0x0ea5e9);
      let lineIndex = 0;

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Soft float/oscillation over time
        p.x = p.ox + Math.sin(time + i) * 8;
        p.y = p.oy + Math.cos(time * 0.8 + i) * 8;
        p.z += p.vz;

        // Fly-Through Wrapping:
        // If the camera passes a particle (particle Z is greater than camera Z),
        // push it back to the far end of the tunnel to keep the density consistent.
        const wrapDistance = 200; // distance behind camera to wrap
        if (p.z > camera.position.z + wrapDistance) {
          p.z = camera.position.z - (boxDepth - wrapDistance);
          p.oz = p.z;
        } else if (p.z < camera.position.z - (boxDepth - wrapDistance)) {
          // If scrolling back up
          p.z = camera.position.z + wrapDistance;
          p.oz = p.z;
        }

        rawPositions[i * 3] = p.x;
        rawPositions[i * 3 + 1] = p.y;
        rawPositions[i * 3 + 2] = p.z;
      }

      pointsGeometry.attributes.position.needsUpdate = true;

      // 3. Connect Lines
      const activeLinePositions = lineGeometry.attributes.position.array as Float32Array;
      const activeLineColors = lineGeometry.attributes.color.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const p1 = particles[i];

        // Skip calculations if particle is behind the camera
        if (p1.z > camera.position.z) continue;

        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j];
          if (p2.z > camera.position.z) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDistance) {
            if (lineIndex < lineMaxConnections) {
              const alpha = 1.0 - dist / maxDistance;
              // Very subtle opacity for lines to keep it high-class
              const lineOpacity = alpha * 0.16;

              // Vertex 1
              activeLinePositions[lineIndex * 6] = p1.x;
              activeLinePositions[lineIndex * 6 + 1] = p1.y;
              activeLinePositions[lineIndex * 6 + 2] = p1.z;

              // Color 1
              activeLineColors[lineIndex * 6] = themeColor.r * lineOpacity;
              activeLineColors[lineIndex * 6 + 1] = themeColor.g * lineOpacity;
              activeLineColors[lineIndex * 6 + 2] = themeColor.b * lineOpacity;

              // Vertex 2
              activeLinePositions[lineIndex * 6 + 3] = p2.x;
              activeLinePositions[lineIndex * 6 + 4] = p2.y;
              activeLinePositions[lineIndex * 6 + 5] = p2.z;

              // Color 2
              activeLineColors[lineIndex * 6 + 3] = themeColor.r * lineOpacity;
              activeLineColors[lineIndex * 6 + 4] = themeColor.g * lineOpacity;
              activeLineColors[lineIndex * 6 + 5] = themeColor.b * lineOpacity;

              lineIndex++;
            }
          }
        }
      }

      lineGeometry.setDrawRange(0, lineIndex * 2);
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();

      // Clean up Three.js objects
      pointsGeometry.dispose();
      pointMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
      style={{ mixBlendMode: "screen" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
