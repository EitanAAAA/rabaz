"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface PhoneState {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  positionX: number;
  positionY: number;
  explodeFactor: number;
  arRingScale: number;
  screenIndex: number;
  focusIntensity: number;
}

export interface ShowcaseSectionData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  metric: string;
  metricLabel: string;
  phoneState: PhoneState;
}

export const SHOWCASE_SECTIONS: ShowcaseSectionData[] = [
  {
    id: "fluid-ui",
    badge: "GESTURAL MECHANICS",
    title: "High-Fidelity Gesture & Fluid Interaction Engines",
    subtitle: "Direct Manipulation Physics",
    description:
      "Animations shouldn't just run; they must feel physical. We engineer custom high-frequency touch responders and dampening spring physics running at a locked 120 FPS, providing natural, organic momentum.",
    features: [
      "Custom micro-interaction spring curves",
      "Sub-millisecond touch event processing",
      "Haptic Core tick-feedback alignments"
    ],
    metric: "120Hz",
    metricLabel: "Locked Refresh Rate",
    phoneState: {
      rotationX: 0.1,
      rotationY: -0.4,
      rotationZ: 0,
      positionX: 0,
      positionY: 0,
      explodeFactor: 0.0,
      arRingScale: 0.0,
      screenIndex: 0,
      focusIntensity: 0.2
    }
  },
  {
    id: "cross-platform",
    badge: "ENGINEERING CORE",
    title: "Unified Cross-Platform Core Development",
    subtitle: "Zero-Overhead Bridges",
    description:
      "We merge the cross-platform speed of React Native and Flutter with bare-metal custom bridges. By moving heavy computing to local C++ or Swift threads, we preserve a unified logic with zero stutter.",
    features: [
      "No-overhead custom JSI memory structures",
      "Optimized Hermes heap allocations",
      "Pixel-perfect cross-platform layout fidelity"
    ],
    metric: "99.8%",
    metricLabel: "Crash-Free Production Rate",
    phoneState: {
      rotationX: 0.3,
      rotationY: -1.75,
      rotationZ: 0.1,
      positionX: -0.4,
      positionY: 0.2,
      explodeFactor: 0.1,
      arRingScale: 0.0,
      screenIndex: 1,
      focusIntensity: 0.4
    }
  },
  {
    id: "hardware-integration",
    badge: "HARDWARE DECOUPLED",
    title: "Deep Native Hardware & Sensor Orchestration",
    subtitle: "Bare-Metal Driver Control",
    description:
      "True engineering lives deep in the silicon. We develop custom low-level services for multi-sensor gyroscope fusion, localized Bluetooth LE mesh networking, and offline-first SQL database sync engines.",
    features: [
      "Simultaneous BLE peripheral cluster pairing",
      "High-speed gyro vector computation",
      "Encrypted SQLite transaction caching"
    ],
    metric: "<15ms",
    metricLabel: "Sensor Pipeline Latency",
    phoneState: {
      rotationX: 0.6,
      rotationY: 0.9,
      rotationZ: -0.4,
      positionX: 0.2,
      positionY: -0.2,
      explodeFactor: 1.0,
      arRingScale: 0.0,
      screenIndex: 2,
      focusIntensity: 0.8
    }
  },
  {
    id: "spatial-xr",
    badge: "SPATIAL COMPUTING",
    title: "Immersive Handheld Augmented Reality (AR)",
    subtitle: "Stepping Outside the Border",
    description:
      "We breach physical display boundaries. Integrating ARKit, WebXR, and deep environment mesh analysis, we anchor rich 3D structures and contextual overlays firmly into real physical spaces.",
    features: [
      "Real-time LIDAR environment mapping",
      "Dynamic light estimation and casting shaders",
      "Projected 3D spatial interface models"
    ],
    metric: "0.2ms",
    metricLabel: "Anchor Tracking Latency",
    phoneState: {
      rotationX: 0.9,
      rotationY: -0.6,
      rotationZ: 0.2,
      positionX: 0.5,
      positionY: -0.1,
      explodeFactor: 0.15,
      arRingScale: 1.0,
      screenIndex: 3,
      focusIntensity: 1.0
    }
  }
];

const FONT_SANS = "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif";
const FONT_MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const SCREEN_WIDTH = 512;
const SCREEN_HEIGHT = 1024;
const GLASS_OFFSET_Z = 0.08;

class PhoneScene {
  private readonly container: HTMLDivElement;
  private readonly stateRef: { current: PhoneState };
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly phoneGroup: THREE.Group;
  private readonly backCase: THREE.Mesh;
  private readonly screenFrame: THREE.Mesh;
  private readonly pcb: THREE.Mesh;
  private readonly lensGroups: THREE.Group[];
  private readonly arRingsGroup: THREE.Group;
  private readonly coordinateDome: THREE.Mesh;
  private readonly pointLight: THREE.PointLight;
  private readonly screenCanvas: HTMLCanvasElement;
  private readonly screenCtx: CanvasRenderingContext2D;
  private readonly screenTexture: THREE.CanvasTexture;
  private readonly clock = new THREE.Clock();
  private readonly cursor: PhoneState;
  private readonly resizeObserver: ResizeObserver;
  private readonly disposables: Array<{ dispose: () => void }> = [];
  private rafId = 0;

  constructor(container: HTMLDivElement, stateRef: { current: PhoneState }) {
    this.container = container;
    this.stateRef = stateRef;
    this.cursor = { ...stateRef.current };

    const width = container.clientWidth || 1;
    const height = container.clientHeight || 500;

    this.scene = new THREE.Scene();
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    this.pointLight = this.buildLights();

    this.phoneGroup = new THREE.Group();
    this.scene.add(this.phoneGroup);

    const phoneParts = this.buildPhone();
    this.backCase = phoneParts.backCase;
    this.screenFrame = phoneParts.screenFrame;
    this.pcb = phoneParts.pcb;
    this.lensGroups = phoneParts.lensGroups;

    this.screenCanvas = document.createElement("canvas");
    this.screenCanvas.width = SCREEN_WIDTH;
    this.screenCanvas.height = SCREEN_HEIGHT;
    const ctx = this.screenCanvas.getContext("2d");
    if (!ctx) throw new Error("PhoneShowcase: failed to acquire 2D context");
    this.screenCtx = ctx;
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.colorSpace = THREE.SRGBColorSpace;
    this.disposables.push(this.screenTexture);

    this.attachScreenPlane();

    const arParts = this.buildArRings();
    this.arRingsGroup = arParts.group;
    this.coordinateDome = arParts.dome;
    this.phoneGroup.add(this.arRingsGroup);

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      const h = entry.contentRect.height || 500;
      this.renderer.setSize(w, h);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    });
    this.resizeObserver.observe(container);
  }

  start(): void {
    if (this.rafId) return;
    const tick = () => {
      this.update();
      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  pause(): void {
    if (!this.rafId) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  dispose(): void {
    this.pause();
    this.resizeObserver.disconnect();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.disposables.forEach((d) => d.dispose());
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry?.dispose?.();
        const mat = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose?.();
      }
    });
    this.renderer.dispose();
  }

  private buildLights(): THREE.PointLight {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(5, 10, 7);
    dir.castShadow = true;
    this.scene.add(dir);

    const point = new THREE.PointLight(0x00d2ff, 1.5, 15);
    point.position.set(0, 0, 3);
    this.scene.add(point);
    return point;
  }

  private buildPhone() {
    const caseGeo = new THREE.BoxGeometry(2.5, 5.0, 0.12);
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.15 });
    this.disposables.push(caseGeo, caseMat);
    const backCase = new THREE.Mesh(caseGeo, caseMat);
    this.phoneGroup.add(backCase);

    const camHousingGeo = new THREE.BoxGeometry(0.9, 0.9, 0.08);
    const camHousingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.1 });
    this.disposables.push(camHousingGeo, camHousingMat);
    const camHousing = new THREE.Mesh(camHousingGeo, camHousingMat);
    camHousing.position.set(-0.5, 1.6, -0.08);
    backCase.add(camHousing);

    const lensGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 32);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.8, roughness: 0.05 });
    const glassSphereGeo = new THREE.SphereGeometry(0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const glassMat = new THREE.MeshPhongMaterial({ color: 0x0ea5e9, shininess: 100, transparent: true, opacity: 0.8 });
    this.disposables.push(lensGeo, lensMat, glassSphereGeo, glassMat);

    const lensGroups: THREE.Group[] = [];
    const lensPositions: Array<[number, number]> = [
      [-0.5, 1.4],
      [-0.5, 1.8],
      [-0.2, 1.6]
    ];
    lensPositions.forEach(([x, y]) => {
      const group = new THREE.Group();
      const cyl = new THREE.Mesh(lensGeo, lensMat);
      cyl.rotation.x = Math.PI / 2;
      const glass = new THREE.Mesh(glassSphereGeo, glassMat);
      glass.position.z = -0.04;
      group.add(cyl, glass);
      group.position.set(x, y, -0.12);
      this.phoneGroup.add(group);
      lensGroups.push(group);
    });

    const pcbGeo = new THREE.BoxGeometry(2.3, 4.8, 0.04);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.4, metalness: 0.1 });
    this.disposables.push(pcbGeo, pcbMat);
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    this.phoneGroup.add(pcb);

    const cpuGeo = new THREE.BoxGeometry(0.7, 0.7, 0.06);
    const cpuMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    this.disposables.push(cpuGeo, cpuMat);
    const cpu = new THREE.Mesh(cpuGeo, cpuMat);
    cpu.position.set(0, 0.5, 0.04);
    pcb.add(cpu);

    const goldGeo = new THREE.BoxGeometry(0.04, 2.0, 0.01);
    const goldMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
    this.disposables.push(goldGeo, goldMat);
    const strut = new THREE.Mesh(goldGeo, goldMat);
    strut.position.set(-0.5, -0.5, 0.03);
    pcb.add(strut);

    const screenFrameGeo = new THREE.BoxGeometry(2.46, 4.96, 0.05);
    const screenFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8 });
    this.disposables.push(screenFrameGeo, screenFrameMat);
    const screenFrame = new THREE.Mesh(screenFrameGeo, screenFrameMat);
    this.phoneGroup.add(screenFrame);

    return { backCase, screenFrame, pcb, lensGroups };
  }

  private attachScreenPlane(): void {
    const geo = new THREE.PlaneGeometry(2.38, 4.88);
    const mat = new THREE.MeshBasicMaterial({ map: this.screenTexture, transparent: false });
    this.disposables.push(geo, mat);
    const plane = new THREE.Mesh(geo, mat);
    plane.position.z = 0.032;
    this.screenFrame.add(plane);
  }

  private buildArRings() {
    const group = new THREE.Group();
    const domeGeo = new THREE.IcosahedronGeometry(3.3, 2);
    const domeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.15 });
    this.disposables.push(domeGeo, domeMat);
    const dome = new THREE.Mesh(domeGeo, domeMat);
    group.add(dome);
    return { group, dome };
  }

  private update(): void {
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();
    const lerpSpeed = Math.min(1, 5.0 * delta);
    const target = this.stateRef.current;
    const c = this.cursor;

    c.rotationX += (target.rotationX - c.rotationX) * lerpSpeed;
    c.rotationY += (target.rotationY - c.rotationY) * lerpSpeed;
    c.rotationZ += (target.rotationZ - c.rotationZ) * lerpSpeed;
    c.positionX += (target.positionX - c.positionX) * lerpSpeed;
    c.positionY += (target.positionY - c.positionY) * lerpSpeed;
    c.explodeFactor += (target.explodeFactor - c.explodeFactor) * lerpSpeed;
    c.arRingScale += (target.arRingScale - c.arRingScale) * lerpSpeed;
    c.screenIndex = target.screenIndex;
    c.focusIntensity += (target.focusIntensity - c.focusIntensity) * lerpSpeed;

    this.phoneGroup.rotation.x = c.rotationX + Math.sin(time * 0.5) * 0.05;
    this.phoneGroup.rotation.y = c.rotationY + Math.cos(time * 0.5) * 0.05;
    this.phoneGroup.rotation.z = c.rotationZ;
    this.phoneGroup.position.x = c.positionX;
    this.phoneGroup.position.y = c.positionY + Math.sin(time * 1.5) * 0.08;

    const explode = c.explodeFactor;
    this.backCase.position.z = -explode * 1.6;
    this.screenFrame.position.z = GLASS_OFFSET_Z + explode * 1.6;
    this.pcb.position.z = 0;

    const lensZ = -0.12 - explode * 2.2;
    this.lensGroups.forEach((g) => {
      g.position.z = lensZ;
    });

    this.pointLight.intensity = 1.0 + c.focusIntensity * 2.5;

    this.arRingsGroup.scale.setScalar(c.arRingScale);
    this.coordinateDome.rotation.y = time * 0.12;
    this.coordinateDome.rotation.z = time * 0.06;

    this.drawScreen(Math.round(c.screenIndex), time);
    this.screenTexture.needsUpdate = true;
  }

  private drawScreen(activeScreenIndex: number, time: number): void {
    const ctx = this.screenCtx;
    const w = SCREEN_WIDTH;
    const h = SCREEN_HEIGHT;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    const isDarkScreen = activeScreenIndex === 2 || activeScreenIndex === 3;
    ctx.fillStyle = isDarkScreen ? "#ffffff" : "#1e293b";
    ctx.font = `bold 24px ${FONT_SANS}`;
    ctx.fillText("09:41", 45, 60);

    ctx.fillStyle = isDarkScreen ? "rgba(255,255,255,0.9)" : "#1e293b";
    ctx.fillRect(400, 44, 6, 16);
    ctx.fillRect(410, 38, 6, 22);
    ctx.fillRect(420, 30, 6, 30);
    ctx.strokeStyle = isDarkScreen ? "rgba(255,255,255,0.9)" : "#1e293b";
    ctx.lineWidth = 3;
    ctx.strokeRect(440, 34, 40, 22);
    ctx.fillStyle = isDarkScreen ? "#00f0ff" : "#1e293b";
    ctx.fillRect(444, 38, 25, 14);

    if (activeScreenIndex === 0) this.drawScreenOverview(time);
    else if (activeScreenIndex === 1) this.drawScreenCrossPlatform(time);
    else if (activeScreenIndex === 2) this.drawScreenSensor(time);
    else if (activeScreenIndex === 3) this.drawScreenSpatial(time);
  }

  private drawScreenOverview(time: number): void {
    const ctx = this.screenCtx;

    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.roundRect(30, 110, 452, 130, 24);
    ctx.fill();

    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.arc(80, 175, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.font = `600 24px ${FONT_SANS}`;
    ctx.fillText("Gestural Physics Feed", 130, 165);
    ctx.fillStyle = "#64748b";
    ctx.font = `400 20px ${FONT_SANS}`;
    ctx.fillText("120 FPS Native Touch", 130, 195);

    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.roundRect(30, 270, 452, 380, 24);
    ctx.fill();

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let x = 50; x < 460; x++) {
      const y = 460 + Math.sin(x * 0.02 + time * 5) * 60;
      if (x === 50) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const springX = 250 + Math.sin(time * 3) * 150;
    const springY = 460 + Math.sin(springX * 0.02 + time * 5) * 60;
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.arc(springX, springY, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(37, 99, 235, 0.3)";
    ctx.lineWidth = 14;
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = `bold 28px ${FONT_SANS}`;
    ctx.fillText("DIRECT MANIPULATION", 60, 335);
    ctx.fillStyle = "#64748b";
    ctx.font = `500 20px ${FONT_SANS}`;
    ctx.fillText("Dynamic tracking latency: <0.8ms", 60, 370);

    for (let i = 0; i < 3; i++) {
      const shiftY = 680 + i * 110;
      if (shiftY < SCREEN_HEIGHT - 60) {
        ctx.fillStyle = "#f1f5f9";
        ctx.beginPath();
        ctx.roundRect(30, shiftY, 452, 90, 16);
        ctx.fill();
        ctx.fillStyle = "#2563eb";
        ctx.fillRect(50, shiftY + 25, 40, 40);
      }
    }
  }

  private drawScreenCrossPlatform(time: number): void {
    const ctx = this.screenCtx;

    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.roundRect(30, 110, 452, 850, 32);
    ctx.fill();

    ctx.fillStyle = "#020617";
    ctx.font = `bold 32px ${FONT_SANS}`;
    ctx.fillText("Unified Core SDK", 60, 180);
    ctx.fillStyle = "#64748b";
    ctx.font = `500 22px ${FONT_SANS}`;
    ctx.fillText("Cross-Platform Swift / C++ bridge", 60, 215);

    const gridSizeX = 2;
    const gridSizeY = 4;
    for (let gy = 0; gy < gridSizeY; gy++) {
      for (let gx = 0; gx < gridSizeX; gx++) {
        const bx = 60 + gx * 205;
        const by = 260 + gy * 160;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(bx, by, 190, 140, 20);
        ctx.fill();

        ctx.fillStyle = (time + gy + gx) % 4 < 2 ? "#3b82f6" : "#10b981";
        ctx.beginPath();
        ctx.roundRect(bx + 20, by + 20, 50, 45, 10);
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.font = `bold 18px ${FONT_SANS}`;
        ctx.fillText(gy === 0 ? "UI Native Render" : gy === 1 ? "Thread Safe" : "Fast JSI Memory", bx + 20, by + 95);
        ctx.fillStyle = "#94a3b8";
        ctx.font = `400 14px ${FONT_SANS}`;
        ctx.fillText(gy === 0 ? "Direct platform paint" : "Background pools", bx + 20, by + 115);
      }
    }

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(60, 900, 390, 30, 15);
    ctx.fill();
    ctx.fillStyle = "#10b981";
    const progress = 50 + Math.sin(time) * 50;
    ctx.beginPath();
    ctx.roundRect(60, 900, (390 * progress) / 100, 30, 15);
    ctx.fill();
  }

  private drawScreenSensor(time: number): void {
    const ctx = this.screenCtx;

    ctx.fillStyle = "#020617";
    ctx.fillRect(30, 110, 452, 850);

    ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
    ctx.lineWidth = 2;
    const cx = 256;
    const cy = 450;
    for (let r = 50; r < 240; r += 50) {
      ctx.beginPath();
      ctx.arc(cx, cy, r + Math.sin(time * 2) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 2);
    ctx.strokeStyle = "rgba(6, 182, 212, 0.7)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(190, 0);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#06b6d4";
    ctx.font = `bold 24px ${FONT_MONO}`;
    ctx.fillText("GYROSCOPE VECTOR FUSION", 50, 180);

    ctx.fillStyle = "#38bdf8";
    ctx.font = `400 20px ${FONT_MONO}`;
    ctx.fillText(`X-AXIS V: ${(Math.sin(time) * 1.5).toFixed(4)} rad/s`, 50, 225);
    ctx.fillText(`Y-AXIS V: ${(Math.cos(time * 0.7) * 2.1).toFixed(4)} rad/s`, 50, 260);
    ctx.fillText(`Z-AXIS V: ${(Math.sin(time * 1.2) * 0.9).toFixed(4)} rad/s`, 50, 295);

    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = 50; x < 460; x += 5) {
      let y = 780;
      if (x > 180 && x < 280) {
        const pulse = (x - 180) / 100;
        y = 780 - Math.sin(pulse * Math.PI * 3 + time * 12) * 65;
      }
      if (x === 50) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = "#ef4444";
    ctx.font = `bold 20px ${FONT_MONO}`;
    ctx.fillText("NATIVE CACHED STORAGE", 50, 720);
    ctx.fillStyle = "#ffffff";
    ctx.font = `400 18px ${FONT_SANS}`;
    ctx.fillText("Local state db synchronization: ONLINE", 50, 860);
  }

  private drawScreenSpatial(time: number): void {
    const ctx = this.screenCtx;

    ctx.fillStyle = "#090d16";
    ctx.fillRect(30, 110, 452, 850);

    ctx.strokeStyle = "rgba(0, 240, 255, 0.06)";
    ctx.lineWidth = 1;
    const gridSp = 40;
    for (let gx = 30; gx < 482; gx += gridSp) {
      ctx.beginPath();
      ctx.moveTo(gx, 110);
      ctx.lineTo(gx, 960);
      ctx.stroke();
    }
    for (let gy = 110; gy < 960; gy += gridSp) {
      ctx.beginPath();
      ctx.moveTo(30, gy);
      ctx.lineTo(482, gy);
      ctx.stroke();
    }

    const drawWave = (yBase: number, amp: number, freq: number, phase: number, alpha: number, lw: number) => {
      ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.lineWidth = lw;
      ctx.beginPath();
      for (let x = 30; x < 482; x += 8) {
        const y = yBase + Math.sin(x * freq + phase) * amp;
        if (x === 30) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    drawWave(440, 35, 0.022, time * 3.5, 0.25, 1.8);
    drawWave(540, 45, 0.016, -time * 2.5, 0.15, 1.2);
    drawWave(640, 30, 0.012, time * 2.0, 0.08, 1.0);

    const sweepY = 110 + ((time * 180) % 785);
    ctx.fillStyle = "rgba(0, 240, 255, 0.06)";
    ctx.fillRect(30, sweepY - 15, 452, 30);
    ctx.strokeStyle = "rgba(0, 240, 255, 0.6)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(30, sweepY);
    ctx.lineTo(482, sweepY);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 26px ${FONT_SANS}`;
    ctx.fillText("SPATIAL AR HUD", 50, 180);

    ctx.fillStyle = "#00f0ff";
    ctx.font = `bold 18px ${FONT_MONO}`;
    ctx.fillText("MESH VECTOR SCANNER: ACTIVE", 50, 215);

    if (Math.floor(time * 2) % 2 === 0) {
      ctx.fillStyle = "#00f0ff";
      ctx.font = `bold 18px ${FONT_MONO}`;
      ctx.fillText("[ SYSTEM LOCK ]", 300, 180);
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.beginPath();
    ctx.roundRect(50, 780, 412, 115, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 240, 255, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(50, 780, 412, 115);

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 17px ${FONT_MONO}`;
    ctx.fillText(
      `TRANS XYZ: [${(Math.sin(time * 0.45) * 0.12).toFixed(3)}, ${(Math.cos(time * 0.35) * 0.22).toFixed(3)}, 0.450]`,
      70,
      815
    );

    ctx.fillStyle = "#94a3b8";
    ctx.font = `500 15px ${FONT_SANS}`;
    ctx.fillText("Continuous point cloud mapping: ONLINE", 70, 848);
    ctx.fillStyle = "#00f0ff";
    ctx.fillText("Spatial Sensor Calibration: LOCKED", 70, 874);
  }
}

interface PhoneShowcaseProps {
  activeState: PhoneState;
  paused?: boolean;
  className?: string;
}

export function PhoneShowcase({ activeState, paused = false, className }: PhoneShowcaseProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<PhoneState>({ ...activeState });
  const sceneRef = useRef<PhoneScene | null>(null);

  useEffect(() => {
    stateRef.current = { ...activeState };
  }, [activeState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scene = new PhoneScene(container, stateRef);
    sceneRef.current = scene;
    if (!paused) scene.start();
    return () => {
      sceneRef.current = null;
      scene.dispose();
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (paused) scene.pause();
    else scene.start();
  }, [paused]);

  return (
    <div
      ref={containerRef}
      className={className ?? "w-full h-full min-h-[420px] md:min-h-[600px]"}
      aria-hidden="true"
    />
  );
}

export default PhoneShowcase;
