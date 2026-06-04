"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Stage = {
  enter: number;
  hold: number;
  exit: number;
  presence: number;
};

interface AiSculptureProps {
  stage: Stage;
}

type StageNarrative = {
  num: string;
  tag: string;
  title: string;
  body: string;
  example: string;
};

const stageDetails: StageNarrative[] = [
  {
    num: "01",
    tag: "ראייה ממוחשבת",
    title: "אנחנו בונים מערכות שרואות",
    body: "מודלי Computer Vision שמזהים אובייקטים, פנים וסצנות בזמן אמת — מותאמים לחומרה שלכם, רצים On-Device או בענן.",
    example: "כמו פרויקט המצלמות החכמות שבנינו עבור הצוות"
  },
  {
    num: "02",
    tag: "הבנת שפה",
    title: "המודל מפרק את השפה לוקטורים",
    body: "Embeddings, חיפוש סמנטי וטיוב מידע — הצמתים שהופכים תוכן חופשי לידע שאפשר לשאול עליו ולחפש בו.",
    example: "RAG, FAISS, OpenAI Embeddings, מודלים בעברית"
  },
  {
    num: "03",
    tag: "צ'אט וסוכני AI",
    title: "ממשק שיחה חכם — לא גימיק",
    body: "אנחנו מחברים LLMs מובילים למערכת שלכם, עם הנחיות מותאמות, בקרת תוכן והקשר אמיתי לדאטה הארגוני.",
    example: "כמו 'רב בוט' — עוזר השיחה שבנינו לרבנות הצבאית"
  },
  {
    num: "04",
    tag: "אינטליגנציה משולבת",
    title: "מערכת אחת — ראייה, שפה ודיאלוג",
    body: "המוצר הסופי משלב הכל: רואה את העולם, מבין מה נאמר, ומגיב באופן שמתאים לצוות שלכם — בלייב.",
    example: "Vision · LLM · Realtime · עברית · אבטחה"
  }
];

const PARTICLE_COUNT = 2400;

class SculptureScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly geometry: THREE.BufferGeometry;
  private readonly pointsMaterial: THREE.PointsMaterial;
  private readonly points: THREE.Points;
  private readonly container: HTMLDivElement;
  private readonly resizeObs: ResizeObserver;
  private readonly clock = new THREE.Clock();

  private readonly basePositions: {
    state0_eye: Float32Array;
    state1_letters: Float32Array;
    state2_chatBox: Float32Array;
    state3_networkEye: Float32Array;
  };
  private readonly particleTypes: Uint8Array;

  private readonly mouseTarget = { x: 0, y: 0 };
  private readonly mouseLerped = { x: 0, y: 0 };
  private readonly rawNDC = { x: 0, y: 0 };

  private rafId = 0;
  private scrollProgress = 0;
  private scrollProgressLerped = 0;

  constructor(container: HTMLDivElement) {
    this.container = container;
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);

    this.scene = new THREE.Scene();
    this.scene.background = null;
    this.scene.fog = new THREE.FogExp2(0xfbfcf3, 0.06);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 10.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xf8fafc, 1.4));
    const cyanLight = new THREE.DirectionalLight(0x0284c7, 1.9);
    cyanLight.position.set(5, 8, 5);
    this.scene.add(cyanLight);
    const amberLight = new THREE.DirectionalLight(0xf59e0b, 1.1);
    amberLight.position.set(-5, -5, 3);
    this.scene.add(amberLight);

    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    this.basePositions = {
      state0_eye: new Float32Array(PARTICLE_COUNT * 3),
      state1_letters: new Float32Array(PARTICLE_COUNT * 3),
      state2_chatBox: new Float32Array(PARTICLE_COUNT * 3),
      state3_networkEye: new Float32Array(PARTICLE_COUNT * 3)
    };
    this.particleTypes = new Uint8Array(PARTICLE_COUNT);

    this.classifyParticles();
    this.buildAllStates(positions);

    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    this.pointsMaterial = new THREE.PointsMaterial({
      size: 0.105,
      vertexColors: true,
      transparent: true,
      opacity: 0.94,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geometry, this.pointsMaterial);
    this.scene.add(this.points);

    this.resizeObs = new ResizeObserver(() => this.handleResize());
    this.resizeObs.observe(container);
  }

  private classifyParticles(): void {
    const pupil = Math.floor(PARTICLE_COUNT * 0.286);
    const iris = Math.floor(PARTICLE_COUNT * 0.714);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (i < pupil) this.particleTypes[i] = 0;
      else if (i < iris) this.particleTypes[i] = 1;
      else this.particleTypes[i] = 2;
    }
  }

  private buildAllStates(positions: Float32Array): void {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const type = this.particleTypes[i];

      this.placeEye(idx, i, type, this.basePositions.state0_eye);
      this.placeLetters(idx, i, this.basePositions.state1_letters);
      this.placeChatBox(idx, i, this.basePositions.state2_chatBox);

      this.basePositions.state3_networkEye[idx] = this.basePositions.state0_eye[idx];
      this.basePositions.state3_networkEye[idx + 1] = this.basePositions.state0_eye[idx + 1];
      this.basePositions.state3_networkEye[idx + 2] = this.basePositions.state0_eye[idx + 2];

      positions[idx] = this.basePositions.state0_eye[idx];
      positions[idx + 1] = this.basePositions.state0_eye[idx + 1];
      positions[idx + 2] = this.basePositions.state0_eye[idx + 2];
    }
  }

  private placeEye(idx: number, i: number, type: number, target: Float32Array): void {
    if (type === 0) {
      const rVal = Math.pow(Math.random(), 1.1) * 0.52;
      const theta = Math.random() * Math.PI * 2;
      target[idx] = Math.cos(theta) * rVal;
      target[idx + 1] = Math.sin(theta) * rVal;
      target[idx + 2] = -0.16 * (1.0 - rVal / 0.52);
    } else if (type === 1) {
      const rayNum = i % 160;
      const theta = (rayNum / 160) * Math.PI * 2 + (Math.random() - 0.5) * 0.02;
      const radialOffset = Math.pow(Math.random(), 0.85);
      const dist = 0.52 + radialOffset * 1.16;
      const wave = Math.sin(theta * 8.0) * 0.05 + Math.cos(dist * 6.0) * 0.03;
      const finalTheta = theta + wave;
      target[idx] = Math.cos(finalTheta) * dist;
      target[idx + 1] = Math.sin(finalTheta) * dist;
      target[idx + 2] = -0.1 * (1.0 - radialOffset);
    } else {
      const lidStart = Math.floor(PARTICLE_COUNT * 0.714);
      const localIdx = i - lidStart;
      const lidCount = PARTICLE_COUNT - lidStart;
      const halfLid = Math.max(1, Math.floor(lidCount / 2));
      const isUpper = localIdx < halfLid;
      const itemIdx = isUpper ? localIdx : localIdx - halfLid;
      const subLayer = itemIdx % 4;
      const stepsPerSubLayer = Math.max(2, Math.ceil(halfLid / 4));
      const stepIdx = Math.floor(itemIdx / 4);
      const step = Math.min(1, stepIdx / (stepsPerSubLayer - 1));
      const t = step * 2.0 - 1.0;
      const widthScale = 3.4;
      const ex = t * widthScale;
      const baseCurve = Math.sqrt(Math.max(0, 1.0 - t * t));

      let curveHeight = 0;
      let depthOffset = 0;
      if (isUpper) {
        if (subLayer === 0) { curveHeight = 1.35 * baseCurve; depthOffset = 0.28 * (1 - t * t); }
        else if (subLayer === 1) { curveHeight = 1.48 * baseCurve; depthOffset = 0.32 * (1 - t * t); }
        else if (subLayer === 2) { curveHeight = 1.68 * baseCurve; depthOffset = 0.15 * (1 - t * t); }
        else { curveHeight = 1.95 * baseCurve; depthOffset = -0.05 * (1 - t * t); }
      } else {
        if (subLayer === 0) { curveHeight = -1.05 * baseCurve; depthOffset = 0.22 * (1 - t * t); }
        else if (subLayer === 1) { curveHeight = -1.18 * baseCurve; depthOffset = 0.24 * (1 - t * t); }
        else if (subLayer === 2) { curveHeight = -1.35 * baseCurve; depthOffset = 0.12 * (1 - t * t); }
        else { curveHeight = -1.55 * baseCurve; depthOffset = -0.08 * (1 - t * t); }
      }

      target[idx] = ex;
      target[idx + 1] = curveHeight;
      target[idx + 2] = depthOffset + (Math.random() - 0.5) * 0.04;
    }
  }

  private placeLetters(idx: number, i: number, target: Float32Array): void {
    if (i < PARTICLE_COUNT / 2) {
      const fraction = i / (PARTICLE_COUNT / 2);
      let px = 0;
      let py = 0;
      const pz = (Math.random() - 0.5) * 0.35;

      if (fraction < 0.45) {
        const t = fraction / 0.45;
        px = -2.25 + (-1.45 - -2.25) * t;
        py = -1.6 + (1.85 - -1.6) * t;
      } else if (fraction < 0.9) {
        const t = (fraction - 0.45) / 0.45;
        px = -1.45 + (-0.65 - -1.45) * t;
        py = 1.85 + (-1.6 - 1.85) * t;
      } else {
        const t = (fraction - 0.9) / 0.1;
        px = -1.82 + (-1.08 - -1.82) * t;
        py = -0.15;
      }
      target[idx] = px + (Math.random() - 0.5) * 0.12;
      target[idx + 1] = py + (Math.random() - 0.5) * 0.12;
      target[idx + 2] = pz;
    } else {
      const localIdx = i - PARTICLE_COUNT / 2;
      const fraction = localIdx / (PARTICLE_COUNT / 2);
      let px = 0;
      let py = 0;
      const pz = (Math.random() - 0.5) * 0.35;

      if (fraction < 0.6) {
        const t = fraction / 0.6;
        px = 1.45;
        py = -1.6 + (1.85 - -1.6) * t;
      } else if (fraction < 0.8) {
        const t = (fraction - 0.6) / 0.2;
        px = 0.95 + (1.95 - 0.95) * t;
        py = 1.85;
      } else {
        const t = (fraction - 0.8) / 0.2;
        px = 0.95 + (1.95 - 0.95) * t;
        py = -1.6;
      }
      target[idx] = px + (Math.random() - 0.5) * 0.12;
      target[idx + 1] = py + (Math.random() - 0.5) * 0.12;
      target[idx + 2] = pz;
    }
  }

  private placeChatBox(idx: number, i: number, target: Float32Array): void {
    let cbX = 0;
    let cbY = 0;
    let cbZ = (Math.random() - 0.5) * 0.04;
    const CY = -0.15;

    if (i < 800) {
      const ratio = i / 800;
      const topEdge = 4.5;
      const cornerTR = 0.55;
      const rightEdge = 1.7;
      const cornerBR = 0.55;
      const bottomEdge = 4.5;
      const cornerBL = 0.55;
      const leftEdge = 1.7;
      const cornerTL = 0.55;
      const totalP = topEdge + cornerTR + rightEdge + cornerBR + bottomEdge + cornerBL + leftEdge + cornerTL;
      const currentP = ratio * totalP;

      if (currentP < topEdge) {
        cbX = -2.25 + currentP;
        cbY = CY + 1.1;
      } else if (currentP < topEdge + cornerTR) {
        const t = (currentP - topEdge) / cornerTR;
        const theta = Math.PI * 0.5 - t * Math.PI * 0.5;
        cbX = 2.25 + Math.cos(theta) * 0.35;
        cbY = CY + 0.75 + Math.sin(theta) * 0.35;
      } else if (currentP < topEdge + cornerTR + rightEdge) {
        const t = (currentP - topEdge - cornerTR) / rightEdge;
        cbX = 2.6;
        cbY = CY + 0.75 - t * 1.7;
      } else if (currentP < topEdge + cornerTR + rightEdge + cornerBR) {
        const t = (currentP - topEdge - cornerTR - rightEdge) / cornerBR;
        const theta = -t * Math.PI * 0.5;
        cbX = 2.25 + Math.cos(theta) * 0.35;
        cbY = CY - 0.95 + Math.sin(theta) * 0.35;
      } else if (currentP < topEdge + cornerTR + rightEdge + cornerBR + bottomEdge) {
        const t = (currentP - topEdge - cornerTR - rightEdge - cornerBR) / bottomEdge;
        cbX = 2.25 - t * 4.5;
        cbY = CY - 1.3;
      } else if (currentP < topEdge + cornerTR + rightEdge + cornerBR + bottomEdge + cornerBL) {
        const t = (currentP - topEdge - cornerTR - rightEdge - cornerBR - bottomEdge) / cornerBL;
        const theta = Math.PI * 1.5 - t * Math.PI * 0.5;
        cbX = -2.25 + Math.cos(theta) * 0.35;
        cbY = CY - 0.95 + Math.sin(theta) * 0.35;
      } else if (currentP < topEdge + cornerTR + rightEdge + cornerBR + bottomEdge + cornerBL + leftEdge) {
        const t = (currentP - topEdge - cornerTR - rightEdge - cornerBR - bottomEdge - cornerBL) / leftEdge;
        cbX = -2.6;
        cbY = CY - 0.95 + t * 1.7;
      } else {
        const t = (currentP - topEdge - cornerTR - rightEdge - cornerBR - bottomEdge - cornerBL - leftEdge) / cornerTL;
        const theta = Math.PI - t * Math.PI * 0.5;
        cbX = -2.25 + Math.cos(theta) * 0.35;
        cbY = CY + 0.75 + Math.sin(theta) * 0.35;
      }
      cbZ = (Math.random() - 0.5) * 0.02;
    } else if (i < 1350) {
      const localIdx = i - 800;
      const cx = -1.8;
      const cy = CY + 0.45;

      if (localIdx < 220) {
        const p = (localIdx / 220) * 3.6;
        if (p < 1.0) { cbX = cx - 0.5 + p; cbY = cy + 0.4; }
        else if (p < 1.8) { cbX = cx + 0.5; cbY = cy + 0.4 - (p - 1.0); }
        else if (p < 2.8) { cbX = cx + 0.5 - (p - 1.8); cbY = cy - 0.4; }
        else { cbX = cx - 0.5; cbY = cy - 0.4 + (p - 2.8); }
      } else if (localIdx < 340) {
        const t = (localIdx - 220) / 120;
        cbX = cx - 0.45 + t * 0.9;
        cbY = cy - 0.15 + t * 0.4 + Math.sin(t * Math.PI * 3.5) * 0.07;
      } else if (localIdx < 420) {
        const t = (localIdx - 340) / 80;
        const theta = t * Math.PI * 2;
        const rVal = 0.14 + (localIdx % 3 === 0 ? 0.02 : 0);
        cbX = cx + 0.22 + Math.cos(theta) * rVal;
        cbY = cy + 0.15 + Math.sin(theta) * rVal;
      } else {
        const itemIdx = localIdx - 420;
        const ccx = cx + 0.5;
        const ccy = cy + 0.4;
        if (itemIdx < 80) {
          const theta = (itemIdx / 80) * Math.PI * 2;
          cbX = ccx + Math.cos(theta) * 0.12;
          cbY = ccy + Math.sin(theta) * 0.12;
        } else {
          const t = (itemIdx - 80) / 50;
          if (t < 0.5) {
            const k = (t / 0.5) * 2 - 1;
            cbX = ccx + k * 0.05;
            cbY = ccy + k * 0.05;
          } else {
            const k = ((t - 0.5) / 0.5) * 2 - 1;
            cbX = ccx + k * 0.05;
            cbY = ccy - k * 0.05;
          }
        }
      }
      cbZ = (Math.random() - 0.5) * 0.01;
    } else if (i < 1550) {
      const localIdx = i - 1350;
      const CX_tip = -1.13;
      const CY_tip = CY + 0.65;
      const P = [
        { x: 0.0, y: 0.0 }, { x: 0.0, y: -0.42 }, { x: 0.12, y: -0.30 }, { x: 0.22, y: -0.50 },
        { x: 0.27, y: -0.48 }, { x: 0.17, y: -0.28 }, { x: 0.28, y: -0.28 }
      ];
      const seg = Math.floor((localIdx / 200) * 7) % 7;
      const tt = ((localIdx / 200) * 7) % 1;
      const nextSeg = (seg + 1) % 7;
      const px = P[seg].x + (P[nextSeg].x - P[seg].x) * tt;
      const py = P[seg].y + (P[nextSeg].y - P[seg].y) * tt;
      const cosA = Math.cos(-0.25);
      const sinA = Math.sin(-0.25);
      const rx = px * cosA - py * sinA;
      const ry = px * sinA + py * cosA;
      cbX = CX_tip + rx;
      cbY = CY_tip + ry;
      cbZ = (Math.random() - 0.5) * 0.01;
    } else if (i < 1800) {
      const localIdx = i - 1550;
      const cx = -2.1;
      const cy = CY - 0.85;
      if (localIdx < 160) {
        const theta = (localIdx / 160) * Math.PI * 2;
        cbX = cx + Math.cos(theta) * 0.22;
        cbY = cy + Math.sin(theta) * 0.22;
      } else if (localIdx < 205) {
        const t = (localIdx - 160) / 45;
        cbX = cx;
        cbY = cy - 0.11 + t * 0.22;
      } else {
        const t = (localIdx - 205) / 45;
        cbX = cx - 0.11 + t * 0.22;
        cbY = cy;
      }
      cbZ = (Math.random() - 0.5) * 0.01;
    } else if (i < 2100) {
      const localIdx = i - 1800;
      const cx = -1.5;
      const cy = CY - 0.85;
      if (localIdx < 150) {
        const theta = (localIdx / 150) * Math.PI * 2;
        cbX = cx + Math.cos(theta) * 0.22;
        cbY = cy + Math.sin(theta) * 0.22;
      } else {
        const sub = localIdx - 150;
        if (sub < 20) {
          const theta = (sub / 20) * Math.PI * 2;
          cbX = cx - 0.09 + Math.cos(theta) * 0.025;
          cbY = cy + Math.sin(theta) * 0.025;
        } else if (sub < 40) {
          const theta = ((sub - 20) / 20) * Math.PI * 2;
          cbX = cx + 0.08 + Math.cos(theta) * 0.025;
          cbY = cy + 0.065 + Math.sin(theta) * 0.025;
        } else if (sub < 60) {
          const theta = ((sub - 40) / 20) * Math.PI * 2;
          cbX = cx + 0.08 + Math.cos(theta) * 0.025;
          cbY = cy - 0.065 + Math.sin(theta) * 0.025;
        } else {
          const lineIdx = sub - 60;
          if (lineIdx < 30) {
            const t = lineIdx / 30;
            cbX = cx - 0.09 + t * 0.09;
            cbY = cy;
          } else if (lineIdx < 60) {
            const t = (lineIdx - 30) / 30;
            cbX = cx + t * 0.08;
            cbY = cy + t * 0.065;
          } else {
            const t = (lineIdx - 60) / 30;
            cbX = cx + t * 0.08;
            cbY = cy - t * 0.065;
          }
        }
      }
      cbZ = (Math.random() - 0.5) * 0.01;
    } else if (i < 2350) {
      const localIdx = i - 2100;
      const cx = 1.5;
      const cy = CY - 0.85;
      if (localIdx < 40) {
        const theta = (localIdx / 40) * Math.PI;
        cbX = cx + Math.cos(theta) * 0.055;
        cbY = cy + 0.035 + Math.sin(theta) * 0.055;
      } else if (localIdx < 100) {
        const t = (localIdx - 40) / 60;
        cbX = localIdx % 2 === 0 ? cx - 0.055 : cx + 0.055;
        cbY = cy - 0.065 + t * 0.1;
      } else if (localIdx < 180) {
        const t = (localIdx - 100) / 80;
        const theta = Math.PI + t * Math.PI;
        cbX = cx + Math.cos(theta) * 0.11;
        cbY = cy + Math.sin(theta) * 0.11;
      } else if (localIdx < 215) {
        const t = (localIdx - 180) / 35;
        cbX = cx;
        cbY = cy - 0.11 - t * 0.08;
      } else {
        const t = (localIdx - 215) / 35;
        cbX = cx - 0.08 + t * 0.16;
        cbY = cy - 0.19;
      }
      cbZ = (Math.random() - 0.5) * 0.01;
    } else {
      const localIdx = i - 2350;
      const cx = 2.1;
      const cy = CY - 0.85;
      let found = 0;
      let candidateIdx = 0;
      cbX = cx;
      cbY = cy;
      while (candidateIdx < 2500) {
        const theta = candidateIdx * 2.39996;
        const rVal = Math.sqrt(candidateIdx / 620) * 0.25;
        const px = Math.cos(theta) * rVal;
        const py = Math.sin(theta) * rVal;
        const isShaft = px >= -0.024 && px <= 0.024 && py >= -0.13 && py <= 0.04;
        const isHead = py > 0.04 && py <= 0.14 && Math.abs(px) <= (0.14 - py) * 0.95;
        if (!isShaft && !isHead) {
          if (found === localIdx) {
            cbX = cx + px;
            cbY = cy + py;
            break;
          }
          found++;
        }
        candidateIdx++;
      }
      cbZ = (Math.random() - 0.5) * 0.01;
    }

    target[idx] = cbX + (Math.random() - 0.5) * 0.006;
    target[idx + 1] = cbY + (Math.random() - 0.5) * 0.006;
    target[idx + 2] = cbZ;
  }

  setProgress(p: number): void {
    this.scrollProgress = Math.max(0, Math.min(1, p));
  }

  setMouse(ndcX: number, ndcY: number): void {
    this.mouseTarget.x = ndcX * 2.5;
    this.mouseTarget.y = ndcY * 2.5;
    this.rawNDC.x = ndcX;
    this.rawNDC.y = ndcY;
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

  stop(): void {
    if (!this.rafId) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private handleResize(): void {
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private update(): void {
    const time = this.clock.getElapsedTime();

    this.scrollProgressLerped += (this.scrollProgress - this.scrollProgressLerped) * 0.035;
    const scroll = this.scrollProgressLerped;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, this.mouseTarget.x * 0.08, 0.05);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.mouseTarget.y * 0.08, 0.05);
    this.camera.position.z = 10.5 - scroll * 1.3;
    this.camera.lookAt(0, 0, 0);

    let w0 = 0, w1 = 0, w2 = 0, w3 = 0;
    if (scroll < 0.26) { w0 = 1; }
    else if (scroll < 0.38) {
      const t = (scroll - 0.26) / 0.12;
      const e = THREE.MathUtils.smoothstep(t, 0, 1);
      w0 = 1 - e; w1 = e;
    } else if (scroll < 0.58) { w1 = 1; }
    else if (scroll < 0.7) {
      const t = (scroll - 0.58) / 0.12;
      const e = THREE.MathUtils.smoothstep(t, 0, 1);
      w1 = 1 - e; w2 = e;
    } else if (scroll < 0.86) { w2 = 1; }
    else if (scroll < 0.96) {
      const t = (scroll - 0.86) / 0.1;
      const e = THREE.MathUtils.smoothstep(t, 0, 1);
      w2 = 1 - e; w3 = e;
    } else { w3 = 1; }

    this.mouseLerped.x += (this.rawNDC.x - this.mouseLerped.x) * 0.12;
    this.mouseLerped.y += (this.rawNDC.y - this.mouseLerped.y) * 0.12;

    const mouseVector = new THREE.Vector3(this.mouseLerped.x, this.mouseLerped.y, 0.5);
    mouseVector.unproject(this.camera);
    const dir = mouseVector.sub(this.camera.position).normalize();
    const distToPlane = dir.z !== 0 ? -this.camera.position.z / dir.z : 0;
    const mWorldX = this.camera.position.x + dir.x * distToPlane;
    const mWorldY = this.camera.position.y + dir.y * distToPlane;

    const posAttr = this.geometry.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = this.geometry.getAttribute("color") as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    const bp = this.basePositions;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const type = this.particleTypes[i];

      const baseTargetX =
        bp.state0_eye[idx] * w0 + bp.state1_letters[idx] * w1 + bp.state2_chatBox[idx] * w2 + bp.state3_networkEye[idx] * w3;
      const baseTargetY =
        bp.state0_eye[idx + 1] * w0 + bp.state1_letters[idx + 1] * w1 + bp.state2_chatBox[idx + 1] * w2 + bp.state3_networkEye[idx + 1] * w3;
      const baseTargetZ =
        bp.state0_eye[idx + 2] * w0 + bp.state1_letters[idx + 2] * w1 + bp.state2_chatBox[idx + 2] * w2 + bp.state3_networkEye[idx + 2] * w3;

      let pulseFactor = 1.0;
      if (type === 0) pulseFactor = 1 + Math.sin(time * 2.8 + i * 0.05) * 0.03;
      else if (type === 1) pulseFactor = 1 + Math.cos(time * 1.5 + i * 0.003) * 0.05;

      let gazeX = 0;
      let gazeY = 0;
      if (type === 0 || type === 1) {
        const intensity = type === 0 ? 0.28 : 0.18;
        gazeX = this.mouseTarget.x * intensity * (w0 + w3);
        gazeY = this.mouseTarget.y * intensity * (w0 + w3);
      }

      posArr[idx] = baseTargetX * pulseFactor + gazeX;
      posArr[idx + 1] = baseTargetY * pulseFactor + gazeY;
      posArr[idx + 2] = baseTargetZ;

      const dx = posArr[idx] - mWorldX;
      const dy = posArr[idx + 1] - mWorldY;
      const distSq = dx * dx + dy * dy;
      const interactionRadius = 1.15;
      if (distSq < interactionRadius * interactionRadius) {
        const dist = Math.sqrt(distSq) || 0.0001;
        const forceRatio = Math.pow(1 - dist / interactionRadius, 2.2);
        const pushForce = forceRatio * 0.48;
        const swirlAngle = 0.58;
        const pushX = (dx / dist) * pushForce;
        const pushY = (dy / dist) * pushForce;
        posArr[idx] += pushX * Math.cos(swirlAngle) - pushY * Math.sin(swirlAngle);
        posArr[idx + 1] += pushX * Math.sin(swirlAngle) + pushY * Math.cos(swirlAngle);
      }

      let r0 = 0, g0 = 0, b0 = 0;
      let r2 = 0, g2 = 0, b2 = 0;
      if (type === 0) { r0 = 0.52; g0 = 0.12; b0 = 0.18; }
      else if (type === 1) { r0 = 0.95; g0 = 0.44; b0 = 0.12; }
      else { r0 = 0.88; g0 = 0.2; b0 = 0.38; }

      if (i < 800) { r2 = 0.5; g2 = 0.55; b2 = 0.65; }
      else if (i < 1350) {
        const localIdx = i - 800;
        if (localIdx >= 220 && localIdx < 340) { r2 = 0.95; g2 = 0.05; b2 = 0.6; }
        else if (localIdx >= 340 && localIdx < 420) { r2 = 0.05; g2 = 0.72; b2 = 0.6; }
        else if (localIdx >= 420) { r2 = 0.98; g2 = 0.98; b2 = 1.0; }
        else { r2 = 0.6; g2 = 0.62; b2 = 0.7; }
      } else if (i < 1550) { r2 = 0.1; g2 = 0.11; b2 = 0.16; }
      else if (i < 1800) { r2 = 0.35; g2 = 0.38; b2 = 0.44; }
      else if (i < 2100) {
        const localIdx = i - 1800;
        if (localIdx >= 150 && localIdx < 210) { r2 = 0.92; g2 = 0.32; b2 = 0.24; }
        else { r2 = 0.35; g2 = 0.38; b2 = 0.44; }
      } else if (i < 2350) { r2 = 0.3; g2 = 0.33; b2 = 0.4; }
      else { r2 = 0.1; g2 = 0.11; b2 = 0.16; }

      const targetR = r0 * (w0 + w1 + w3) + r2 * w2;
      const targetG = g0 * (w0 + w1 + w3) + g2 * w2;
      const targetB = b0 * (w0 + w1 + w3) + b2 * w2;

      const dp = Math.sin(i * 0.05) * 0.015;
      colArr[idx] = targetR + dp;
      colArr[idx + 1] = targetG + dp;
      colArr[idx + 2] = targetB + dp;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    this.points.rotation.set(0, 0, 0);
  }

  dispose(): void {
    this.stop();
    this.resizeObs.disconnect();
    this.geometry.dispose();
    this.pointsMaterial.dispose();
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
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

export function AiSculpture({ stage }: AiSculptureProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SculptureScene | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const isLive = stage.presence > 0.05;

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const s = new SculptureScene(c);
    sceneRef.current = s;
    if (isLive) s.start();

    const onMove = (e: MouseEvent) => {
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
      s.setMouse(ndcX, ndcY);
      setCoords({ x: ndcX, y: ndcY });
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      s.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;
    s.setProgress(stage.hold);

    let nextIdx = 0;
    if (stage.hold < 0.26) nextIdx = 0;
    else if (stage.hold < 0.58) nextIdx = 1;
    else if (stage.hold < 0.86) nextIdx = 2;
    else nextIdx = 3;
    setActiveIdx(nextIdx);
    setProgressPct(stage.hold);
  }, [stage.hold]);

  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;
    if (isLive) s.start();
    else s.stop();
  }, [isLive]);

  const detail = stageDetails[activeIdx];

  return (
    <div className="absolute inset-0 overflow-hidden" dir="ltr">
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ transform: "translateY(-30px)" }}
      />

      <div className="pointer-events-none absolute left-4 top-4 sm:left-6 sm:top-6">
        <div className="flex items-center gap-2 rounded-full border border-[#142111]/16 bg-white/90 px-3 py-1.5 text-[10px] font-mono font-bold tracking-[0.16em] text-[#142111]/75 backdrop-blur sm:text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#142111] animate-pulse" />
          <span>{detail.num}</span>
          <span className="text-[#142111]/40">/</span>
          <span>{stageDetails.length.toString().padStart(2, "0")}</span>
        </div>
      </div>

      <div className="pointer-events-none absolute right-4 top-4 sm:right-6 sm:top-6">
        <div className="flex items-center gap-2 rounded-full border border-[#142111]/16 bg-white/90 px-3 py-1.5 text-[10px] font-mono font-bold text-[#142111]/70 backdrop-blur">
          <span className="text-[#142111]/45">X</span>
          <span>{coords.x >= 0 ? "+" : ""}{coords.x.toFixed(2)}</span>
          <span className="text-[#142111]/30">·</span>
          <span className="text-[#142111]/45">Y</span>
          <span>{coords.y >= 0 ? "+" : ""}{coords.y.toFixed(2)}</span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-1/2 w-[min(520px,90%)] -translate-x-1/2 sm:bottom-3">
        <div className="flex flex-col gap-2 rounded-2xl border border-[#142111]/16 bg-white/92 px-4 py-3 backdrop-blur" dir="rtl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#142111] px-2 py-0.5 font-mono text-[9.5px] font-bold tracking-wider text-white">
                {detail.num}
              </span>
              <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#142111]/55 sm:text-[10.5px]">
                {detail.tag}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {stageDetails.map((_, i) => {
                const isActive = i === activeIdx;
                const isPast = i < activeIdx;
                return (
                  <div
                    key={i}
                    className="h-[3px] rounded-full transition-all duration-500"
                    style={{
                      width: isActive ? 18 : 6,
                      backgroundColor: isActive ? "#142111" : isPast ? "rgba(20,33,17,0.45)" : "rgba(20,33,17,0.15)"
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="text-[13px] font-bold leading-tight text-[#142111] sm:text-[15px]">
              {detail.title}
            </h4>
            <p className="text-[11px] leading-relaxed text-[#142111]/72 sm:text-[12px]">
              {detail.body}
            </p>
          </div>

          <div className="flex items-center gap-2 border-t border-[#142111]/10 pt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F2701F]" />
            <span className="text-[10px] font-semibold text-[#142111]/68 sm:text-[11px]">
              {detail.example}
            </span>
            <span className="ms-auto font-mono text-[9px] font-bold tracking-wider text-[#142111]/40 sm:text-[10px]">
              {Math.round(progressPct * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiSculpture;
