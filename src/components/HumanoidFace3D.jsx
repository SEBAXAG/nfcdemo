import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * HumanoidFace3D
 * Generates a 3D humanoid face composed of luminous particles and interconnected neural nodes.
 * Features:
 * - Dynamic facial gestures (blinking, smiling, eyebrow raises)
 * - Jaw & mouth speech articulation (syncs with speech synthesis)
 * - Interactive cursor tracking / head rotation parallax
 * - Particle dispersion and holographic assembly on NFC scan
 * - Interconnected glowing wireframe node lattice
 */
export default function HumanoidFace3D({
  isAssembled = false,
  isSpeaking = false,
  speechIntensity = 0,
  expression = 'neutral', // 'neutral', 'smile', 'curious', 'speech'
  theme = 'cyan',        // 'cyan', 'emerald', 'violet', 'gold'
  particleDensity = 2800,
  connectionDistance = 0.32,
  onFaceReady
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    isAssembled,
    isSpeaking,
    speechIntensity,
    expression,
    targetRotation: { x: 0, y: 0 },
    currentRotation: { x: 0, y: 0 }
  });

  // Keep stateRef updated without recreating scene
  useEffect(() => {
    stateRef.current.isAssembled = isAssembled;
    stateRef.current.isSpeaking = isSpeaking;
    stateRef.current.speechIntensity = speechIntensity;
    stateRef.current.expression = expression;
  }, [isAssembled, isSpeaking, speechIntensity, expression]);

  const [fps, setFps] = useState(60);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Color Palettes ---
    const palettes = {
      cyan: { primary: 0x00f2fe, secondary: 0x4facfe, glow: 0x00ffff, bgParticles: 0x0a3d62 },
      emerald: { primary: 0x00ff87, secondary: 0x60efff, glow: 0x10b981, bgParticles: 0x064e3b },
      violet: { primary: 0xc084fc, secondary: 0xfa709a, glow: 0xa855f7, bgParticles: 0x4c1d95 },
      gold: { primary: 0xfacc15, secondary: 0xf97316, glow: 0xfef08a, bgParticles: 0x78350f }
    };
    const currentColors = palettes[theme] || palettes.cyan;

    // --- Generate Humanoid Facial Topology Data ---
    // Mathematically modeling an anatomical face with facial zones
    const basePositions = [];
    const dispersedPositions = [];
    const colors = [];
    const nodeWeights = []; // [jawWeight, mouthWeight, eyeLidWeight, browWeight, cheekWeight]

    const tempCol = new THREE.Color();
    const primaryCol = new THREE.Color(currentColors.primary);
    const secondaryCol = new THREE.Color(currentColors.secondary);
    const glowCol = new THREE.Color(currentColors.glow);

    // Generate Points grid & anatomical features
    const uSteps = 60;
    const vSteps = 45;

    for (let i = 0; i < uSteps; i++) {
      const u = (i / (uSteps - 1)) * 2 - 1; // -1 to 1 (vertical height from chin to forehead)
      const y = u * 2.1; // scale height: -2.1 (neck/chin) to +2.1 (cranium)

      // Width profile of human head
      let w = 1.0;
      if (y > 1.2) {
        // Cranium dome
        const t = (y - 1.2) / 0.9;
        w = Math.sqrt(Math.max(0, 1.0 - t * t)) * 1.35;
      } else if (y > 0.3) {
        // Temples & Forehead
        w = 1.38 - (1.2 - y) * 0.05;
      } else if (y > -0.4) {
        // Cheekbones (widest part)
        w = 1.45 - Math.abs(y - 0.0) * 0.15;
      } else if (y > -1.4) {
        // Lower jawline taper
        const t = (-0.4 - y) / 1.0;
        w = 1.38 - t * 0.65;
      } else {
        // Neck base
        w = 0.75 + (y + 2.1) * 0.1;
      }

      for (let j = 0; j < vSteps; j++) {
        const v = (j / (vSteps - 1)) * 2 - 1; // -1 to 1 (horizontal: left to right)
        const angle = v * (Math.PI * 0.52); // wraps ~95 degrees around front of face
        const x = Math.sin(angle) * w;
        let z = Math.cos(angle) * (w * 0.85);

        // Anatomical Facial Sculpting:
        // 1. Forehead curvature
        if (y > 0.8) {
          z += 0.15 * Math.sin(Math.PI * (y - 0.8) / 1.3);
        }

        // 2. Brow Ridge (y ~ 0.55)
        const browDist = Math.abs(y - 0.55);
        if (browDist < 0.25 && Math.abs(x) < 1.1) {
          z += (0.25 - browDist) * 0.45;
        }

        // 3. Eye Sockets (y ~ 0.35, |x| ~ 0.52)
        const eyeDx = Math.abs(Math.abs(x) - 0.55);
        const eyeDy = Math.abs(y - 0.35);
        const eyeDist = Math.sqrt(eyeDx * eyeDx * 1.2 + eyeDy * eyeDy);
        if (eyeDist < 0.32) {
          z -= (0.32 - eyeDist) * 0.6;
        }

        // 4. Nose Bridge & Tip (y: -0.3 to 0.45, |x| < 0.3)
        if (y > -0.35 && y < 0.45) {
          const noseT = (y + 0.35) / 0.8;
          const noseWidth = 0.14 + (1 - noseT) * 0.14;
          if (Math.abs(x) < noseWidth) {
            const protrusion = Math.sin(noseT * Math.PI) * 0.65;
            z += protrusion * (1 - Math.abs(x) / noseWidth);
          }
        }

        // 5. Mouth & Lips (y: -0.85 to -0.45, |x| < 0.5)
        if (y > -0.85 && y < -0.45 && Math.abs(x) < 0.55) {
          const mouthDist = Math.abs(y - (-0.65));
          if (mouthDist < 0.18) {
            z += (0.18 - mouthDist) * 0.38 * (1 - Math.abs(x) / 0.55);
          }
        }

        // 6. Chin Protrusion (y: -1.45 to -1.05, |x| < 0.4)
        if (y > -1.45 && y < -1.05 && Math.abs(x) < 0.42) {
          const chinDist = Math.sqrt(x * x + Math.pow(y - (-1.22), 2));
          if (chinDist < 0.35) {
            z += (0.35 - chinDist) * 0.5;
          }
        }

        // Feature Weights for Gestures & Articulations
        // Jaw weight: affects vertices below the mouth down to chin
        const jawWeight = y < -0.6 ? Math.min(1.0, (-0.6 - y) / 0.7) : 0;

        // Mouth weight: lower lip & mouth aperture
        const mouthWeight = (y > -0.85 && y < -0.45 && Math.abs(x) < 0.5) ? (1 - Math.abs(y - (-0.65)) / 0.2) : 0;

        // Eyelid weight: upper eyelids for blinking
        const eyeLidWeight = (eyeDist < 0.22 && y >= 0.35) ? (1 - eyeDist / 0.22) : 0;

        // Brow weight: eyebrows for expression
        const browWeight = (browDist < 0.2 && Math.abs(x) > 0.2 && Math.abs(x) < 0.95) ? (1 - browDist / 0.2) : 0;

        // Cheek weight: smile articulation
        const cheekWeight = (y > -0.4 && y < 0.2 && Math.abs(x) > 0.45 && Math.abs(x) < 1.1) ? 1.0 : 0;

        basePositions.push(x, y, z);
        nodeWeights.push(jawWeight, mouthWeight, eyeLidWeight, browWeight, cheekWeight);

        // Dispersed / Floating Chaos Positions (before NFC scan)
        const radius = 4.5 + Math.random() * 4.0;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        dispersedPositions.push(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );

        // Point Color: luminous gradient (chin to forehead with eye/mouth highlights)
        if (mouthWeight > 0.3 || eyeDist < 0.2) {
          tempCol.copy(glowCol);
        } else {
          tempCol.copy(primaryCol).lerp(secondaryCol, (y + 2.1) / 4.2);
        }
        colors.push(tempCol.r, tempCol.g, tempCol.b);
      }
    }

    // Add glowing eyeball pupil nodes
    const eyeCenters = [
      { x: -0.52, y: 0.35, z: 0.15 },
      { x: 0.52, y: 0.35, z: 0.15 }
    ];
    eyeCenters.forEach(eye => {
      for (let p = 0; p < 35; p++) {
        const rad = 0.09 * Math.sqrt(Math.random());
        const ang = Math.random() * Math.PI * 2;
        basePositions.push(eye.x + rad * Math.cos(ang), eye.y + rad * Math.sin(ang), eye.z + (Math.random() * 0.05));
        dispersedPositions.push((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
        nodeWeights.push(0, 0, 0, 0, 0);
        colors.push(glowCol.r, glowCol.g, glowCol.b);
      }
    });

    const totalPoints = basePositions.length / 3;

    // --- Particle Points Geometry ---
    const pointGeometry = new THREE.BufferGeometry();
    const currentPosArray = new Float32Array(dispersedPositions);
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(currentPosArray, 3));
    pointGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

    // Particle Material with Soft Glow Sprite
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.6, 'rgba(0, 242, 254, 0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const pointMaterial = new THREE.PointsMaterial({
      size: 0.082,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    const pointCloud = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(pointCloud);

    // --- Neural Network Lines (Node Connections) ---
    // Sample a subset of points for the interconnected neural mesh to maintain optimal FPS
    const nodeStep = 2; // take every 2nd point for line connections
    const nodeIndices = [];
    for (let k = 0; k < totalPoints; k += nodeStep) {
      nodeIndices.push(k);
    }

    const linePositions = [];
    const maxConnectionsPerNode = 4;

    for (let a = 0; a < nodeIndices.length; a++) {
      const idxA = nodeIndices[a];
      const ax = basePositions[idxA * 3];
      const ay = basePositions[idxA * 3 + 1];
      const az = basePositions[idxA * 3 + 2];
      let connections = 0;

      for (let b = a + 1; b < nodeIndices.length; b++) {
        const idxB = nodeIndices[b];
        const bx = basePositions[idxB * 3];
        const by = basePositions[idxB * 3 + 1];
        const bz = basePositions[idxB * 3 + 2];

        const distSq = (ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2;
        if (distSq < connectionDistance ** 2) {
          linePositions.push(ax, ay, az, bx, by, bz);
          connections++;
          if (connections >= maxConnectionsPerNode) break;
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    const currentLinesArray = new Float32Array(linePositions.length);
    // Initialize lines scattered
    for (let l = 0; l < linePositions.length; l++) {
      currentLinesArray[l] = (Math.random() - 0.5) * 8;
    }
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(currentLinesArray, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: currentColors.primary,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // --- Hologram Cyber Rings Orbiting Face ---
    const ringGroup = new THREE.Group();
    const ringMat = new THREE.LineBasicMaterial({
      color: currentColors.secondary,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    const ringGeom1 = new THREE.RingGeometry(2.4, 2.44, 64);
    const ring1 = new THREE.LineLoop(ringGeom1, ringMat);
    ring1.rotation.x = Math.PI / 2.3;
    ringGroup.add(ring1);

    const ringGeom2 = new THREE.RingGeometry(2.7, 2.72, 64);
    const ring2 = new THREE.LineLoop(ringGeom2, ringMat);
    ring2.rotation.y = Math.PI / 4;
    ringGroup.add(ring2);

    scene.add(ringGroup);

    // --- Floating Matrix Data Sparks in Background ---
    const bgCount = 280;
    const bgGeom = new THREE.BufferGeometry();
    const bgPos = new Float32Array(bgCount * 3);
    for (let b = 0; b < bgCount * 3; b += 3) {
      bgPos[b] = (Math.random() - 0.5) * 14;
      bgPos[b + 1] = (Math.random() - 0.5) * 12;
      bgPos[b + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    bgGeom.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    const bgMat = new THREE.PointsMaterial({
      size: 0.05,
      color: currentColors.bgParticles,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const bgPoints = new THREE.Points(bgGeom, bgMat);
    scene.add(bgPoints);

    // --- Mouse Move Tracker ---
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.targetRotation.y = x * 0.45;
      stateRef.current.targetRotation.x = -y * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // --- Animation & Articulation Loop ---
    let animationFrameId;
    let clock = new THREE.Clock();
    let morphProgress = 0.0;
    let blinkTimer = 0;
    let isBlinking = false;
    let blinkValue = 0;

    let frames = 0;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // FPS calculation
      frames++;
      const now = performance.now();
      if (now >= lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (now - lastTime)));
        frames = 0;
        lastTime = now;
      }

      const { isAssembled, isSpeaking, speechIntensity, expression } = stateRef.current;

      // 1. Morph Transition (Assemble / Disperse)
      const targetMorph = isAssembled ? 1.0 : 0.0;
      morphProgress += (targetMorph - morphProgress) * Math.min(delta * 2.4, 0.15);

      // 2. Eye Blink Routine (Periodic natural blinking)
      blinkTimer += delta;
      if (blinkTimer > 3.5 + Math.random() * 2.0) {
        isBlinking = true;
        blinkTimer = 0;
      }
      if (isBlinking) {
        blinkValue += delta * 12;
        if (blinkValue >= Math.PI) {
          blinkValue = 0;
          isBlinking = false;
        }
      }
      const blinkFactor = Math.sin(blinkValue); // 0 -> 1 -> 0

      // 3. Facial Articulation calculation
      // Speech jaw drop
      const jawDrop = isSpeaking ? (0.24 * Math.abs(Math.sin(elapsed * 14)) + speechIntensity * 0.15) : 0;
      // Mouth vibration while speaking
      const mouthMove = isSpeaking ? (0.12 * Math.sin(elapsed * 22)) : 0;
      // Smile expression
      const isSmile = expression === 'smile' || isSpeaking;
      const smileFactor = isSmile ? 0.22 : 0;
      // Curious / Thinking eyebrow raise
      const isCurious = expression === 'curious';
      const browFactor = isCurious ? 0.18 : (isSmile ? 0.08 : 0);

      // 4. Update Particle Vertices
      const posAttr = pointGeometry.attributes.position;
      const posArray = posAttr.array;

      for (let k = 0; k < totalPoints; k++) {
        const k3 = k * 3;
        const bx = basePositions[k3];
        const by = basePositions[k3 + 1];
        const bz = basePositions[k3 + 2];

        const dx = dispersedPositions[k3];
        const dy = dispersedPositions[k3 + 1];
        const dz = dispersedPositions[k3 + 2];

        // Weights
        const kw5 = k * 5;
        const jw = nodeWeights[kw5] || 0;
        const mw = nodeWeights[kw5 + 1] || 0;
        const ew = nodeWeights[kw5 + 2] || 0;
        const bw = nodeWeights[kw5 + 3] || 0;
        const cw = nodeWeights[kw5 + 4] || 0;

        // Apply Articulations to Base Coordinates
        let targetX = bx;
        let targetY = by;
        let targetZ = bz;

        if (morphProgress > 0.1) {
          // Jaw articulation: drops downwards and moves slightly forward
          if (jw > 0) {
            targetY -= jawDrop * jw;
            targetZ += jawDrop * 0.3 * jw;
          }

          // Mouth speaking shape
          if (mw > 0) {
            targetY += mouthMove * mw;
            targetZ += Math.abs(mouthMove) * 0.15 * mw;
          }

          // Eye Blinking: upper eyelid pulls down
          if (ew > 0) {
            targetY -= blinkFactor * 0.14 * ew;
          }

          // Eyebrows raise
          if (bw > 0) {
            targetY += browFactor * bw;
          }

          // Cheeks lift when smiling
          if (cw > 0) {
            targetY += smileFactor * 0.12 * cw;
            targetZ += smileFactor * 0.08 * cw;
          }

          // Gentle breathing organic ripple
          const ripple = Math.sin(elapsed * 2.0 + by * 1.5) * 0.02;
          targetZ += ripple;
        }

        // Interpolate between dispersed cloud and assembled humanoid face
        // Use smooth easing
        const currentTargetX = dx + (targetX - dx) * morphProgress;
        const currentTargetY = dy + (targetY - dy) * morphProgress;
        const currentTargetZ = dz + (targetZ - dz) * morphProgress;

        // Smooth damping
        posArray[k3] += (currentTargetX - posArray[k3]) * 0.25;
        posArray[k3 + 1] += (currentTargetY - posArray[k3 + 1]) * 0.25;
        posArray[k3 + 2] += (currentTargetZ - posArray[k3 + 2]) * 0.25;
      }
      posAttr.needsUpdate = true;

      // 5. Update Line Segments (Neural Node Lattice)
      const linePosAttr = lineGeometry.attributes.position;
      const lineArray = linePosAttr.array;
      const lineCount = linePositions.length;

      // Only update lines if assembled enough to reduce CPU overhead
      if (morphProgress > 0.2) {
        for (let l = 0; l < lineCount; l += 6) {
          // Line start and end
          const origX1 = linePositions[l];
          const origY1 = linePositions[l + 1];
          const origZ1 = linePositions[l + 2];

          const origX2 = linePositions[l + 3];
          const origY2 = linePositions[l + 4];
          const origZ2 = linePositions[l + 5];

          // Interpolate to current line positions
          lineArray[l] += (origX1 * morphProgress - lineArray[l]) * 0.2;
          lineArray[l + 1] += (origY1 * morphProgress - lineArray[l + 1]) * 0.2;
          lineArray[l + 2] += (origZ1 * morphProgress - lineArray[l + 2]) * 0.2;

          lineArray[l + 3] += (origX2 * morphProgress - lineArray[l + 3]) * 0.2;
          lineArray[l + 4] += (origY2 * morphProgress - lineArray[l + 4]) * 0.2;
          lineArray[l + 5] += (origZ2 * morphProgress - lineArray[l + 5]) * 0.2;
        }
        linePosAttr.needsUpdate = true;
      }
      lineMaterial.opacity = 0.32 * morphProgress;

      // 6. Hologram Orbiting Rings
      ring1.rotation.z += 0.015;
      ring2.rotation.z -= 0.01;
      ringGroup.position.y = Math.sin(elapsed * 1.5) * 0.08;
      ringMat.opacity = 0.35 * morphProgress;

      // 7. Parallax Head Tracking
      const { targetRotation, currentRotation } = stateRef.current;
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

      pointCloud.rotation.x = currentRotation.x;
      pointCloud.rotation.y = currentRotation.y;
      lineSegments.rotation.x = currentRotation.x;
      lineSegments.rotation.y = currentRotation.y;

      // Idle floating head wave
      const idleFloat = Math.sin(elapsed * 1.8) * 0.06;
      pointCloud.position.y = idleFloat;
      lineSegments.position.y = idleFloat;

      // Slowly rotate background matrix sparks
      bgPoints.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    if (onFaceReady) onFaceReady();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      pointGeometry.dispose();
      pointMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      ringGeom1.dispose();
      ringGeom2.dispose();
      ringMat.dispose();
      bgGeom.dispose();
      bgMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme, connectionDistance]);

  return (
    <div className="relative w-full h-full min-h-[460px] flex items-center justify-center overflow-hidden">
      {/* 3D Canvas Mounting Target */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Holographic Status Overlays */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1 text-xs font-mono">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-black/40 border border-cyan-500/30 text-cyan-400 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full animate-pulse bg-cyan-400"></span>
          <span>HUMANOID STATUS: {isAssembled ? 'CONVERGED & ACTIVE' : 'QUANTUM DISPERSED'}</span>
        </div>
        <div className="text-slate-400/80 px-1">
          FPS: {fps} | PARTICLES: ~{particleDensity} | ARTICULATION: {isSpeaking ? 'VOCAL SYNTH' : expression.toUpperCase()}
        </div>
      </div>

      {/* Futuristic Target Reticle Grid Corner Accents */}
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-500/60 pointer-events-none" />
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-500/60 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-500/60 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-500/60 pointer-events-none" />

      {/* Interactive Speech Articulation Indicator */}
      {isSpeaking && (
        <div className="absolute bottom-6 flex items-center gap-1.5 px-4 py-2 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.3)] backdrop-blur-md animate-pulse">
          <span className="text-xs font-mono uppercase tracking-widest font-semibold mr-1">Vocal Output</span>
          <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-1 h-5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1 h-7 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
          <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
        </div>
      )}
    </div>
  );
}
