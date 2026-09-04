'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { festiveAudio } from '@/lib/audio';

export interface JanmashtamiCanvasProps {
  currentTime: number;
  isPlaying: boolean;
  onPotBroken?: () => void;
  isMuted?: boolean;
}

// ----------------------------------------------------------------------
// PROCEDURAL PBR TEXTURES (Zero external assets, instant Blender quality)
// ----------------------------------------------------------------------

// 1. Subtle Textured Sandstone Flagstone Pavers for Courtyard Ground
function createStonePaverTexture(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Warm temple mortar bedding
  ctx.fillStyle = '#bca892';
  ctx.fillRect(0, 0, 1024, 1024);

  // 6 rows of interlocking running-bond sandstone flagstone pavers
  const rows = 6;
  const cols = 6;
  const rowHeight = 1024 / rows;
  const colWidth = 1024 / cols;
  const mortar = 5; // 5px recessed mortar joints

  // Authentic Rajasthani Dholpur sandstone tone palette
  const stoneTones = [
    '#efe3d3',
    '#f5ebdc',
    '#ebdccb',
    '#e4d4bf',
    '#f7eee2',
    '#e2d1bc',
    '#eddcc8',
    '#f3e8da',
  ];

  for (let r = 0; r < rows; r++) {
    const y = r * rowHeight;
    const xOffset = r % 2 === 0 ? 0 : colWidth * 0.5;

    for (let c = -1; c <= cols + 1; c++) {
      const x = c * colWidth + xOffset;
      const w = colWidth;
      const h = rowHeight;

      // Pseudo-random index based on grid coordinates
      const hash = Math.abs(Math.sin(r * 12.9898 + c * 78.233) * 43758.5453);
      const toneIndex = Math.floor((hash % 1) * stoneTones.length);
      const baseColor = stoneTones[toneIndex];

      // Draw stone slab with rounded beveled edges
      ctx.fillStyle = baseColor;
      ctx.fillRect(x + mortar, y + mortar, w - mortar * 2, h - mortar * 2);

      // Subtle directional gradient across slab simulating chiseled dressing
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.09)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(100, 70, 40, 0.08)');
      ctx.fillStyle = grad;
      ctx.fillRect(x + mortar, y + mortar, w - mortar * 2, h - mortar * 2);

      // Chiseled border bevel highlight on top-left, shadow on bottom-right
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.beginPath();
      ctx.moveTo(x + mortar, y + h - mortar);
      ctx.lineTo(x + mortar, y + mortar);
      ctx.lineTo(x + w - mortar, y + mortar);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(70, 45, 25, 0.18)';
      ctx.beginPath();
      ctx.moveTo(x + w - mortar, y + mortar);
      ctx.lineTo(x + w - mortar, y + h - mortar);
      ctx.lineTo(x + mortar, y + h - mortar);
      ctx.stroke();
    }
  }

  // Micro stone grain & natural sediment pitting
  for (let i = 0; i < 45000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const alpha = Math.random() * 0.07;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(160, 110, 70, ${alpha})` : `rgba(255, 255, 255, ${alpha * 1.5})`;
    ctx.fillRect(x, y, 1.5 + Math.random() * 2, 1.5 + Math.random() * 2);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(15, 15); // Realistic ~1-meter stone pavers across the courtyard

  // High-precision Bump Map for tactile stone relief
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 1024;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Mid-gray base
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 1024, 1024);

  // Recessed dark mortar seams
  bCtx.fillStyle = '#404040';
  for (let r = 0; r < rows; r++) {
    const y = r * rowHeight;
    const xOffset = r % 2 === 0 ? 0 : colWidth * 0.5;
    bCtx.fillRect(0, y, 1024, mortar * 2);

    for (let c = -1; c <= cols + 1; c++) {
      const x = c * colWidth + xOffset;
      bCtx.fillRect(x, y, mortar * 2, rowHeight);
    }
  }

  // Stone surface micro-noise
  for (let i = 0; i < 35000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    bCtx.fillStyle = Math.random() > 0.5 ? '#929292' : '#6e6e6e';
    bCtx.fillRect(x, y, 2, 2);
  }

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(15, 15);

  return { map, bump };
}

// 2. Sacred Ceremonial Rangoli Mandala Dais Texture
function createRangoliDaisTexture(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Warm polished temple sandstone dais base
  ctx.fillStyle = '#fbf5ed';
  ctx.fillRect(0, 0, 1024, 1024);

  // Fine marble/sandstone grain
  for (let i = 0; i < 30000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const alpha = Math.random() * 0.05;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(180, 130, 90, ${alpha})` : `rgba(255, 255, 255, ${alpha * 1.5})`;
    ctx.fillRect(x, y, 2, 2);
  }

  const cx = 512;
  const cy = 512;

  // Outer decorative border with auspicious tooth motifs
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, 470, 0, Math.PI * 2);
  ctx.stroke();

  // Sacred concentric rings of Turmeric (Haldi) & Kumkum (Vermilion)
  const ringRadii = [450, 410, 350, 270, 200, 130, 60];
  ringRadii.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = idx % 2 === 0 ? 'rgba(217, 119, 6, 0.48)' : 'rgba(239, 68, 68, 0.42)';
    ctx.lineWidth = 4;
    ctx.stroke();
  });

  // 16-Petal Sacred Lotus (Padma)
  const petals = 16;
  ctx.fillStyle = 'rgba(245, 158, 11, 0.24)';
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.55)';
  ctx.lineWidth = 3;

  for (let i = 0; i < petals; i++) {
    const angle = (i * Math.PI * 2) / petals;
    const nextAngle = ((i + 1) * Math.PI * 2) / petals;
    const midAngle = angle + Math.PI / petals;

    const rBase = 200;
    const rTip = 340;

    const x1 = cx + Math.cos(angle) * rBase;
    const y1 = cy + Math.sin(angle) * rBase;
    const xTip = cx + Math.cos(midAngle) * rTip;
    const yTip = cy + Math.sin(midAngle) * rTip;
    const x2 = cx + Math.cos(nextAngle) * rBase;
    const y2 = cy + Math.sin(nextAngle) * rBase;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx + Math.cos(midAngle) * (rBase * 1.25), cy + Math.sin(midAngle) * (rBase * 1.25), xTip, yTip);
    ctx.quadraticCurveTo(cx + Math.cos(midAngle) * (rBase * 1.25), cy + Math.sin(midAngle) * (rBase * 1.25), x2, y2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Sacred Diya dots around the perimeter
  for (let i = 0; i < 36; i++) {
    const angle = (i * Math.PI * 2) / 36;
    const bx = cx + Math.cos(angle) * 390;
    const by = cy + Math.sin(angle) * 390;
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(220, 38, 38, 0.75)' : 'rgba(245, 158, 11, 0.85)';
    ctx.fill();
  }

  const map = new THREE.CanvasTexture(canvas);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 15000; i++) {
    bCtx.fillStyle = Math.random() > 0.5 ? '#8e8e8e' : '#727272';
    bCtx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const bump = new THREE.CanvasTexture(bumpCanvas);

  return { map, bump };
}

// 2. Terracotta Baked Matki Texture with Traditional White Rice-Paste (Chuna) Motifs
function createMatkiTexture(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Baked earthen terracotta gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#b44319');
  grad.addColorStop(0.3, '#d45624');
  grad.addColorStop(0.7, '#ba451a');
  grad.addColorStop(1, '#8f300f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Natural clay kiln firing variation
  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const a = Math.random() * 0.08;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255, 180, 120, ${a})` : `rgba(60, 20, 5, ${a})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Traditional painted white rice paste rings and patterns
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.lineWidth = 4;

  // Upper band
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.lineTo(512, 120);
  ctx.stroke();

  // Zig-zag geometric chevron band
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= 512; x += 16) {
    const y = x % 32 === 0 ? 150 : 175;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Mid decorative band
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 210);
  ctx.lineTo(512, 210);
  ctx.stroke();

  // Peacock feather dots along the equator
  for (let x = 8; x < 512; x += 32) {
    ctx.beginPath();
    ctx.arc(x, 260, 6, 0, Math.PI * 2);
    ctx.fill();

    // Sacred teardrop motif
    ctx.beginPath();
    ctx.arc(x + 16, 290, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lower ring
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.lineTo(512, 360);
  ctx.stroke();

  const map = new THREE.CanvasTexture(canvas);

  // Matki porous clay bump
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    bCtx.fillStyle = Math.random() > 0.5 ? '#8e8e8e' : '#727272';
    bCtx.fillRect(x, y, 2, 2);
  }
  const bump = new THREE.CanvasTexture(bumpCanvas);

  return { map, bump };
}

// ----------------------------------------------------------------------
// DATA TYPES & RIG INTERFACE
// ----------------------------------------------------------------------

interface GopalaRig {
  id: string;
  name: string;
  color: number;
  isKrishna?: boolean;
  isDrummer?: boolean;

  // Hierarchical Body Nodes
  root: THREE.Group;
  squashGroup: THREE.Group; // For organic squash & stretch
  pelvis: THREE.Group;
  torso: THREE.Group;
  chestMesh: THREE.Mesh;
  neck: THREE.Group;
  headGroup: THREE.Group;
  headMesh: THREE.Mesh;
  mouth: THREE.Mesh;
  tongue: THREE.Mesh;
  eyeL: THREE.Mesh;
  eyeR: THREE.Mesh;
  pupilL: THREE.Mesh;
  pupilR: THREE.Mesh;
  browL: THREE.Mesh;
  browR: THREE.Mesh;

  // Articulated Arms
  leftShoulder: THREE.Group;
  leftElbow: THREE.Group;
  leftHand: THREE.Group;
  rightShoulder: THREE.Group;
  rightElbow: THREE.Group;
  rightHand: THREE.Group;

  // Articulated Legs
  leftHip: THREE.Group;
  leftKnee: THREE.Group;
  leftFoot: THREE.Mesh;
  rightHip: THREE.Group;
  rightKnee: THREE.Group;
  rightFoot: THREE.Mesh;

  // Props & Secondary Physics
  stick?: THREE.Mesh;
  dholak?: THREE.Group;
  peacockFeather?: THREE.Group;
  featherVelocity: number;
  featherAngle: number;
  dholakSwingAngle: number;
  dholakSwingVel: number;

  // Interaction
  hitMesh: THREE.Mesh;
  cheerBounce: number;
}

interface SpectatorRig {
  id: string;
  name: string;
  root: THREE.Group;
  squashGroup: THREE.Group;
  headGroup: THREE.Group;
  torso: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  hitMesh: THREE.Mesh;
  baseRotY: number;
  clapOffset: number;
  cheerBounce: number;
  isWavingFlag?: boolean;
  hasCymbals?: boolean;
}

interface ActiveCheeringPopup {
  sprite: THREE.Sprite;
  createdAt: number;
  initialY: number;
  maxLife: number;
  sparkles: {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    rotVel: THREE.Vector3;
  }[];
}

const KRISHNA_CHEERS = [
  'Govinda Ala Re! 🦚',
  'Makhan Chor Ki Jai! 🍯',
  'Jai Shri Krishna! ✨',
  'Jai Kanhaiya Lal Ki! 🦚',
];

const DRUMMER_CHEERS = [
  'Dahi Handi Dhamaal! 🥁',
  'Mach Gaya Shor! 🎵',
  'Taal Pe Dholak! 🎶',
  'Zor Se Bajao! 🥁',
];

const CLIMBER_CHEERS = [
  'Tootega Handi! 🏺',
  'Haathi Ghoda Paalki! 🐘',
  'Zor Lagake Haisha! 💪',
  'Chadh Jao Govinda! 🚩',
  'Jai Govinda! ✨',
];

const SPECTATOR_CHEERS = [
  'Govinda Ala Re! 🎉',
  'Aala Re Aala! 🎊',
  'Bolo Radhe Radhe! 🙏',
  'Gokulashtami Ki Jai! 🪔',
  'Zor Se Bolo! 🙌',
  'Shabaash Govinda! 👏',
  'Mor Mukut Dhari Ki Jai! 🦚',
  'Hare Krishna Hare Ram! 🌺',
  'Dahi Handi Zindabad! 🍯',
];

interface ShardData {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotVelocity: THREE.Vector3;
}

interface CurdData {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  initialScale: number;
}

interface PetalData {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotVelocity: THREE.Vector3;
  swaySeed: number;
}

// ----------------------------------------------------------------------
// SCENE BUILDERS
// ----------------------------------------------------------------------

// Procedural Authentic Rajasthani/Mathura Dholpur Sandstone PBR Texture with Ashlar Masonry
function createTempleSandstoneTexture(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm Jaisalmer / Mathura Dholpur Sandstone base gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#f0d7be');
  grad.addColorStop(0.35, '#e4c6a6');
  grad.addColorStop(0.7, '#dcb895');
  grad.addColorStop(1, '#cea47e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Natural sedimentary stratum striations
  for (let y = 0; y < 512; y += 3) {
    const wave = Math.sin(y * 0.05) * 8 + Math.cos(y * 0.1) * 4;
    ctx.fillStyle = (y % 12 === 0) ? 'rgba(175, 120, 85, 0.09)' : 'rgba(255, 240, 225, 0.08)';
    ctx.fillRect(0, y + wave * 0.1, 512, 2.5);
  }

  // Ashlar stone masonry block joints (coursed stone pattern)
  const rows = 8;
  const rowHeight = 512 / rows;
  ctx.strokeStyle = 'rgba(80, 48, 25, 0.28)';
  ctx.lineWidth = 2.5;

  for (let r = 0; r <= rows; r++) {
    const y = r * rowHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    // Vertical joints with alternating staggered bond
    const blockWidth = 64;
    const offset = (r % 2) * (blockWidth / 2);
    for (let x = offset; x <= 512; x += blockWidth) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rowHeight);
      ctx.stroke();

      // Subtle chiseled stone edge highlight
      ctx.fillStyle = 'rgba(255, 248, 235, 0.14)';
      ctx.fillRect(x + 1.5, y + 1.5, blockWidth - 3, 2);
      ctx.fillStyle = 'rgba(65, 38, 20, 0.08)';
      ctx.fillRect(x + 1.5, y + rowHeight - 2.5, blockWidth - 3, 2);
    }
  }

  // Micro-sandstone mineral grains (speckles)
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(75, 45, 25, 0.12)' : 'rgba(255, 250, 240, 0.16)';
    ctx.fillRect(rx, ry, 1.5, 1.5);
  }

  // Corresponding grayscale Bump Map
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);

  // Recessed mortar joints in bump map
  bCtx.strokeStyle = '#303030';
  bCtx.lineWidth = 3;
  for (let r = 0; r <= rows; r++) {
    const y = r * rowHeight;
    bCtx.beginPath();
    bCtx.moveTo(0, y);
    bCtx.lineTo(512, y);
    bCtx.stroke();

    const blockWidth = 64;
    const offset = (r % 2) * (blockWidth / 2);
    for (let x = offset; x <= 512; x += blockWidth) {
      bCtx.beginPath();
      bCtx.moveTo(x, y);
      bCtx.lineTo(x, y + rowHeight);
      bCtx.stroke();

      // Raised stone face
      bCtx.fillStyle = '#9c9c9c';
      bCtx.fillRect(x + 3, y + 3, blockWidth - 6, rowHeight - 6);
    }
  }

  // Grain noise in bump map
  for (let i = 0; i < 3500; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    bCtx.fillStyle = Math.random() > 0.5 ? '#686868' : '#a8a8a8';
    bCtx.fillRect(rx, ry, 1.5, 1.5);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 4);

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(4, 4);

  return { map, bump };
}

// Distant Festive Temple-Inspired Architectural Backdrop (Shikharas, Mandapa Colonnade, Chhatris & Deepastambhas)
function buildTempleBackdrop(
  scene: THREE.Scene,
  flagsRef?: React.MutableRefObject<THREE.Mesh[]>,
  diyaLightsRef?: React.MutableRefObject<THREE.PointLight[]>
) {
  const templeGroup = new THREE.Group();

  // Authentic Rajasthani / Mathura Dholpur Sandstone Textures & PBR Materials
  const { map: stoneMap, bump: stoneBump } = createTempleSandstoneTexture();

  const stoneMat = new THREE.MeshPhysicalMaterial({
    map: stoneMap,
    bumpMap: stoneBump,
    bumpScale: 0.045,
    color: 0xf5dfcb, // Warm buff sandstone
    roughness: 0.76,
    metalness: 0.04,
    clearcoat: 0.08,
  });

  const stoneDarkMat = new THREE.MeshPhysicalMaterial({
    map: stoneMap,
    bumpMap: stoneBump,
    bumpScale: 0.04,
    color: 0xd4a682, // Shaded / recessed stone
    roughness: 0.82,
    metalness: 0.04,
  });

  const teakWoodMat = new THREE.MeshPhysicalMaterial({
    color: 0x3d2010, // Antique carved temple teakwood
    roughness: 0.42,
    clearcoat: 0.25,
    clearcoatRoughness: 0.35,
  });

  const goldFinialMat = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b, // Gleaming temple Kalash brass/gold
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.45,
  });

  const saffronFlagMat = new THREE.MeshPhysicalMaterial({
    color: 0xf97316, // Sacred saffron silk
    roughness: 0.5,
    sheen: 0.8,
    sheenColor: new THREE.Color(0xfef08a),
    side: THREE.DoubleSide,
  });

  const crimsonSilkMat = new THREE.MeshPhysicalMaterial({
    color: 0xb91c1c, // Sacred vermilion silk
    roughness: 0.55,
    sheen: 0.85,
    sheenColor: new THREE.Color(0xfca5a5),
  });

  const marigoldOrangeMat = new THREE.MeshPhysicalMaterial({
    color: 0xea580c,
    roughness: 0.55,
    sheen: 0.8,
    sheenColor: 0xfef08a,
  });

  const marigoldYellowMat = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15,
    roughness: 0.55,
    sheen: 0.8,
    sheenColor: 0xffffff,
  });

  const leafMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e6a32,
    roughness: 0.25,
    clearcoat: 0.45,
    sheen: 0.5,
    sheenColor: 0x4ade80,
  });

  const brassLampMat = new THREE.MeshPhysicalMaterial({
    color: 0xb45309,
    metalness: 0.88,
    roughness: 0.22,
    clearcoat: 0.3,
  });

  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xfff7ed,
  });

  // Reusable Flower & Leaf Geometries for Torans
  const garlandFlowerGeo = new THREE.DodecahedronGeometry(0.09, 0);
  const bandhanLeafGeo = new THREE.ConeGeometry(0.08, 0.42, 5);
  bandhanLeafGeo.rotateZ(Math.PI);

  // 1. REAR RAISED TEMPLE TERRACE PLATFORM (Z = -14.5 to -22)
  const terraceGeo = new THREE.BoxGeometry(46, 0.45, 12);
  const terrace = new THREE.Mesh(terraceGeo, stoneDarkMat);
  terrace.position.set(0, 0.225, -18);
  terrace.receiveShadow = true;
  templeGroup.add(terrace);

  // Terrace step molding
  const stepMoldingGeo = new THREE.BoxGeometry(47, 0.18, 0.4);
  const stepMolding = new THREE.Mesh(stepMoldingGeo, stoneMat);
  stepMolding.position.set(0, 0.36, -12);
  templeGroup.add(stepMolding);

  // Helper to build a classical Hindu Temple Shikhara (Tower) with authentic Bhumi tiers & Kalash
  const createShikhara = (x: number, z: number, scale: number, height: number): THREE.Group => {
    const tower = new THREE.Group();
    tower.position.set(x, 0, z);

    // Stepped plinth (Upapitha)
    const plinthGeo = new THREE.BoxGeometry(7 * scale, 1.8 * scale, 7 * scale);
    const plinth = new THREE.Mesh(plinthGeo, stoneMat);
    plinth.position.y = 0.9 * scale;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    tower.add(plinth);

    // Cornice band with lotus molding
    const corniceGeo = new THREE.BoxGeometry(7.6 * scale, 0.35 * scale, 7.6 * scale);
    const cornice = new THREE.Mesh(corniceGeo, stoneDarkMat);
    cornice.position.y = 1.8 * scale;
    tower.add(cornice);

    // Multi-tier curvilinear tower body (Bada & Gandi)
    const tiers = 5;
    let currentY = 1.9 * scale;
    const tierHeight = (height - 3.5 * scale) / tiers;

    for (let t = 0; t < tiers; t++) {
      const frac = t / tiers;
      const w = (6.0 - frac * 3.8) * scale;
      const h = tierHeight;

      const tierGeo = new THREE.BoxGeometry(w, h, w);
      const tierMesh = new THREE.Mesh(tierGeo, stoneMat);
      tierMesh.position.y = currentY + h * 0.5;
      tierMesh.castShadow = true;
      tower.add(tierMesh);

      // Horizontal relief molding band (Bhumi Chhadya)
      const bhumiBandGeo = new THREE.BoxGeometry(w + 0.18 * scale, 0.12 * scale, w + 0.18 * scale);
      const bhumiBand = new THREE.Mesh(bhumiBandGeo, stoneDarkMat);
      bhumiBand.position.y = currentY + h;
      tower.add(bhumiBand);

      // Vertical fluted stone pilasters on each face
      const pilasterGeo = new THREE.BoxGeometry(0.24 * scale, h, 0.28 * scale);
      [-w * 0.35, 0, w * 0.35].forEach((px) => {
        const pFront = new THREE.Mesh(pilasterGeo, stoneDarkMat);
        pFront.position.set(px, currentY + h * 0.5, w * 0.5 + 0.05 * scale);
        tower.add(pFront);

        const pBack = new THREE.Mesh(pilasterGeo, stoneDarkMat);
        pBack.position.set(px, currentY + h * 0.5, -w * 0.5 - 0.05 * scale);
        tower.add(pBack);
      });

      // Miniature corner subsidiary spires (Urushringas) on lower tiers
      if (t < 2) {
        const miniW = 0.9 * scale;
        const miniGeo = new THREE.ConeGeometry(miniW * 0.7, 1.6 * scale, 4);
        miniGeo.rotateY(Math.PI / 4);
        [
          [-w * 0.5, -w * 0.5],
          [w * 0.5, -w * 0.5],
          [-w * 0.5, w * 0.5],
          [w * 0.5, w * 0.5],
        ].forEach(([mx, mz]) => {
          const miniSpire = new THREE.Mesh(miniGeo, stoneDarkMat);
          miniSpire.position.set(mx, currentY + h + 0.5 * scale, mz);
          tower.add(miniSpire);
        });
      }

      currentY += h;
    }

    // Griva (Neck) with Marigold Garland Collar
    const grivaGeo = new THREE.CylinderGeometry(1.0 * scale, 1.0 * scale, 0.5 * scale, 16);
    const griva = new THREE.Mesh(grivaGeo, stoneDarkMat);
    griva.position.y = currentY + 0.25 * scale;
    tower.add(griva);

    // Auspicious Marigold Garland around the Shikhara neck
    const grivaMala = new THREE.Mesh(
      new THREE.TorusGeometry(1.05 * scale, 0.08 * scale, 8, 20),
      marigoldOrangeMat
    );
    grivaMala.rotateX(Math.PI / 2);
    grivaMala.position.y = currentY + 0.25 * scale;
    tower.add(grivaMala);

    currentY += 0.5 * scale;

    // Ribbed Stone Disc (Amalaka - Sacred Sun Wheel)
    const amalakaGeo = new THREE.TorusGeometry(1.3 * scale, 0.38 * scale, 12, 28);
    amalakaGeo.rotateX(Math.PI / 2);
    const amalaka = new THREE.Mesh(amalakaGeo, stoneMat);
    amalaka.position.y = currentY + 0.35 * scale;
    amalaka.castShadow = true;
    tower.add(amalaka);
    currentY += 0.7 * scale;

    // Golden Kalash Finial (Pot + Spire + Sacred Coconut)
    const kalashPotGeo = new THREE.SphereGeometry(0.55 * scale, 16, 16);
    const kalashPot = new THREE.Mesh(kalashPotGeo, goldFinialMat);
    kalashPot.position.y = currentY + 0.45 * scale;
    tower.add(kalashPot);

    const kalashSpireGeo = new THREE.ConeGeometry(0.28 * scale, 1.1 * scale, 12);
    const kalashSpire = new THREE.Mesh(kalashSpireGeo, goldFinialMat);
    kalashSpire.position.y = currentY + 1.1 * scale;
    tower.add(kalashSpire);

    // Sacred Saffron Silk Flag (Dhvaja / Pataka) with Gold Trim
    const poleGeo = new THREE.CylinderGeometry(0.035 * scale, 0.035 * scale, 2.2 * scale, 8);
    const pole = new THREE.Mesh(poleGeo, goldFinialMat);
    pole.position.set(0.08 * scale, currentY + 1.8 * scale, 0);
    tower.add(pole);

    const flagGeo = new THREE.BufferGeometry();
    const fW = 1.5 * scale;
    const fH = 0.72 * scale;
    const vertices = new Float32Array([
      0, 0, 0,
      fW, fH * 0.45, 0,
      0, fH, 0,
    ]);
    flagGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    flagGeo.computeVertexNormals();

    const flag = new THREE.Mesh(flagGeo, saffronFlagMat);
    flag.position.set(0.12 * scale, currentY + 2.0 * scale, 0);
    tower.add(flag);

    if (flagsRef) {
      flagsRef.current.push(flag);
    }

    return tower;
  };

  // Central Grand Shikhara (Towering majestic main temple spire)
  const centralShikhara = createShikhara(0, -19.5, 1.05, 15.8);
  templeGroup.add(centralShikhara);

  // Flanking Twin Shikharas (Left and right subsidiary towers)
  const leftShikhara = createShikhara(-9.6, -18.2, 0.76, 11.8);
  templeGroup.add(leftShikhara);

  const rightShikhara = createShikhara(9.6, -18.2, 0.76, 11.8);
  templeGroup.add(rightShikhara);

  // 2. REAR MANDAPA COLONNADE (Pillared Verandah Gallery along Z = -13.8)
  const colonnadeZ = -13.8;
  const pillarCount = 10;
  const pillarSpan = 34; // Spanning X from -17 to +17
  const pillarSpacing = pillarSpan / (pillarCount - 1);

  // Upper Lintel Beam
  const beamGeo = new THREE.BoxGeometry(36, 0.45, 0.75);
  const beam = new THREE.Mesh(beamGeo, stoneDarkMat);
  beam.position.set(0, 4.25, colonnadeZ);
  beam.castShadow = true;
  templeGroup.add(beam);

  // Sloping Carved Stone Sunshade Eaves (Chhajja)
  const chhajjaGeo = new THREE.BoxGeometry(37, 0.14, 1.1);
  chhajjaGeo.rotateX(0.22); // Angled downward
  const chhajja = new THREE.Mesh(chhajjaGeo, stoneMat);
  chhajja.position.set(0, 4.45, colonnadeZ + 0.35);
  chhajja.castShadow = true;
  templeGroup.add(chhajja);

  // Continuous Festive Marigold Garland along the entire 36m Chhajja Eaves
  for (let fx = -17.2; fx <= 17.2; fx += 0.45) {
    const fMesh = new THREE.Mesh(
      garlandFlowerGeo,
      Math.round(fx * 2) % 2 === 0 ? marigoldOrangeMat : marigoldYellowMat
    );
    fMesh.position.set(fx, 4.38, colonnadeZ + 0.88);
    fMesh.castShadow = true;
    templeGroup.add(fMesh);
  }

  // Upper Decorative Parapet Wall with Kangura Cresting (Merlons)
  const parapetGeo = new THREE.BoxGeometry(36, 0.65, 0.45);
  const parapet = new THREE.Mesh(parapetGeo, stoneMat);
  parapet.position.set(0, 4.85, colonnadeZ);
  templeGroup.add(parapet);

  for (let k = -17.5; k <= 17.5; k += 1.2) {
    const merlonGeo = new THREE.ConeGeometry(0.35, 0.45, 4);
    merlonGeo.rotateY(Math.PI / 4);
    const merlon = new THREE.Mesh(merlonGeo, stoneDarkMat);
    merlon.position.set(k, 5.35, colonnadeZ);
    templeGroup.add(merlon);
  }

  // 18 Glowing Temple Diyas along the Mandapa Parapet
  for (let dx = -16.5; dx <= 16.5; dx += 2.0) {
    const pDiya = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.038, 0.045, 8), brassLampMat);
    pDiya.position.set(dx, 5.22, colonnadeZ + 0.24);
    templeGroup.add(pDiya);

    const pFlame = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), flameMat);
    pFlame.scale.set(1, 1.8, 1);
    pFlame.position.set(dx, 5.27, colonnadeZ + 0.24);
    templeGroup.add(pFlame);
  }

  // 3. CENTRAL GARBHAGRIHA SANCTUM PORTAL (Mandir Dwar at Center x = 0, z = -14.2 to -15.8)
  const sanctumGroup = new THREE.Group();
  sanctumGroup.position.set(0, 0, colonnadeZ);

  // Recessed Sanctum Chamber Backwall & Floor
  const sanctumBackwall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.2, 0.3), stoneDarkMat);
  sanctumBackwall.position.set(0, 2.1, -1.8);
  sanctumGroup.add(sanctumBackwall);

  const sanctumSidewallL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.2, 1.8), stoneDarkMat);
  sanctumSidewallL.position.set(-2.1, 2.1, -0.9);
  sanctumGroup.add(sanctumSidewallL);

  const sanctumSidewallR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.2, 1.8), stoneDarkMat);
  sanctumSidewallR.position.set(2.1, 2.1, -0.9);
  sanctumGroup.add(sanctumSidewallR);

  // Carved Doorframe Jambs (Torana Dwarashakha)
  const doorJambGeo = new THREE.BoxGeometry(0.35, 3.8, 0.45);
  const doorJambL = new THREE.Mesh(doorJambGeo, stoneMat);
  doorJambL.position.set(-1.45, 1.9, -0.2);
  sanctumGroup.add(doorJambL);

  const doorJambR = new THREE.Mesh(doorJambGeo, stoneMat);
  doorJambR.position.set(1.45, 1.9, -0.2);
  sanctumGroup.add(doorJambR);

  // Carved Lintel Overdoor with Golden Sacred Om (ॐ) / Kalash Medallion
  const doorLintel = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.45, 0.5), stoneMat);
  doorLintel.position.set(0, 3.8, -0.2);
  sanctumGroup.add(doorLintel);

  const omMedallion = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 16), goldFinialMat);
  omMedallion.rotateX(Math.PI / 2);
  omMedallion.position.set(0, 3.8, 0.08);
  sanctumGroup.add(omMedallion);

  // Heavy Carved Teakwood Sanctum Doors (half-open into sanctum by 12 degrees)
  const doorLeafGeo = new THREE.BoxGeometry(1.25, 3.4, 0.08);
  const doorLeft = new THREE.Mesh(doorLeafGeo, teakWoodMat);
  doorLeft.position.set(-0.68, 1.7, -0.45);
  doorLeft.rotation.y = -0.22;
  doorLeft.castShadow = true;
  sanctumGroup.add(doorLeft);

  const doorRight = new THREE.Mesh(doorLeafGeo, teakWoodMat);
  doorRight.position.set(0.68, 1.7, -0.45);
  doorRight.rotation.y = 0.22;
  doorRight.castShadow = true;
  sanctumGroup.add(doorRight);

  // Brass Studs / Rosettes on Sanctum Doors
  for (let row = 0.5; row <= 3.0; row += 0.8) {
    [-0.95, -0.45, 0.45, 0.95].forEach((bx) => {
      const stud = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), goldFinialMat);
      stud.position.set(bx, row, -0.38);
      sanctumGroup.add(stud);
    });
  }

  // Golden Brass Ring Door Knockers
  const knockerGeo = new THREE.TorusGeometry(0.065, 0.016, 6, 16);
  const knockerL = new THREE.Mesh(knockerGeo, goldFinialMat);
  knockerL.position.set(-0.45, 1.7, -0.36);
  sanctumGroup.add(knockerL);

  const knockerR = new THREE.Mesh(knockerGeo, goldFinialMat);
  knockerR.position.set(0.45, 1.7, -0.36);
  sanctumGroup.add(knockerR);

  // Sacred Inner Altar (Singhasan) inside Sanctum with Divine Golden Glow
  const altarPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.5, 16), goldFinialMat);
  altarPlinth.position.set(0, 0.55, -1.3);
  sanctumGroup.add(altarPlinth);

  // Warm Divine Sanctum Radiance spilling onto colonnade steps
  const sanctumLight = new THREE.PointLight(0xffa500, 2.4, 14, 1.3);
  sanctumLight.position.set(0, 2.0, -1.2);
  sanctumGroup.add(sanctumLight);
  if (diyaLightsRef) {
    diyaLightsRef.current.push(sanctumLight);
  }

  // Flanking Tall Ornate Brass Standing Lamps (Kuthuvillakku) beside Sanctum
  [-1.75, 1.75].forEach((kx) => {
    const kuthuBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.12, 12), brassLampMat);
    kuthuBase.position.set(kx, 0.06, 0.25);
    sanctumGroup.add(kuthuBase);

    const kuthuShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 1.6, 8), brassLampMat);
    kuthuShaft.position.set(kx, 0.86, 0.25);
    sanctumGroup.add(kuthuShaft);

    // 3 Tiered Oil Dishes
    [0.7, 1.15, 1.6].forEach((dh) => {
      const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.06, 12), brassLampMat);
      dish.position.set(kx, dh, 0.25);
      sanctumGroup.add(dish);

      const kFlame = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.14, 6), flameMat);
      kFlame.position.set(kx, dh + 0.08, 0.25);
      sanctumGroup.add(kFlame);
    });
  });

  // Stepped Ceremonial Entrance Stairs leading down into courtyard
  for (let s = 0; s < 3; s++) {
    const stairGeo = new THREE.BoxGeometry(3.6 + s * 0.4, 0.14, 0.45);
    const stair = new THREE.Mesh(stairGeo, stoneMat);
    stair.position.set(0, 0.28 - s * 0.12, 0.35 + s * 0.42);
    sanctumGroup.add(stair);
  }

  templeGroup.add(sanctumGroup);

  // 4. CLASSICAL CARVED PILLARS, FESTIVE SILK DRAPES, ARCHES & FLORAL TORANS
  for (let i = 0; i < pillarCount; i++) {
    const px = -pillarSpan * 0.5 + i * pillarSpacing;

    // Pillar Plinth (Carved Square Base)
    const baseGeo = new THREE.BoxGeometry(0.72, 0.55, 0.72);
    const baseMesh = new THREE.Mesh(baseGeo, stoneMat);
    baseMesh.position.set(px, 0.65, colonnadeZ);
    baseMesh.castShadow = true;
    templeGroup.add(baseMesh);

    // Octagonal / Fluted Pillar Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.23, 0.27, 3.1, 8);
    const shaftMesh = new THREE.Mesh(shaftGeo, stoneMat);
    shaftMesh.position.set(px, 2.45, colonnadeZ);
    shaftMesh.castShadow = true;
    templeGroup.add(shaftMesh);

    // Ceremonial Silk Fabric Drape wrapped around Pillar Shaft (Janmashtami Temple Adornment)
    const drapeGeo = new THREE.CylinderGeometry(0.26, 0.29, 1.2, 16);
    const drapeMesh = new THREE.Mesh(
      drapeGeo,
      i % 2 === 0 ? crimsonSilkMat : saffronFlagMat
    );
    drapeMesh.position.set(px, 2.0, colonnadeZ);
    templeGroup.add(drapeMesh);

    // Golden Embroidered Sash (Kamarbandh) cinching the drape
    const sashGeo = new THREE.TorusGeometry(0.28, 0.024, 8, 20);
    sashGeo.rotateX(Math.PI / 2);
    const sash = new THREE.Mesh(sashGeo, goldFinialMat);
    sash.position.set(px, 2.0, colonnadeZ);
    templeGroup.add(sash);

    // Bracket Capital (Four-way bracket)
    const capitalGeo = new THREE.BoxGeometry(0.78, 0.38, 0.78);
    const capitalMesh = new THREE.Mesh(capitalGeo, stoneDarkMat);
    capitalMesh.position.set(px, 4.05, colonnadeZ);
    capitalMesh.castShadow = true;
    templeGroup.add(capitalMesh);

    // Vertical Hanging Marigold Floral Tassel with Golden Bell beneath each Capital
    const tasselGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.65, 8);
    const tassel = new THREE.Mesh(tasselGeo, marigoldOrangeMat);
    tassel.position.set(px, 3.48, colonnadeZ + 0.32);
    templeGroup.add(tassel);

    const tasselBell = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), goldFinialMat);
    tasselBell.position.set(px, 3.12, colonnadeZ + 0.32);
    templeGroup.add(tasselBell);

    // Decorative Scalloped Arch & Hanging Festive Toran between adjacent pillars
    if (i < pillarCount - 1) {
      const archSpan = pillarSpacing;
      const archMidX = px + archSpan * 0.5;

      // Scalloped stone arch curve
      const archCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(px + 0.35, 3.8, colonnadeZ),
        new THREE.Vector3(archMidX - 0.4, 4.05, colonnadeZ),
        new THREE.Vector3(archMidX, 4.12, colonnadeZ),
        new THREE.Vector3(archMidX + 0.4, 4.05, colonnadeZ),
        new THREE.Vector3(px + archSpan - 0.35, 3.8, colonnadeZ),
      ]);
      const archGeo = new THREE.TubeGeometry(archCurve, 16, 0.045, 6, false);
      const archMesh = new THREE.Mesh(archGeo, stoneDarkMat);
      templeGroup.add(archMesh);

      // FESTIVE MARIGOLD FLORAL TORAN (Bandhanwar) hanging under the arch
      const garlandCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(px + 0.28, 3.92, colonnadeZ + 0.12),
        new THREE.Vector3(archMidX - 0.65, 3.52, colonnadeZ + 0.15),
        new THREE.Vector3(archMidX, 3.42, colonnadeZ + 0.16),
        new THREE.Vector3(archMidX + 0.65, 3.52, colonnadeZ + 0.15),
        new THREE.Vector3(px + archSpan - 0.28, 3.92, colonnadeZ + 0.12),
      ]);
      const garlandGeo = new THREE.TubeGeometry(garlandCurve, 20, 0.042, 6, false);
      const garlandMesh = new THREE.Mesh(garlandGeo, marigoldOrangeMat);
      templeGroup.add(garlandMesh);

      // Alternating Marigold Flower Blossoms & Mango Leaves along the Garland
      const garlandPoints = garlandCurve.getPoints(10);
      garlandPoints.forEach((pt, gIdx) => {
        const flower = new THREE.Mesh(
          garlandFlowerGeo,
          gIdx % 2 === 0 ? marigoldOrangeMat : marigoldYellowMat
        );
        flower.position.copy(pt);
        templeGroup.add(flower);

        // Hanging Mango Leaves
        if (gIdx > 1 && gIdx < 9 && gIdx % 2 === 1) {
          const mLeaf = new THREE.Mesh(bandhanLeafGeo, leafMat);
          mLeaf.position.set(pt.x, pt.y - 0.22, pt.z);
          templeGroup.add(mLeaf);
        }
      });

      // HANGING BRASS TEMPLE BELL (Ghanta) suspended from arch ceiling
      const bellChainGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.55, 6);
      const bellChain = new THREE.Mesh(bellChainGeo, goldFinialMat);
      bellChain.position.set(archMidX, 3.75, colonnadeZ);
      templeGroup.add(bellChain);

      const bellBodyGeo = new THREE.CylinderGeometry(0.06, 0.14, 0.18, 12);
      const bellBody = new THREE.Mesh(bellBodyGeo, goldFinialMat);
      bellBody.position.set(archMidX, 3.42, colonnadeZ);
      templeGroup.add(bellBody);

      const bellClapper = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), goldFinialMat);
      bellClapper.position.set(archMidX, 3.31, colonnadeZ);
      templeGroup.add(bellClapper);

      // Lower Carved Lattice Screen (Jali Balustrade) on side bays (except center entrance bay!)
      if (Math.abs(archMidX) > 1.2) {
        const jaliGeo = new THREE.BoxGeometry(archSpan - 0.7, 0.85, 0.1);
        const jaliMesh = new THREE.Mesh(jaliGeo, stoneDarkMat);
        jaliMesh.position.set(archMidX, 0.8, colonnadeZ);
        templeGroup.add(jaliMesh);
      }
    }
  }

  // 5. TWIN CORNER CHHATRIS (Octagonal Domed Pavilions)
  [-17.8, 17.8].forEach((cx) => {
    const chhatriGroup = new THREE.Group();
    chhatriGroup.position.set(cx, 0, -12.8);

    // Octagonal base plinth
    const chPlinthGeo = new THREE.CylinderGeometry(2.3, 2.5, 0.7, 8);
    const chPlinth = new THREE.Mesh(chPlinthGeo, stoneMat);
    chPlinth.position.y = 0.35;
    chPlinth.castShadow = true;
    chPlinth.receiveShadow = true;
    chhatriGroup.add(chPlinth);

    // 8 Slender pillars with floral garland collars
    for (let p = 0; p < 8; p++) {
      const angle = (p * Math.PI * 2) / 8;
      const colX = Math.cos(angle) * 1.6;
      const colZ = Math.sin(angle) * 1.6;

      const colGeo = new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8);
      const col = new THREE.Mesh(colGeo, stoneMat);
      col.position.set(colX, 2.3, colZ);
      col.castShadow = true;
      chhatriGroup.add(col);

      // Floral garland ring on each pillar
      const fRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.035, 6, 12),
        marigoldOrangeMat
      );
      fRing.rotateX(Math.PI / 2);
      fRing.position.set(colX, 1.8, colZ);
      chhatriGroup.add(fRing);
    }

    // Octagonal Cornice with draped Marigold Garland
    const chCorniceGeo = new THREE.CylinderGeometry(2.1, 1.8, 0.35, 8);
    const chCornice = new THREE.Mesh(chCorniceGeo, stoneDarkMat);
    chCornice.position.y = 3.95;
    chhatriGroup.add(chCornice);

    const chGarland = new THREE.Mesh(
      new THREE.TorusGeometry(2.12, 0.065, 8, 24),
      marigoldYellowMat
    );
    chGarland.rotateX(Math.PI / 2);
    chGarland.position.y = 3.95;
    chhatriGroup.add(chGarland);

    // Classical Ribbed Cupola Dome with Lotus Base
    const domeGeo = new THREE.SphereGeometry(1.7, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    domeGeo.scale(1, 1.15, 1);
    const dome = new THREE.Mesh(domeGeo, stoneMat);
    dome.position.y = 4.1;
    dome.castShadow = true;
    chhatriGroup.add(dome);

    // Dome Golden Finial (Kalash)
    const finialGeo = new THREE.ConeGeometry(0.24, 0.9, 8);
    const finial = new THREE.Mesh(finialGeo, goldFinialMat);
    finial.position.y = 6.2;
    chhatriGroup.add(finial);

    // Hanging Brass Bell inside Chhatri
    const chBell = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 0.22, 12), goldFinialMat);
    chBell.position.y = 3.4;
    chhatriGroup.add(chBell);

    templeGroup.add(chhatriGroup);
  });

  // 6. COURTYARD DEEPASTAMBHAS (Ceremonial Stone Lamp Towers)
  [-11.2, 11.2].forEach((lx) => {
    const lampTower = new THREE.Group();
    lampTower.position.set(lx, 0, -5.8);

    // Stepped pedestal
    const ped1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 1.6), stoneDarkMat);
    ped1.position.y = 0.225;
    ped1.castShadow = true;
    lampTower.add(ped1);

    const ped2 = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.4, 12), stoneMat);
    ped2.position.y = 0.65;
    lampTower.add(ped2);

    // Tapered column shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.38, 4.4, 12), stoneMat);
    shaft.position.y = 3.0;
    shaft.castShadow = true;
    lampTower.add(shaft);

    // Spiraling Marigold Garland around Deepastambha Shaft
    const deepaHelix: THREE.Vector3[] = [];
    for (let s = 0; s <= 40; s++) {
      const t = s / 40;
      const y = 1.0 + t * 3.8;
      const r = THREE.MathUtils.lerp(0.36, 0.26, t);
      const a = t * 4 * Math.PI * 2;
      deepaHelix.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    const deepaMala = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(deepaHelix), 60, 0.026, 6, false),
      marigoldOrangeMat
    );
    lampTower.add(deepaMala);

    // 4 Tiers of circular lamp brackets holding glowing brass Diyas
    const tierHeights = [1.6, 2.6, 3.6, 4.6];
    const tierRadii = [0.72, 0.58, 0.45, 0.32];

    tierHeights.forEach((th, tIdx) => {
      const tr = tierRadii[tIdx];
      const bracketGeo = new THREE.CylinderGeometry(tr, tr * 0.85, 0.08, 12);
      const bracket = new THREE.Mesh(bracketGeo, stoneDarkMat);
      bracket.position.y = th;
      lampTower.add(bracket);

      // 4 Brass Diyas around the bracket ring
      for (let b = 0; b < 4; b++) {
        const bAngle = (b * Math.PI * 2) / 4;
        const dx = Math.cos(bAngle) * (tr * 0.88);
        const dz = Math.sin(bAngle) * (tr * 0.88);

        // Clay/Brass Diya dish
        const diyaGeo = new THREE.CylinderGeometry(0.07, 0.04, 0.045, 8);
        const diya = new THREE.Mesh(diyaGeo, brassLampMat);
        diya.position.set(dx, th + 0.06, dz);
        lampTower.add(diya);

        // Golden glowing flame
        const flameGeo = new THREE.SphereGeometry(0.032, 6, 6);
        flameGeo.scale(1, 1.6, 1);
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.set(dx, th + 0.11, dz);
        lampTower.add(flame);
      }
    });

    // Crowning golden flame bowl at apex
    const apexBowlGeo = new THREE.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
    const apexBowl = new THREE.Mesh(apexBowlGeo, brassLampMat);
    apexBowl.position.y = 5.25;
    lampTower.add(apexBowl);

    const apexFlameGeo = new THREE.ConeGeometry(0.12, 0.35, 8);
    const apexFlame = new THREE.Mesh(apexFlameGeo, flameMat);
    apexFlame.position.y = 5.48;
    lampTower.add(apexFlame);

    // Warm festive point light illuminating the sandstone
    const diyaLight = new THREE.PointLight(0xffa238, 1.1, 9.5, 1.2);
    diyaLight.position.set(lx, 3.8, -5.8);
    scene.add(diyaLight);

    if (diyaLightsRef) {
      diyaLightsRef.current.push(diyaLight);
    }

    templeGroup.add(lampTower);
  });

  // 7. COURTYARD SIDE BALUSTRADES, URNS & GLOWING DIYAS (X = ±14.5, Z = -13 to +5)
  [-14.5, 14.5].forEach((wx) => {
    const wallGeo = new THREE.BoxGeometry(0.42, 0.8, 17.5);
    const wall = new THREE.Mesh(wallGeo, stoneMat);
    wall.position.set(wx, 0.4, -4.0);
    wall.receiveShadow = true;
    wall.castShadow = true;
    templeGroup.add(wall);

    const copingGeo = new THREE.BoxGeometry(0.55, 0.12, 17.8);
    const coping = new THREE.Mesh(copingGeo, stoneDarkMat);
    coping.position.set(wx, 0.84, -4.0);
    templeGroup.add(coping);

    // Ornamental Stone Pillars, Urns & Glowing Diyas along the wall
    [-12.0, -4.0, 4.0].forEach((pz) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.1, 0.65), stoneMat);
      post.position.set(wx, 0.55, pz);
      post.castShadow = true;
      templeGroup.add(post);

      // Carved Stone Urn (Purna-Kalash)
      const urn = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), stoneDarkMat);
      urn.position.set(wx, 1.26, pz);
      templeGroup.add(urn);

      // Festive Marigold Garland loop around the urn
      const garland = new THREE.Mesh(
        new THREE.TorusGeometry(0.26, 0.045, 6, 16),
        marigoldOrangeMat
      );
      garland.rotateX(Math.PI / 2);
      garland.position.set(wx, 1.22, pz);
      templeGroup.add(garland);

      // Glowing Diya on each balustrade pillar
      const bDiya = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.04, 0.04, 8), brassLampMat);
      bDiya.position.set(wx + (wx < 0 ? 0.35 : -0.35), 0.92, pz);
      templeGroup.add(bDiya);

      const bFlame = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), flameMat);
      bFlame.scale.set(1, 1.7, 1);
      bFlame.position.set(wx + (wx < 0 ? 0.35 : -0.35), 0.97, pz);
      templeGroup.add(bFlame);
    });
  });

  scene.add(templeGroup);
}

// Festive Hanging Garland with Mango Leaves & Dual-Layer Marigolds
function buildFestiveToran(scene: THREE.Scene) {
  const toranGroup = new THREE.Group();
  // Suspension rope sits high across the courtyard, passing exactly through the Handi's suspension ring at world Y = 6.05
  toranGroup.position.set(0, 6.33, 0);

  // Twisted Golden-Jute Rope across the courtyard (world Y = 6.33 - 0.28 = 6.05 at center x = 0)
  const ropePoints: THREE.Vector3[] = [];
  for (let x = -8.5; x <= 8.5; x += 0.5) {
    const sag = Math.cos((x / 8.5) * (Math.PI / 2)) * 0.28;
    ropePoints.push(new THREE.Vector3(x, -sag, 0));
  }
  const ropeCurve = new THREE.CatmullRomCurve3(ropePoints);
  const ropeGeo = new THREE.TubeGeometry(ropeCurve, 64, 0.038, 8, false);
  const ropeMat = new THREE.MeshPhysicalMaterial({
    color: 0xc9943b,
    roughness: 0.75,
    metalness: 0.05,
    clearcoat: 0.1,
  });
  const ropeMesh = new THREE.Mesh(ropeGeo, ropeMat);
  ropeMesh.castShadow = true;
  toranGroup.add(ropeMesh);

  // Fresh Mango leaves with glossy surface
  const leafGeo = new THREE.ConeGeometry(0.13, 0.82, 6);
  leafGeo.rotateZ(Math.PI);
  const leafMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e6a32,
    roughness: 0.25,
    clearcoat: 0.45,
    clearcoatRoughness: 0.2,
    sheen: 0.5,
    sheenColor: new THREE.Color(0x4ade80),
  });

  // Layered Marigold blossoms (Genda Phool)
  const marigoldOrange = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    roughness: 0.5,
    sheen: 0.8,
    sheenColor: new THREE.Color(0xfef08a),
  });
  const marigoldYellow = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15,
    roughness: 0.5,
    sheen: 0.8,
    sheenColor: new THREE.Color(0xffffff),
  });
  const flowerGeo = new THREE.DodecahedronGeometry(0.14, 1);
  flowerGeo.scale(1, 0.75, 1);

  // Distribute festive leaves and marigolds with a clean exclusion zone (|x| >= 1.15)
  // around the suspended Dahi Handi to ensure zero clipping into the pot, butter, or harness ropes!
  for (let i = -7.6; i <= 7.6; i += 0.82) {
    if (Math.abs(i) < 1.15) continue; // Clear zone around Handi

    const sag = Math.cos((i / 8.5) * (Math.PI / 2)) * 0.28;
    const y = -sag;

    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(i, y - 0.42, 0);
    leaf.rotation.z = (Math.random() - 0.5) * 0.22;
    leaf.castShadow = true;
    toranGroup.add(leaf);

    const flower = new THREE.Mesh(flowerGeo, Math.abs(Math.floor(i * 3)) % 2 === 0 ? marigoldOrange : marigoldYellow);
    flower.position.set(i + 0.35, y - 0.06, 0.05);
    flower.castShadow = true;
    toranGroup.add(flower);
  }

  // Decorative ceremonial flanking clusters on either side of the Handi
  [-1.15, 1.15].forEach((fx) => {
    const sag = Math.cos((fx / 8.5) * (Math.PI / 2)) * 0.28;
    const y = -sag;

    // Hanging garland flower
    const clusterFlower = new THREE.Mesh(flowerGeo, marigoldOrange);
    clusterFlower.position.set(fx, y - 0.06, 0.06);
    clusterFlower.castShadow = true;
    toranGroup.add(clusterFlower);

    // Flanking leaf
    const flankLeaf = new THREE.Mesh(leafGeo, leafMat);
    flankLeaf.position.set(fx, y - 0.42, 0);
    flankLeaf.rotation.z = fx < 0 ? -0.18 : 0.18;
    flankLeaf.castShadow = true;
    toranGroup.add(flankLeaf);
  });

  scene.add(toranGroup);
}

// Authentically Colored & Decorated Bamboo Support Poles for Dahi Handi Suspension Rope
function buildDecoratedBambooPoles(
  scene: THREE.Scene,
  templeFlagsRef: React.RefObject<THREE.Mesh[]>
) {
  // Materials
  const sandstoneMat = new THREE.MeshPhysicalMaterial({
    color: 0xedd6be,
    roughness: 0.85,
    metalness: 0.02,
  });

  const bambooMat = new THREE.MeshPhysicalMaterial({
    color: 0xdfab66, // Warm varnished golden bamboo
    roughness: 0.36,
    metalness: 0.04,
    clearcoat: 0.28,
    clearcoatRoughness: 0.25,
  });

  const nodeMat = new THREE.MeshPhysicalMaterial({
    color: 0x78350f, // Dark brown natural node joint
    roughness: 0.6,
  });

  const vermilionMat = new THREE.MeshPhysicalMaterial({
    color: 0xdc2626, // Sacred sindoor red silk ribbon
    roughness: 0.55,
    sheen: 0.8,
    sheenColor: 0xfca5a5,
  });

  const saffronMat = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b, // Saffron yellow festive ribbon
    roughness: 0.55,
    sheen: 0.8,
    sheenColor: 0xfef08a,
  });

  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xfbbf24, // Polished 24K temple brass
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.35,
  });

  const ropeMat = new THREE.MeshPhysicalMaterial({
    color: 0xc9943b,
    roughness: 0.78,
  });

  const marigoldOrange = new THREE.MeshPhysicalMaterial({
    color: 0xea580c,
    roughness: 0.55,
    sheen: 0.8,
    sheenColor: 0xfef08a,
  });

  const marigoldYellow = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15,
    roughness: 0.55,
    sheen: 0.8,
    sheenColor: 0xffffff,
  });

  const leafMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e6a32,
    roughness: 0.25,
    clearcoat: 0.45,
    sheen: 0.5,
    sheenColor: 0x4ade80,
  });

  // Build Left (x = -8.5) and Right (x = +8.5) Decorated Bamboo Poles
  [-8.5, 8.5].forEach((poleX) => {
    const poleGroup = new THREE.Group();
    poleGroup.position.set(poleX, 0, 0);

    // 1. CARVED SANDSTONE PEDESTAL BASE (Grounding firmly into courtyard)
    const basePlinthGeo = new THREE.CylinderGeometry(0.58, 0.68, 0.24, 18);
    const basePlinth = new THREE.Mesh(basePlinthGeo, sandstoneMat);
    basePlinth.position.y = 0.12;
    basePlinth.castShadow = true;
    basePlinth.receiveShadow = true;
    poleGroup.add(basePlinth);

    const midPlinthGeo = new THREE.CylinderGeometry(0.42, 0.50, 0.18, 18);
    const midPlinth = new THREE.Mesh(midPlinthGeo, sandstoneMat);
    midPlinth.position.y = 0.31;
    midPlinth.castShadow = true;
    midPlinth.receiveShadow = true;
    poleGroup.add(midPlinth);

    // Decorative Brass Collar Ring at Base
    const collarGeo = new THREE.TorusGeometry(0.32, 0.032, 8, 24);
    collarGeo.rotateX(Math.PI / 2);
    const collar = new THREE.Mesh(collarGeo, goldMat);
    collar.position.y = 0.40;
    collar.castShadow = true;
    poleGroup.add(collar);

    // Ring of Marigold Blossoms around the plinth footing (Traditional Pooja Garland)
    const baseFlowerGeo = new THREE.DodecahedronGeometry(0.08, 0);
    const numBaseFlowers = 12;
    for (let f = 0; f < numBaseFlowers; f++) {
      const angle = (f / numBaseFlowers) * Math.PI * 2;
      const bFlower = new THREE.Mesh(
        baseFlowerGeo,
        f % 2 === 0 ? marigoldOrange : marigoldYellow
      );
      bFlower.position.set(Math.cos(angle) * 0.52, 0.24, Math.sin(angle) * 0.52);
      bFlower.castShadow = true;
      poleGroup.add(bFlower);
    }

    // 2. MAIN TALL BAMBOO STEM (y = 0.40 to y = 7.30)
    const stemHeight = 6.9;
    const stemGeo = new THREE.CylinderGeometry(0.11, 0.138, stemHeight, 20);
    const stem = new THREE.Mesh(stemGeo, bambooMat);
    stem.position.y = 0.40 + stemHeight / 2;
    stem.castShadow = true;
    stem.receiveShadow = true;
    poleGroup.add(stem);

    // Bamboo Nodes (Ring Joints spaced every ~0.65m)
    const nodeRingGeo = new THREE.TorusGeometry(0.126, 0.016, 8, 20);
    nodeRingGeo.rotateX(Math.PI / 2);
    const brassTrimGeo = new THREE.TorusGeometry(0.124, 0.008, 6, 20);
    brassTrimGeo.rotateX(Math.PI / 2);

    for (let ny = 0.95; ny <= 6.8; ny += 0.65) {
      const node = new THREE.Mesh(nodeRingGeo, nodeMat);
      node.position.y = ny;
      poleGroup.add(node);

      // Delicate brass rim ring on alternating nodes
      if (Math.round(ny * 2) % 2 === 0) {
        const brassRim = new THREE.Mesh(brassTrimGeo, goldMat);
        brassRim.position.y = ny + 0.018;
        poleGroup.add(brassRim);
      }
    }

    // 3. COLORFUL SPIRALING FESTIVE RIBBON WRAPPINGS (Vermilion & Saffron)
    const helix1: THREE.Vector3[] = [];
    const helix2: THREE.Vector3[] = [];
    const turns = 7;
    const steps = 70;
    const yStart = 0.45;
    const yEnd = 6.33;

    for (let s = 0; s <= steps; s++) {
      const pct = s / steps;
      const y = yStart + pct * (yEnd - yStart);
      const r = THREE.MathUtils.lerp(0.136, 0.114, pct);
      const angle = pct * turns * Math.PI * 2;
      helix1.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
      helix2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * r, y, Math.sin(angle + Math.PI) * r));
    }

    const ribbon1Curve = new THREE.CatmullRomCurve3(helix1);
    const ribbon1Geo = new THREE.TubeGeometry(ribbon1Curve, 100, 0.024, 6, false);
    const ribbon1 = new THREE.Mesh(ribbon1Geo, vermilionMat);
    ribbon1.castShadow = true;
    poleGroup.add(ribbon1);

    const ribbon2Curve = new THREE.CatmullRomCurve3(helix2);
    const ribbon2Geo = new THREE.TubeGeometry(ribbon2Curve, 100, 0.024, 6, false);
    const ribbon2 = new THREE.Mesh(ribbon2Geo, saffronMat);
    ribbon2.castShadow = true;
    poleGroup.add(ribbon2);

    // Spiraling Marigold Flower Garland wrapping up the pole
    const garlandFlowerGeo = new THREE.DodecahedronGeometry(0.068, 0);
    for (let s = 2; s < steps; s += 3) {
      const pt = helix1[s];
      const gFlower = new THREE.Mesh(
        garlandFlowerGeo,
        s % 6 === 2 ? marigoldOrange : marigoldYellow
      );
      gFlower.position.copy(pt);
      gFlower.castShadow = true;
      poleGroup.add(gFlower);
    }

    // 4. ROPE SUSPENSION JOINT AT y = 6.33 (Where the horizontal toran rope connects)
    const jointY = 6.33;

    // Forged Brass Mounting Bracket / Pulley Collar
    const bracketGeo = new THREE.CylinderGeometry(0.145, 0.145, 0.34, 16);
    const bracket = new THREE.Mesh(bracketGeo, goldMat);
    bracket.position.y = jointY;
    bracket.castShadow = true;
    poleGroup.add(bracket);

    // Pulley Wheel through which rope passes
    const wheelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheel = new THREE.Mesh(wheelGeo, goldMat);
    wheel.position.set(poleX < 0 ? 0.14 : -0.14, jointY, 0);
    poleGroup.add(wheel);

    // Tied Jute Rope Coils binding horizontal rope firmly to bamboo
    const ropeCoilGeo = new THREE.TorusGeometry(0.155, 0.022, 8, 20);
    ropeCoilGeo.rotateX(Math.PI / 2);
    for (let c = -2; c <= 2; c++) {
      const rCoil = new THREE.Mesh(ropeCoilGeo, ropeMat);
      rCoil.position.y = jointY + c * 0.045;
      poleGroup.add(rCoil);
    }

    // Hanging Mango Leaves and Marigold Cluster beneath the rope joint
    const hangLeafGeo = new THREE.ConeGeometry(0.09, 0.48, 6);
    hangLeafGeo.rotateZ(Math.PI);
    for (let h = 0; h < 3; h++) {
      const hAngle = (h / 3) * Math.PI * 2;
      const hLeaf = new THREE.Mesh(hangLeafGeo, leafMat);
      hLeaf.position.set(Math.sin(hAngle) * 0.18, jointY - 0.28, Math.cos(hAngle) * 0.18);
      poleGroup.add(hLeaf);

      const hFlower = new THREE.Mesh(garlandFlowerGeo, h % 2 === 0 ? marigoldOrange : marigoldYellow);
      hFlower.position.set(Math.sin(hAngle) * 0.18, jointY - 0.08, Math.cos(hAngle) * 0.18);
      poleGroup.add(hFlower);
    }

    // 5. DIAGONAL GUY-ROPE TENSION ANCHOR (High-tensile ground bracing)
    const anchorOffset = poleX < 0 ? -2.2 : 2.2;
    const anchorZ = poleX < 0 ? -0.8 : 0.8;
    const anchorWorld = new THREE.Vector3(anchorOffset, 0, anchorZ);

    const guyRopePts = [
      new THREE.Vector3(0, jointY, 0),
      new THREE.Vector3(anchorOffset * 0.35, jointY * 0.65, anchorZ * 0.35),
      new THREE.Vector3(anchorOffset * 0.72, jointY * 0.30, anchorZ * 0.72),
      anchorWorld,
    ];
    const guyCurve = new THREE.CatmullRomCurve3(guyRopePts);
    const guyGeo = new THREE.TubeGeometry(guyCurve, 24, 0.024, 6, false);
    const guyMesh = new THREE.Mesh(guyGeo, ropeMat);
    guyMesh.castShadow = true;
    poleGroup.add(guyMesh);

    // Carved Sandstone Mooring Bollard & Brass Ring on courtyard floor
    const bollardGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.32, 12);
    const bollard = new THREE.Mesh(bollardGeo, sandstoneMat);
    bollard.position.copy(anchorWorld);
    bollard.position.y = 0.16;
    bollard.castShadow = true;
    poleGroup.add(bollard);

    const anchorRingGeo = new THREE.TorusGeometry(0.065, 0.016, 6, 16);
    const anchorRing = new THREE.Mesh(anchorRingGeo, goldMat);
    anchorRing.position.copy(anchorWorld);
    anchorRing.position.y = 0.34;
    poleGroup.add(anchorRing);

    // 6. TOP GOLDEN FINIAL (KALASH) & FLUTTERING TEMPLE FLAG (y = 6.8 to 8.2)
    const kalashGroup = new THREE.Group();
    kalashGroup.position.y = 7.30;
    poleGroup.add(kalashGroup);

    // Golden Kalash Brass Pot
    const kalashBase = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), goldMat);
    kalashBase.position.y = 0.14;
    kalashBase.castShadow = true;
    kalashGroup.add(kalashBase);

    // Flared Neck & Spire
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.10, 0.10, 16);
    const neck = new THREE.Mesh(neckGeo, goldMat);
    neck.position.y = 0.28;
    kalashGroup.add(neck);

    // Golden Spire Pinnacle Cone
    const spireGeo = new THREE.ConeGeometry(0.075, 0.38, 12);
    const spire = new THREE.Mesh(spireGeo, goldMat);
    spire.position.y = 0.50;
    spire.castShadow = true;
    kalashGroup.add(spire);

    // Sacred Coconut & Mango Leaves at Kalash Crown
    const coconutGeo = new THREE.SphereGeometry(0.09, 10, 10);
    const coconutMat = new THREE.MeshPhysicalMaterial({ color: 0x5a2d0c, roughness: 0.8 });
    const coconut = new THREE.Mesh(coconutGeo, coconutMat);
    coconut.position.y = 0.33;
    kalashGroup.add(coconut);

    // Flag Mast extension
    const mastGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.95, 8);
    const mast = new THREE.Mesh(mastGeo, goldMat);
    mast.position.y = 0.72;
    kalashGroup.add(mast);

    // Auspicious Triangular Temple Flag (Dhwaja)
    const flagGeo = new THREE.BufferGeometry();
    const flagWidth = poleX < 0 ? -0.85 : 0.85; // Point inward towards center
    const vertices = new Float32Array([
      0, 0.95, 0,
      flagWidth, 0.72, 0,
      0, 0.48, 0,
    ]);
    flagGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    flagGeo.computeVertexNormals();

    const flagMat = new THREE.MeshPhysicalMaterial({
      color: poleX < 0 ? 0xf97316 : 0xdc2626, // Saffron on left, vermilion on right
      side: THREE.DoubleSide,
      roughness: 0.6,
      sheen: 0.7,
      sheenColor: 0xfef08a,
    });
    const flagMesh = new THREE.Mesh(flagGeo, flagMat);
    flagMesh.castShadow = true;
    kalashGroup.add(flagMesh);

    // Register flag in templeFlagsRef so it flutters dynamically in the render loop breeze!
    templeFlagsRef.current.push(flagMesh);

    scene.add(poleGroup);
  });
}

// Suspended Dahi Handi with Jute Netting, Terracotta PBR, and Luscious Butter
function buildDahiHandi(
  scene: THREE.Scene,
  handiGroupRef: React.RefObject<THREE.Group | null>,
  potMeshRef: React.RefObject<THREE.Mesh | null>,
  butterTopRef: React.RefObject<THREE.Mesh | null>
) {
  const handiGroup = new THREE.Group();
  handiGroup.position.set(0, 4.8, 0);
  handiGroupRef.current = handiGroup;

  // 1. Hanging Joint: Threaded Suspension Ring & Heavy Tied Rope Coil Knot
  // The horizontal suspension rope passes at world Y = 6.05, which is local Y = 1.25 (4.80 + 1.25 = 6.05)
  const ringMat = new THREE.MeshPhysicalMaterial({
    color: 0xd97706, // Antique forged bronze / brass
    metalness: 0.85,
    roughness: 0.24,
    clearcoat: 0.35,
  });

  const ropeMat = new THREE.MeshPhysicalMaterial({
    color: 0x9a3412,
    roughness: 0.8,
    sheen: 0.5,
  });

  // Top Suspension Ring: Rotated around Y so its opening aligns with X, through which the horizontal rope threads perfectly!
  const topRingGeo = new THREE.TorusGeometry(0.12, 0.024, 12, 28);
  topRingGeo.rotateY(Math.PI / 2);
  const topRing = new THREE.Mesh(topRingGeo, ringMat);
  topRing.position.set(0, 1.25, 0);
  topRing.castShadow = true;
  handiGroup.add(topRing);

  // Woven Jute Coil Knot: Tight rope bindings wrapped around the horizontal suspension rope inside and over the ring
  const knotCoilGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.16, 16);
  knotCoilGeo.rotateZ(Math.PI / 2); // Aligned along the horizontal rope (X-axis)
  const knotCoil = new THREE.Mesh(knotCoilGeo, ropeMat);
  knotCoil.position.set(0, 1.25, 0);
  knotCoil.castShadow = true;
  handiGroup.add(knotCoil);

  // Top Tied Loop Knot securing the ring to the horizontal rope
  const tieLoopGeo = new THREE.TorusGeometry(0.056, 0.018, 8, 16);
  const tieLoop = new THREE.Mesh(tieLoopGeo, ropeMat);
  tieLoop.position.set(0, 1.34, 0);
  handiGroup.add(tieLoop);

  // 2. Hanging 3-Point Jute Harness Ropes (Chhikka / छींका)
  // Originates cleanly from the bottom of the suspension ring (y = 1.14) down to the pot neck band (y = 0.42)
  for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / 3) {
    const sx = Math.sin(angle) * 0.38;
    const sz = Math.cos(angle) * 0.38;
    const strPoints = [
      new THREE.Vector3(0, 1.14, 0), // Bottom of suspension ring
      new THREE.Vector3(sx * 0.72, 0.78, sz * 0.72), // Inward taper
      new THREE.Vector3(sx, 0.42, sz), // Pot neck band connection
      new THREE.Vector3(sx * 1.22, 0.02, sz * 1.22), // Belly contour
      new THREE.Vector3(0, -0.62, 0), // Bottom cradle meeting point
    ];
    const strCurve = new THREE.CatmullRomCurve3(strPoints);
    const strGeo = new THREE.TubeGeometry(strCurve, 32, 0.016, 6, false);
    const strMesh = new THREE.Mesh(strGeo, ropeMat);
    strMesh.castShadow = true;
    handiGroup.add(strMesh);

    // Decorative tied knot at neck attachment point
    const neckKnot = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), ropeMat);
    neckKnot.position.set(sx, 0.42, sz);
    handiGroup.add(neckKnot);

    // Small Golden Bell (Ghungroo) hanging at the harness knot
    const bellGeo = new THREE.SphereGeometry(0.028, 10, 8);
    const bellMat = new THREE.MeshPhysicalMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.18 });
    const bell = new THREE.Mesh(bellGeo, bellMat);
    bell.position.set(sx * 1.08, 0.38, sz * 1.08);
    handiGroup.add(bell);
  }

  // Bottom Tied Cradle Knot underneath the pot base
  const bottomKnotGeo = new THREE.SphereGeometry(0.055, 10, 8);
  const bottomKnot = new THREE.Mesh(bottomKnotGeo, ropeMat);
  bottomKnot.position.set(0, -0.62, 0);
  handiGroup.add(bottomKnot);

  // 2. Terracotta Matki (Revolved Lathe Geometry with Authentic Curvature)
  const potPoints: THREE.Vector2[] = [];
  potPoints.push(new THREE.Vector2(0.001, -0.60));
  potPoints.push(new THREE.Vector2(0.26, -0.58));
  potPoints.push(new THREE.Vector2(0.52, -0.30));
  potPoints.push(new THREE.Vector2(0.58, 0.04));
  potPoints.push(new THREE.Vector2(0.50, 0.32));
  potPoints.push(new THREE.Vector2(0.34, 0.42)); // Neck constriction
  potPoints.push(new THREE.Vector2(0.40, 0.52)); // Flared lip
  potPoints.push(new THREE.Vector2(0.35, 0.54));
  potPoints.push(new THREE.Vector2(0.001, 0.52));

  const potGeo = new THREE.LatheGeometry(potPoints, 48);

  const { map: potMap, bump: potBump } = createMatkiTexture();
  const potMat = new THREE.MeshPhysicalMaterial({
    map: potMap,
    bumpMap: potBump,
    bumpScale: 0.04,
    roughness: 0.52,
    metalness: 0.04,
    clearcoat: 0.12,
    clearcoatRoughness: 0.4,
  });

  const potMesh = new THREE.Mesh(potGeo, potMat);
  potMesh.castShadow = true;
  potMesh.receiveShadow = true;
  potMeshRef.current = potMesh;
  handiGroup.add(potMesh);

  // 3. Jute Rope Band wrapped around the pot neck
  const neckRopeGeo = new THREE.TorusGeometry(0.35, 0.024, 8, 36);
  neckRopeGeo.rotateX(Math.PI / 2);
  const neckRope = new THREE.Mesh(neckRopeGeo, ropeMat);
  neckRope.position.y = 0.42;
  handiGroup.add(neckRope);

  // 4. Luscious Translucent Creamy Butter / Makhan
  const butterGeo = new THREE.SphereGeometry(0.34, 32, 24);
  butterGeo.scale(1.02, 0.58, 1.02);

  const butterMat = new THREE.MeshPhysicalMaterial({
    color: 0xfffef5,
    roughness: 0.12,
    transmission: 0.32,
    ior: 1.44,
    thickness: 0.9,
    clearcoat: 0.35,
    clearcoatRoughness: 0.15,
  });

  const butterTop = new THREE.Mesh(butterGeo, butterMat);
  butterTop.position.set(0, 0.48, 0);
  butterTop.castShadow = true;
  butterTopRef.current = butterTop;
  handiGroup.add(butterTop);

  // Butter Dripping Icicles / Droplets over the lip
  for (let d = 0; d < 6; d++) {
    const angle = (d * Math.PI * 2) / 6 + 0.25;
    const len = 0.18 + Math.random() * 0.14;
    const dripGeo = new THREE.ConeGeometry(0.04, len, 10);
    dripGeo.rotateZ(Math.PI);
    const drip = new THREE.Mesh(dripGeo, butterMat);
    drip.position.set(Math.sin(angle) * 0.37, 0.36 - len / 2, Math.cos(angle) * 0.37);
    handiGroup.add(drip);
  }

  scene.add(handiGroup);
}

// ----------------------------------------------------------------------
// ARTICULATED 3D CHIBI GOPALA RIG WITH BLENDER-GRADE PHYSICAL SHADERS
// ----------------------------------------------------------------------
function createArticulatedGopala(data: {
  id: string;
  name: string;
  skinColor: number;
  dhotiColor: number;
  isKrishna?: boolean;
  isDrummer?: boolean;
}): GopalaRig {
  const root = new THREE.Group();

  // Root Squash & Stretch node for impact and landing dynamics
  const squashGroup = new THREE.Group();
  root.add(squashGroup);

  // Blender-Grade Subsurface Clay/Vinyl Skin Material
  const skinMat = new THREE.MeshPhysicalMaterial({
    color: data.skinColor,
    roughness: 0.32,
    metalness: 0.0,
    clearcoat: 0.15,
    clearcoatRoughness: 0.3,
    sheen: 0.85,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color(0xffedd5),
  });

  // Dhoti Silk Fabric Material
  const dhotiMat = new THREE.MeshPhysicalMaterial({
    color: data.dhotiColor,
    roughness: 0.72,
    sheen: 1.0,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color(data.dhotiColor).offsetHSL(0, 0, 0.12),
  });

  // Polished 24K Gold Ornament Material
  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xfbbf24,
    metalness: 0.94,
    roughness: 0.16,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
  });

  // 1. Pelvis / Hip Center
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.54;
  squashGroup.add(pelvis);

  // Dhoti Waist & Folds
  const dhotiWaistGeo = new THREE.CylinderGeometry(0.24, 0.27, 0.24, 24);
  const dhotiWaist = new THREE.Mesh(dhotiWaistGeo, dhotiMat);
  dhotiWaist.position.y = 0.02;
  dhotiWaist.castShadow = true;
  pelvis.add(dhotiWaist);

  // Golden Waistband (Kamarbandh / Kardhani)
  const beltGeo = new THREE.TorusGeometry(0.265, 0.022, 10, 32);
  beltGeo.rotateX(Math.PI / 2);
  const belt = new THREE.Mesh(beltGeo, goldMat);
  belt.position.y = 0.11;
  pelvis.add(belt);

  // Front pleated drape with gold zari edge
  const pleatGeo = new THREE.BoxGeometry(0.13, 0.32, 0.07);
  const pleat = new THREE.Mesh(pleatGeo, dhotiMat);
  pleat.position.set(0, -0.06, 0.25);
  pelvis.add(pleat);

  const zariGeo = new THREE.BoxGeometry(0.13, 0.025, 0.075);
  const zari = new THREE.Mesh(zariGeo, goldMat);
  zari.position.set(0, -0.21, 0.25);
  pelvis.add(zari);

  // 2. Torso / Spine
  const torso = new THREE.Group();
  torso.position.y = 0.13;
  pelvis.add(torso);

  // Sculpted Chibi Chest with subtle round belly
  const chestGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.42, 24);
  chestGeo.scale(1.06, 1, 0.94);
  const chestMesh = new THREE.Mesh(chestGeo, skinMat);
  chestMesh.position.y = 0.21;
  chestMesh.castShadow = true;
  torso.add(chestMesh);

  // Angavastram (Festive Sash draped over shoulder)
  const sashCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25, 0.38, 0.05),
    new THREE.Vector3(-0.15, 0.26, 0.22),
    new THREE.Vector3(0.12, 0.12, 0.22),
    new THREE.Vector3(0.24, -0.02, 0.05),
  ]);
  const sashGeo = new THREE.TubeGeometry(sashCurve, 20, 0.042, 8, false);
  const sashMesh = new THREE.Mesh(sashGeo, dhotiMat);
  torso.add(sashMesh);

  // Pearl Necklace with Ruby Pendant
  const necklaceGeo = new THREE.TorusGeometry(0.17, 0.016, 8, 24);
  necklaceGeo.rotateX(Math.PI / 2.2);
  const necklace = new THREE.Mesh(necklaceGeo, goldMat);
  necklace.position.set(0, 0.35, 0.08);
  torso.add(necklace);

  // 3. Neck & Head
  const neck = new THREE.Group();
  neck.position.y = 0.42;
  torso.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.y = 0.36;
  neck.add(headGroup);

  // Cute Sculpted Chibi Head (Sphere with subtle cheek pinch)
  const headGeo = new THREE.SphereGeometry(0.38, 36, 32);
  headGeo.scale(1.05, 1.0, 1.02);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Soft Rosy Cheeks (Blender Blush effect)
  const cheekGeo = new THREE.SphereGeometry(0.08, 12, 12);
  cheekGeo.scale(1.2, 0.8, 0.3);
  const cheekMat = new THREE.MeshPhysicalMaterial({
    color: 0xf43f5e,
    roughness: 0.5,
    transmission: 0.2,
    transparent: true,
    opacity: 0.45,
  });
  const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
  cheekL.position.set(-0.26, -0.05, 0.28);
  headGroup.add(cheekL);

  const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
  cheekR.position.set(0.26, -0.05, 0.28);
  headGroup.add(cheekR);

  // Ears with Gold Kundal Earrings
  const earGeo = new THREE.SphereGeometry(0.085, 14, 12);
  earGeo.scale(0.55, 1.1, 0.85);

  const earL = new THREE.Mesh(earGeo, skinMat);
  earL.position.set(-0.38, 0.01, 0);
  headGroup.add(earL);

  const earRingGeo = new THREE.TorusGeometry(0.048, 0.014, 8, 16);
  const earRingL = new THREE.Mesh(earRingGeo, goldMat);
  earRingL.position.set(0, -0.06, 0);
  earL.add(earRingL);

  const earR = new THREE.Mesh(earGeo, skinMat);
  earR.position.set(0.38, 0.01, 0);
  headGroup.add(earR);

  const earRingR = new THREE.Mesh(earRingGeo, goldMat);
  earRingR.position.set(0, -0.06, 0);
  earR.add(earRingR);

  // 4. Expressive Anime/Chibi Eyes with Specular Cornea Reflections
  const scleraGeo = new THREE.SphereGeometry(0.09, 20, 20);
  scleraGeo.scale(0.85, 1.18, 0.45);
  const scleraMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.08,
    clearcoat: 0.5,
  });

  const pupilGeo = new THREE.SphereGeometry(0.05, 16, 16);
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

  // Main Key Light Sparkle & Secondary Fill Sparkle
  const sparkle1 = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  sparkle1.position.set(0.018, 0.018, 0.042);

  const sparkle2 = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  sparkle2.position.set(-0.018, -0.016, 0.042);

  // Left Eye
  const eyeL = new THREE.Mesh(scleraGeo, scleraMat);
  eyeL.position.set(-0.14, 0.05, 0.33);
  const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
  pupilL.position.set(0, 0, 0.045);
  pupilL.add(sparkle1.clone());
  pupilL.add(sparkle2.clone());
  eyeL.add(pupilL);
  headGroup.add(eyeL);

  // Right Eye
  const eyeR = new THREE.Mesh(scleraGeo, scleraMat);
  eyeR.position.set(0.14, 0.05, 0.33);
  const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
  pupilR.position.set(0, 0, 0.045);
  pupilR.add(sparkle1.clone());
  pupilR.add(sparkle2.clone());
  eyeR.add(pupilR);
  headGroup.add(eyeR);

  // Animated Eyebrows
  const browGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.13, 8);
  browGeo.rotateZ(Math.PI / 2);
  const browMat = new THREE.MeshBasicMaterial({ color: 0x3e2410 });

  const browL = new THREE.Mesh(browGeo, browMat);
  browL.position.set(-0.14, 0.18, 0.34);
  browL.rotation.z = -0.15;
  headGroup.add(browL);

  const browR = new THREE.Mesh(browGeo, browMat);
  browR.position.set(0.14, 0.18, 0.34);
  browR.rotation.z = 0.15;
  headGroup.add(browR);

  // Cute Button Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), skinMat);
  nose.position.set(0, -0.03, 0.38);
  headGroup.add(nose);

  // Expressive 3D Mouth with Tongue
  const mouthGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.045, 20, 1, false, 0, Math.PI);
  mouthGeo.rotateX(Math.PI / 2);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x6e1a1a });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, -0.15, 0.35);

  const tongueGeo = new THREE.SphereGeometry(0.045, 10, 10);
  const tongueMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const tongue = new THREE.Mesh(tongueGeo, tongueMat);
  tongue.position.set(0, -0.02, 0.02);
  mouth.add(tongue);
  headGroup.add(mouth);

  // Sacred Tilak on Forehead
  const tilakU = new THREE.Mesh(
    new THREE.TorusGeometry(0.038, 0.009, 6, 16, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  tilakU.rotation.z = Math.PI;
  tilakU.position.set(0, 0.17, 0.37);
  headGroup.add(tilakU);

  const tilakDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xdc2626 })
  );
  tilakDot.position.set(0, 0.17, 0.38);
  headGroup.add(tilakDot);

  // 5. Special Features: Krishna's Peacock Feather & Stick / Drummer's Dholak
  let peacockFeather: THREE.Group | undefined;
  let stick: THREE.Mesh | undefined;

  if (data.isKrishna) {
    // Hair Bun (Choti)
    const hairMat = new THREE.MeshPhysicalMaterial({ color: 0x1c1917, roughness: 0.45 });
    const bunGeo = new THREE.SphereGeometry(0.16, 20, 18);
    bunGeo.scale(1, 1.25, 0.9);
    const bun = new THREE.Mesh(bunGeo, hairMat);
    bun.position.set(0.05, 0.40, -0.08);
    headGroup.add(bun);

    // Gold Crown / Tiara
    const tiaraGeo = new THREE.TorusGeometry(0.37, 0.028, 8, 32);
    tiaraGeo.rotateX(Math.PI / 2.2);
    const tiara = new THREE.Mesh(tiaraGeo, goldMat);
    tiara.position.set(0, 0.14, 0.02);
    headGroup.add(tiara);

    // Multi-Layered Peacock Feather (Mor Pankh) with Spring Inertia Rig
    peacockFeather = new THREE.Group();
    peacockFeather.position.set(0.12, 0.45, -0.05);

    const quillGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.52, 8);
    const quillMat = new THREE.MeshPhysicalMaterial({ color: 0x166534, roughness: 0.35 });
    const quill = new THREE.Mesh(quillGeo, quillMat);
    quill.position.set(0, 0.22, 0);
    quill.rotation.z = -0.28;
    peacockFeather.add(quill);

    // Layer 1: Outer Emerald Barbules
    const outerEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 12),
      new THREE.MeshPhysicalMaterial({ color: 0x0284c7, roughness: 0.25, sheen: 0.9, sheenColor: new THREE.Color(0x38bdf8) })
    );
    outerEye.scale.set(0.75, 1.25, 0.2);
    outerEye.position.set(-0.06, 0.36, 0);
    peacockFeather.add(outerEye);

    // Layer 2: Middle Peacock Blue
    const midEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 14, 12),
      new THREE.MeshBasicMaterial({ color: 0x15803d })
    );
    midEye.position.set(-0.06, 0.36, 0.02);
    peacockFeather.add(midEye);

    // Layer 3: Inner Gold Radiant Center
    const innerEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    innerEye.position.set(-0.06, 0.36, 0.038);
    peacockFeather.add(innerEye);

    headGroup.add(peacockFeather);

    // Butter Breaking Golden Stick (Lathi / Flute)
    const stickGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.92, 12);
    stick = new THREE.Mesh(stickGeo, goldMat);
    stick.rotation.x = Math.PI / 2;
    stick.position.set(0, -0.05, 0.28);
    stick.castShadow = true;
  }

  // 6. Articulated Arms (Smooth Capsule Geometry + 3D Hand)
  const upperArmGeo = new THREE.CapsuleGeometry(0.065, 0.16, 12, 16);
  upperArmGeo.translate(0, -0.12, 0);

  const forearmGeo = new THREE.CapsuleGeometry(0.058, 0.14, 12, 16);
  forearmGeo.translate(0, -0.11, 0);

  const kadaGeo = new THREE.TorusGeometry(0.062, 0.016, 8, 16);
  kadaGeo.rotateX(Math.PI / 2);

  // Helper for Cute 3D Hand (Palm + Thumb + Fingers)
  const createCuteHand = (): THREE.Group => {
    const hGroup = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), skinMat);
    palm.scale.set(1, 1.1, 0.7);
    hGroup.add(palm);

    // Thumb
    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.024, 0.05, 8, 8), skinMat);
    thumb.position.set(0.045, 0.01, 0.02);
    thumb.rotation.z = -0.5;
    hGroup.add(thumb);

    // Gold Bangle (Kada)
    const kada = new THREE.Mesh(kadaGeo, goldMat);
    kada.position.set(0, 0.04, 0);
    hGroup.add(kada);

    return hGroup;
  };

  // Left Arm
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-0.26, 0.32, 0);
  const leftUpperArm = new THREE.Mesh(upperArmGeo, skinMat);
  leftUpperArm.castShadow = true;
  leftShoulder.add(leftUpperArm);

  const leftElbow = new THREE.Group();
  leftElbow.position.set(0, -0.22, 0);
  const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
  leftForearm.castShadow = true;
  leftElbow.add(leftForearm);

  const leftHand = createCuteHand();
  leftHand.position.set(0, -0.22, 0);
  leftElbow.add(leftHand);

  leftShoulder.add(leftElbow);
  torso.add(leftShoulder);

  // Right Arm
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(0.26, 0.32, 0);
  const rightUpperArm = new THREE.Mesh(upperArmGeo, skinMat);
  rightUpperArm.castShadow = true;
  rightShoulder.add(rightUpperArm);

  const rightElbow = new THREE.Group();
  rightElbow.position.set(0, -0.22, 0);
  const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
  rightForearm.castShadow = true;
  rightElbow.add(rightForearm);

  const rightHand = createCuteHand();
  rightHand.position.set(0, -0.22, 0);

  if (stick) {
    rightHand.add(stick);
  }

  rightElbow.add(rightHand);
  rightShoulder.add(rightElbow);
  torso.add(rightShoulder);

  // 7. Articulated Legs (Capsule Geometry + Rounded Feet)
  const thighGeo = new THREE.CapsuleGeometry(0.078, 0.16, 12, 16);
  thighGeo.translate(0, -0.13, 0);

  const calfGeo = new THREE.CapsuleGeometry(0.068, 0.15, 12, 16);
  calfGeo.translate(0, -0.12, 0);

  const footGeo = new THREE.SphereGeometry(0.088, 12, 10);
  footGeo.scale(0.85, 0.6, 1.45);
  footGeo.translate(0, -0.04, 0.05);

  // Left Leg
  const leftHip = new THREE.Group();
  leftHip.position.set(-0.14, -0.05, 0);
  const leftThigh = new THREE.Mesh(thighGeo, skinMat);
  leftThigh.castShadow = true;
  leftHip.add(leftThigh);

  const leftKnee = new THREE.Group();
  leftKnee.position.set(0, -0.25, 0);
  const leftCalf = new THREE.Mesh(calfGeo, skinMat);
  leftCalf.castShadow = true;
  leftKnee.add(leftCalf);

  const leftFoot = new THREE.Mesh(footGeo, skinMat);
  leftFoot.position.set(0, -0.24, 0);
  leftFoot.castShadow = true;
  leftKnee.add(leftFoot);

  leftHip.add(leftKnee);
  pelvis.add(leftHip);

  // Right Leg
  const rightHip = new THREE.Group();
  rightHip.position.set(0.14, -0.05, 0);
  const rightThigh = new THREE.Mesh(thighGeo, skinMat);
  rightThigh.castShadow = true;
  rightHip.add(rightThigh);

  const rightKnee = new THREE.Group();
  rightKnee.position.set(0, -0.25, 0);
  const rightCalf = new THREE.Mesh(calfGeo, skinMat);
  rightCalf.castShadow = true;
  rightKnee.add(rightCalf);

  const rightFoot = new THREE.Mesh(footGeo, skinMat);
  rightFoot.position.set(0, -0.24, 0);
  rightFoot.castShadow = true;
  rightKnee.add(rightFoot);

  rightHip.add(rightKnee);
  pelvis.add(rightHip);

  // 8. Authentic Dholak Drum for Drummer
  let dholak: THREE.Group | undefined;
  if (data.isDrummer) {
    dholak = new THREE.Group();

    // Wooden Barrel with rich Sheesham Rosewood finish
    const drumGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.58, 24);
    drumGeo.rotateZ(Math.PI / 2);
    const drumMat = new THREE.MeshPhysicalMaterial({
      color: 0x6b2e12,
      roughness: 0.42,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
    });
    const drumMesh = new THREE.Mesh(drumGeo, drumMat);
    drumMesh.castShadow = true;
    dholak.add(drumMesh);

    // Leather Heads with Black Tuning Syahi
    const faceGeo = new THREE.CircleGeometry(0.19, 24);
    const faceMat = new THREE.MeshPhysicalMaterial({ color: 0xfef3c7, roughness: 0.65 });
    const syahiGeo = new THREE.CircleGeometry(0.075, 16);
    const syahiMat = new THREE.MeshBasicMaterial({ color: 0x1f2937 });

    // Left Bass Head (Bayan)
    const faceL = new THREE.Mesh(faceGeo, faceMat);
    faceL.position.set(-0.292, 0, 0);
    faceL.rotation.y = -Math.PI / 2;
    const syahiL = new THREE.Mesh(syahiGeo, syahiMat);
    syahiL.position.set(0, 0, 0.005);
    faceL.add(syahiL);
    dholak.add(faceL);

    // Right Treble Head (Dayan)
    const faceR = new THREE.Mesh(faceGeo, faceMat);
    faceR.position.set(0.292, 0, 0);
    faceR.rotation.y = Math.PI / 2;
    const syahiR = new THREE.Mesh(syahiGeo, syahiMat);
    syahiR.position.set(0, 0, 0.005);
    faceR.add(syahiR);
    dholak.add(faceR);

    // Red Neck Hanging Strap
    const strapCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 0, 0),
      new THREE.Vector3(-0.12, 0.38, -0.22),
      new THREE.Vector3(0.12, 0.38, -0.22),
      new THREE.Vector3(0.2, 0, 0),
    ]);
    const strapGeo = new THREE.TubeGeometry(strapCurve, 20, 0.016, 6, false);
    const strapMat = new THREE.MeshPhysicalMaterial({ color: 0xd97706, roughness: 0.6 });
    const strap = new THREE.Mesh(strapGeo, strapMat);
    dholak.add(strap);

    dholak.position.set(0, 0.24, 0.34);
    torso.add(dholak);
  }

  // Invisible Hit Mesh for Fast, Accurate Raycasting
  const hitGeo = new THREE.CylinderGeometry(0.48, 0.48, 1.6, 10);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  hitMesh.position.set(0, 0.8, 0);
  root.add(hitMesh);

  return {
    id: data.id,
    name: data.name,
    color: data.skinColor,
    isKrishna: data.isKrishna,
    isDrummer: data.isDrummer,
    root,
    squashGroup,
    pelvis,
    torso,
    chestMesh,
    neck,
    headGroup,
    headMesh,
    mouth,
    tongue,
    eyeL,
    eyeR,
    pupilL,
    pupilR,
    browL,
    browR,
    leftShoulder,
    leftElbow,
    leftHand,
    rightShoulder,
    rightElbow,
    rightHand,
    leftHip,
    leftKnee,
    leftFoot,
    rightHip,
    rightKnee,
    rightFoot,
    stick,
    dholak,
    peacockFeather,
    featherVelocity: 0,
    featherAngle: 0,
    dholakSwingAngle: 0,
    dholakSwingVel: 0,
    hitMesh,
    cheerBounce: 0,
  };
}

// Instantiate the 6 Gopalas
function buildGopalas(scene: THREE.Scene, gopalasRef: React.RefObject<GopalaRig[]>) {
  const charactersConfig = [
    { id: 'yellow', name: 'Gopala Saffron', skinColor: 0xf59e0b, dhotiColor: 0xea580c },
    { id: 'green', name: 'Gopala Harit', skinColor: 0x22c55e, dhotiColor: 0xf97316 },
    { id: 'red', name: 'Gopala Veeru', skinColor: 0xef4444, dhotiColor: 0xfacc15 },
    { id: 'amber', name: 'Gopala Keshava', skinColor: 0xf59e0b, dhotiColor: 0xd97706 },
    { id: 'purple', name: 'Gopala Dholak', skinColor: 0xa855f7, dhotiColor: 0xfbbf24, isDrummer: true },
    { id: 'blue', name: 'Bal Gopal', skinColor: 0x38bdf8, dhotiColor: 0xfef08a, isKrishna: true },
  ];

  const rigs: GopalaRig[] = [];
  charactersConfig.forEach((cfg) => {
    const rig = createArticulatedGopala(cfg);
    rig.root.position.set(16, 0, 0); // Start offstage
    scene.add(rig.root);
    rigs.push(rig);
  });

  gopalasRef.current = rigs;
}

// Build 36 Terracotta Ceramic Shards with Thickness & 50 Curd Droplets
function buildPotShatterPhysics(
  scene: THREE.Scene,
  shardsDataRef: React.RefObject<ShardData[]>,
  curdDataRef: React.RefObject<CurdData[]>
) {
  // 1. Terracotta Ceramic Shards with Convex Facets
  const shardList: ShardData[] = [];
  const shardMat = new THREE.MeshPhysicalMaterial({
    color: 0xc2410c,
    roughness: 0.55,
    metalness: 0.05,
    clearcoat: 0.1,
  });

  for (let i = 0; i < 36; i++) {
    const size = 0.09 + Math.random() * 0.12;
    const geo = new THREE.DodecahedronGeometry(size, 0);
    geo.scale(1.0, 0.45 + Math.random() * 0.5, 1.0);
    const mesh = new THREE.Mesh(geo, shardMat);
    mesh.visible = false;
    mesh.castShadow = true;
    scene.add(mesh);

    shardList.push({
      mesh,
      velocity: new THREE.Vector3(),
      rotVelocity: new THREE.Vector3(),
    });
  }
  shardsDataRef.current = shardList;

  // 2. Curd / Butter Droplets with Translucent Milk Shader
  const curdList: CurdData[] = [];
  const curdGeo = new THREE.SphereGeometry(0.085, 12, 10);
  const curdMat = new THREE.MeshPhysicalMaterial({
    color: 0xfffef5,
    roughness: 0.14,
    transmission: 0.28,
    ior: 1.4,
    thickness: 0.8,
  });

  for (let i = 0; i < 52; i++) {
    const mesh = new THREE.Mesh(curdGeo, curdMat);
    mesh.visible = false;
    mesh.castShadow = true;
    scene.add(mesh);

    curdList.push({
      mesh,
      velocity: new THREE.Vector3(),
      initialScale: 0.55 + Math.random() * 0.9,
    });
  }
  curdDataRef.current = curdList;
}

// Build 3D Marigold & Rose Petals Fluttering Shower
function buildPetalsShower(scene: THREE.Scene, petalsDataRef: React.RefObject<PetalData[]>) {
  const petals: PetalData[] = [];

  const petalMatOrange = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    roughness: 0.45,
    side: THREE.DoubleSide,
    sheen: 0.7,
  });
  const petalMatRed = new THREE.MeshPhysicalMaterial({
    color: 0xef4444,
    roughness: 0.45,
    side: THREE.DoubleSide,
    sheen: 0.7,
  });
  const petalMatYellow = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15,
    roughness: 0.45,
    side: THREE.DoubleSide,
    sheen: 0.7,
  });

  const materials = [petalMatOrange, petalMatRed, petalMatYellow];

  // Curved Petal Geometry
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0);
  petalShape.quadraticCurveTo(0.06, 0.08, 0, 0.16);
  petalShape.quadraticCurveTo(-0.06, 0.08, 0, 0);

  const petalGeo = new THREE.ShapeGeometry(petalShape);
  petalGeo.scale(1.2, 1.2, 1.2);

  for (let i = 0; i < 180; i++) {
    const mat = materials[i % materials.length];
    const mesh = new THREE.Mesh(petalGeo, mat);
    mesh.visible = false;
    scene.add(mesh);

    petals.push({
      mesh,
      velocity: new THREE.Vector3(),
      rotVelocity: new THREE.Vector3(),
      swaySeed: Math.random() * Math.PI * 2,
    });
  }

  petalsDataRef.current = petals;
}

// ----------------------------------------------------------------------
// ANIMATION HELPERS (Blender Disney 12 Principles)
// ----------------------------------------------------------------------

function resetPose(rig: GopalaRig) {
  rig.squashGroup.scale.set(1, 1, 1);
  rig.pelvis.position.set(0, 0.54, 0);
  rig.pelvis.rotation.set(0, 0, 0);
  rig.torso.rotation.set(0, 0, 0);
  rig.neck.rotation.set(0, 0, 0);
  rig.headGroup.rotation.set(0, 0, 0);
  rig.mouth.scale.set(1, 1, 1);

  rig.leftShoulder.rotation.set(0, 0, 0);
  rig.leftElbow.rotation.set(0, 0, 0);
  rig.rightShoulder.rotation.set(0, 0, 0);
  rig.rightElbow.rotation.set(0, 0, 0);

  rig.leftHip.rotation.set(0, 0, 0);
  rig.leftKnee.rotation.set(0, 0, 0);
  rig.leftFoot.rotation.set(0, 0, 0);

  rig.rightHip.rotation.set(0, 0, 0);
  rig.rightKnee.rotation.set(0, 0, 0);
  rig.rightFoot.rotation.set(0, 0, 0);
}

// Natural Bipedal Running Kinematics with Weight Shift, Pelvis Bounce, and Arm Counter-Swings
function applyRunningKinematics(rig: GopalaRig, runCycle: number, forwardAngle: number) {
  rig.root.rotation.y = forwardAngle;
  rig.torso.rotation.x = 0.2; // Confident athletic forward lean

  // Pelvis bounces with each footfall (double frequency)
  const bounce = Math.abs(Math.sin(runCycle));
  rig.pelvis.position.y = 0.54 + bounce * 0.1;

  // Hip Sway from side to side
  rig.pelvis.rotation.z = Math.sin(runCycle) * 0.08;

  // Alternating Leg Stride
  const legSwing = Math.sin(runCycle);
  rig.leftHip.rotation.x = legSwing * 0.8;
  rig.leftKnee.rotation.x = Math.max(0, -legSwing * 1.25); // Leg curls backward naturally

  rig.rightHip.rotation.x = -legSwing * 0.8;
  rig.rightKnee.rotation.x = Math.max(0, legSwing * 1.25);

  // Counter-swinging Arms with bent elbows
  rig.leftShoulder.rotation.x = -legSwing * 0.85;
  rig.leftShoulder.rotation.z = 0.28;
  rig.leftElbow.rotation.x = 1.0; // 90-degree bent elbow

  rig.rightShoulder.rotation.x = legSwing * 0.85;
  rig.rightShoulder.rotation.z = -0.28;
  rig.rightElbow.rotation.x = 1.0;

  // Cheerful open mouth
  rig.mouth.scale.set(1.4, 1.4, 1);
  rig.headGroup.rotation.x = -0.06;
}

// ----------------------------------------------------------------------
// INTERACTIVE COURTYARD SPECTATORS & 3D CHEERING POP-UPS
// ----------------------------------------------------------------------

// Procedural Canvas Texture Cache for 3D Floating Speech Bubbles
const cheerTextureCache = new Map<string, THREE.CanvasTexture>();

function getCheerTexture(text: string): THREE.CanvasTexture {
  if (cheerTextureCache.has(text)) {
    return cheerTextureCache.get(text)!;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 160);

  // Soft radiant festive shadow
  ctx.shadowColor = 'rgba(234, 88, 12, 0.4)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  // Background rounded speech bubble
  const x = 20, y = 14, w = 472, h = 104, r = 28;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();

  // Pointer tail pointing down towards the crowd member's head
  ctx.beginPath();
  ctx.moveTo(256 - 18, y + h);
  ctx.lineTo(256, y + h + 24);
  ctx.lineTo(256 + 18, y + h);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Reset shadow for crisp border and sharp typography
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Saffron to Vermilion gradient border
  const borderGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  borderGrad.addColorStop(0, '#f59e0b');
  borderGrad.addColorStop(0.5, '#ef4444');
  borderGrad.addColorStop(1, '#f59e0b');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.stroke();

  // Pointer border
  ctx.beginPath();
  ctx.moveTo(256 - 18, y + h - 1);
  ctx.lineTo(256, y + h + 24);
  ctx.lineTo(256 + 18, y + h - 1);
  ctx.stroke();

  // Overwrite seam inside pointer
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(256 - 15, y + h - 3, 30, 5);

  // Corner decorative golden marigold dots
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(x + 16, y + 16, 4, 0, Math.PI * 2);
  ctx.arc(x + w - 16, y + 16, 4, 0, Math.PI * 2);
  ctx.fill();

  // Vibrant high-contrast festive typography
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#831843'; // Deep rich royal vermilion/maroon
  ctx.font = 'bold 36px "Segoe UI", system-ui, -apple-system, sans-serif';
  ctx.fillText(text, 256, y + h * 0.5);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  cheerTextureCache.set(text, texture);
  return texture;
}

// Spawn 3D Floating Speech Bubble & Sparkling Marigold Petal Burst
function spawnCheerPopup(
  scene: THREE.Scene,
  headWorldPos: THREE.Vector3,
  chantText: string,
  popupsRef: React.RefObject<ActiveCheeringPopup[]>
) {
  const texture = getCheerTexture(chantText);
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    opacity: 1,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.2, 0.08, 1); // Starts small, pops out with elastic ease
  sprite.position.copy(headWorldPos);
  sprite.position.y += 0.85;
  scene.add(sprite);

  // 8 Radiant Festive Gold & Marigold Sparkle Petals
  const sparkles: { mesh: THREE.Mesh; velocity: THREE.Vector3; rotVel: THREE.Vector3 }[] = [];
  const sparkleColors = [0xfacc15, 0xf59e0b, 0xef4444, 0xf43f5e];
  const sparkleGeo = new THREE.DodecahedronGeometry(0.048, 0);

  for (let i = 0; i < 8; i++) {
    const sMat = new THREE.MeshBasicMaterial({
      color: sparkleColors[i % sparkleColors.length],
      transparent: true,
      opacity: 0.95,
      depthTest: false,
    });
    const sMesh = new THREE.Mesh(sparkleGeo, sMat);
    sMesh.position.copy(headWorldPos);
    sMesh.position.y += 0.5 + Math.random() * 0.25;
    scene.add(sMesh);

    const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
    const speed = 1.6 + Math.random() * 1.6;
    sparkles.push({
      mesh: sMesh,
      velocity: new THREE.Vector3(
        Math.cos(angle) * speed,
        2.2 + Math.random() * 1.8,
        Math.sin(angle) * speed
      ),
      rotVel: new THREE.Vector3(
        Math.random() * 8,
        Math.random() * 8,
        Math.random() * 8
      ),
    });
  }

  popupsRef.current.push({
    sprite,
    createdAt: performance.now() / 1000,
    initialY: sprite.position.y,
    maxLife: 2.1,
    sparkles,
  });

  festiveAudio.playCheerPop();
}

interface SpectatorConfig {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  color: number;
  hasTurban?: boolean;
  isWavingFlag?: boolean;
  hasCymbals?: boolean;
}

// Create an Articulated Chibi Courtyard Spectator
function createArticulatedSpectator(cfg: SpectatorConfig): SpectatorRig {
  const root = new THREE.Group();
  root.position.set(cfg.x, cfg.y, cfg.z);
  root.rotation.y = cfg.rotY;

  const squashGroup = new THREE.Group();
  root.add(squashGroup);

  // Materials
  const skinMat = new THREE.MeshPhysicalMaterial({
    color: 0xfbd0a2,
    roughness: 0.55,
    metalness: 0.02,
    clearcoat: 0.1,
  });
  const attireMat = new THREE.MeshPhysicalMaterial({
    color: cfg.color,
    roughness: 0.65,
    sheen: 0.5,
    sheenColor: 0xffedd5,
  });
  const whiteMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.6 });
  const goldMat = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 });
  const hairMat = new THREE.MeshPhysicalMaterial({ color: 0x18181b, roughness: 0.4 });

  // 1. Torso / Kurta
  const torso = new THREE.Group();
  torso.position.y = 0.58;
  squashGroup.add(torso);

  const kurtaGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.58, 16);
  const kurtaMesh = new THREE.Mesh(kurtaGeo, attireMat);
  kurtaMesh.castShadow = true;
  torso.add(kurtaMesh);

  // Lower Dhoti / Skirt
  const lowerGeo = new THREE.CylinderGeometry(0.31, 0.36, 0.46, 16);
  const lowerMesh = new THREE.Mesh(lowerGeo, whiteMat);
  lowerMesh.position.y = -0.38;
  lowerMesh.castShadow = true;
  torso.add(lowerMesh);

  // Gold Necklace
  const neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 6, 16), goldMat);
  neckRing.rotation.x = Math.PI / 2.2;
  neckRing.position.set(0, 0.26, 0.08);
  torso.add(neckRing);

  // 2. Head Group
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.48;
  torso.add(headGroup);

  // Chibi Head
  const headGeo = new THREE.SphereGeometry(0.32, 24, 20);
  headGeo.scale(1.05, 1.0, 1.02);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Rosy Cheeks
  const cheekMat = new THREE.MeshPhysicalMaterial({
    color: 0xf43f5e,
    roughness: 0.5,
    transparent: true,
    opacity: 0.45,
  });
  const cheekGeo = new THREE.SphereGeometry(0.065, 10, 10);
  cheekGeo.scale(1.2, 0.8, 0.3);
  const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
  cheekL.position.set(-0.21, -0.04, 0.25);
  headGroup.add(cheekL);

  const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
  cheekR.position.set(0.21, -0.04, 0.25);
  headGroup.add(cheekR);

  // Eyes
  const scleraGeo = new THREE.SphereGeometry(0.075, 14, 14);
  scleraGeo.scale(0.85, 1.15, 0.45);
  const scleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilGeo = new THREE.SphereGeometry(0.042, 12, 12);
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  sparkle.position.set(0.014, 0.014, 0.035);

  const eyeL = new THREE.Mesh(scleraGeo, scleraMat);
  eyeL.position.set(-0.12, 0.04, 0.28);
  const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
  pupilL.position.set(0, 0, 0.038);
  pupilL.add(sparkle.clone());
  eyeL.add(pupilL);
  headGroup.add(eyeL);

  const eyeR = new THREE.Mesh(scleraGeo, scleraMat);
  eyeR.position.set(0.12, 0.04, 0.28);
  const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
  pupilR.position.set(0, 0, 0.038);
  pupilR.add(sparkle.clone());
  eyeR.add(pupilR);
  headGroup.add(eyeR);

  // Hair or Festive Pagri Turban
  if (cfg.hasTurban) {
    const turbanGeo = new THREE.TorusGeometry(0.28, 0.12, 10, 20);
    turbanGeo.rotateX(Math.PI / 2.4);
    const turbanMat = new THREE.MeshPhysicalMaterial({ color: 0xe11d48, roughness: 0.65 });
    const turban = new THREE.Mesh(turbanGeo, turbanMat);
    turban.position.set(0, 0.16, 0);
    headGroup.add(turban);

    const crestGeo = new THREE.ConeGeometry(0.12, 0.24, 8);
    crestGeo.rotateZ(0.2);
    const crest = new THREE.Mesh(crestGeo, turbanMat);
    crest.position.set(-0.12, 0.34, 0.12);
    headGroup.add(crest);
  } else {
    // Glossy hair topknot / bob
    const hairGeo = new THREE.SphereGeometry(0.33, 16, 16);
    hairGeo.scale(1.02, 1.0, 0.95);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.06, -0.04);
    headGroup.add(hairMesh);

    // Topknot bun
    const bunGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const bun = new THREE.Mesh(bunGeo, hairMat);
    bun.position.set(0, 0.32, -0.08);
    headGroup.add(bun);
  }

  // 3. Articulated Arms
  const armGeo = new THREE.CapsuleGeometry(0.06, 0.24, 8, 10);
  const handGeo = new THREE.SphereGeometry(0.07, 8, 8);

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.28, 0.22, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
  leftArmMesh.position.set(0, -0.12, 0);
  leftArm.add(leftArmMesh);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.set(0, -0.24, 0);
  leftArm.add(leftHand);
  torso.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.28, 0.22, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
  rightArmMesh.position.set(0, -0.12, 0);
  rightArm.add(rightArmMesh);
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.set(0, -0.24, 0);
  rightArm.add(rightHand);
  torso.add(rightArm);

  // Flag or Cymbals props
  if (cfg.isWavingFlag) {
    const poleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.95, 6);
    const pole = new THREE.Mesh(poleGeo, goldMat);
    pole.position.set(0, 0.25, 0);
    rightHand.add(pole);

    const flagGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0.15, 0,
      0.45, 0.35, 0,
      0, 0.55, 0,
    ]);
    flagGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    flagGeo.computeVertexNormals();
    const flagMat = new THREE.MeshPhysicalMaterial({ color: 0xf97316, side: THREE.DoubleSide });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    pole.add(flag);
  } else if (cfg.hasCymbals) {
    const cymbalGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.012, 12);
    cymbalGeo.rotateX(Math.PI / 2);
    const cymbalL = new THREE.Mesh(cymbalGeo, goldMat);
    leftHand.add(cymbalL);
    const cymbalR = new THREE.Mesh(cymbalGeo, goldMat);
    rightHand.add(cymbalR);
  }

  // 4. Invisible Hit Mesh for Fast, Accurate Raycasting
  const hitGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.65, 10);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  hitMesh.position.set(0, 0.8, 0);
  root.add(hitMesh);

  return {
    id: cfg.id,
    name: cfg.name,
    root,
    squashGroup,
    headGroup,
    torso,
    leftArm,
    rightArm,
    hitMesh,
    baseRotY: cfg.rotY,
    clapOffset: Math.random() * Math.PI * 2,
    cheerBounce: 0,
    isWavingFlag: cfg.isWavingFlag,
    hasCymbals: cfg.hasCymbals,
  };
}

// Build Vibrant Courtyard Crowd Spectators along Left/Right Balustrades and Mandapa Terrace
function buildCourtyardCrowd(
  scene: THREE.Scene,
  spectatorsRef: React.RefObject<SpectatorRig[]>,
  hitMeshesRef: React.RefObject<THREE.Mesh[]>
) {
  const configs: SpectatorConfig[] = [
    // Left Balustrade Spectators (Facing Center Dias)
    { id: 'radhika', name: 'Radhika', x: -10.8, y: 0, z: -5.5, rotY: 1.15, color: 0xec4899, isWavingFlag: true },
    { id: 'madhav', name: 'Madhav', x: -11.5, y: 0, z: -2.2, rotY: 1.35, color: 0xeab308, hasTurban: true },
    { id: 'ananya', name: 'Ananya', x: -11.0, y: 0, z: 0.8, rotY: 1.55, color: 0x06b6d4, hasCymbals: true },
    { id: 'gopal', name: 'Gopal', x: -11.6, y: 0, z: 3.8, rotY: 1.75, color: 0xf97316, hasTurban: true },

    // Right Balustrade Spectators (Facing Center Dias)
    { id: 'devaki', name: 'Devaki', x: 10.8, y: 0, z: -5.5, rotY: -1.15, color: 0x10b981, hasCymbals: true },
    { id: 'rohan', name: 'Rohan', x: 11.5, y: 0, z: -2.2, rotY: -1.35, color: 0x2563eb, hasTurban: true, isWavingFlag: true },
    { id: 'meera', name: 'Meera', x: 11.0, y: 0, z: 0.8, rotY: -1.55, color: 0xf43f5e },
    { id: 'vasudev', name: 'Vasudev', x: 11.6, y: 0, z: 3.8, rotY: -1.75, color: 0x9333ea, hasTurban: true },

    // Rear Temple Mandapa Terrace Spectators (Raised Plinth y = 0.5)
    { id: 'kavita', name: 'Kavita', x: -6.8, y: 0.5, z: -11.5, rotY: 0.42, color: 0xf59e0b, isWavingFlag: true },
    { id: 'balaram', name: 'Balaram', x: -2.2, y: 0.5, z: -12.2, rotY: 0.12, color: 0x4f46e5, hasTurban: true },
    { id: 'pooja', name: 'Pooja', x: 2.2, y: 0.5, z: -12.2, rotY: -0.12, color: 0xdb2777, hasCymbals: true },
    { id: 'chintu', name: 'Chintu', x: 6.8, y: 0.5, z: -11.5, rotY: -0.42, color: 0x16a34a, isWavingFlag: true },
  ];

  const list: SpectatorRig[] = [];
  configs.forEach((cfg) => {
    const spec = createArticulatedSpectator(cfg);
    scene.add(spec.root);
    list.push(spec);

    // Tag hitMesh with metadata
    spec.hitMesh.userData = { type: 'spectator', target: spec };
    hitMeshesRef.current.push(spec.hitMesh);
  });

  spectatorsRef.current = list;
}

// ----------------------------------------------------------------------
// MAIN REACT COMPONENT
// ----------------------------------------------------------------------

export const JanmashtamiCanvas: React.FC<JanmashtamiCanvasProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const gopalasRef = useRef<GopalaRig[]>([]);
  const handiGroupRef = useRef<THREE.Group | null>(null);
  const potMeshRef = useRef<THREE.Mesh | null>(null);
  const butterTopRef = useRef<THREE.Mesh | null>(null);

  const shardsDataRef = useRef<ShardData[]>([]);
  const curdDataRef = useRef<CurdData[]>([]);
  const petalsDataRef = useRef<PetalData[]>([]);
  const templeFlagsRef = useRef<THREE.Mesh[]>([]);
  const diyaLightsRef = useRef<THREE.PointLight[]>([]);
  const spectatorsRef = useRef<SpectatorRig[]>([]);
  const popupsRef = useRef<ActiveCheeringPopup[]>([]);
  const allHitMeshesRef = useRef<THREE.Mesh[]>([]);

  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  const potBrokenTriggeredRef = useRef(false);
  const cameraShakeRef = useRef(0);

  // Mouse orbit controls
  const isDraggingRef = useRef(false);
  const userInteractedRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const orbitAnglesRef = useRef({ theta: 0, phi: 0.16, radius: 10.2 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. SCENE SETUP (Warm studio cyclorama & ambient mist)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfaf6);
    scene.fog = new THREE.FogExp2(0xfcfaf6, 0.012);
    sceneRef.current = scene;

    // 2. CAMERA SETUP (Cinematic 38° FOV - Classic Portrait Prime Lens)
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 80);
    camera.position.set(0, 2.8, 10.2);
    cameraRef.current = camera;

    // 3. BLENDER-GRADE RENDERER WITH ACES FILMIC TONE MAPPING
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Ultra-soft contact shadows
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. MULTI-LIGHT BLENDER STUDIO RIG
    // (A) Soft Warm Ambient Light
    const ambientLight = new THREE.AmbientLight(0xfff6ea, 0.9);
    scene.add(ambientLight);

    // (B) Main Key Sun Light (Warm 4200K Softbox)
    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    keyLight.position.set(7, 14, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 32;
    keyLight.shadow.camera.left = -9;
    keyLight.shadow.camera.right = 9;
    keyLight.shadow.camera.top = 9;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.radius = 3.5; // Smooth soft shadow penumbra
    keyLight.shadow.bias = -0.0003;
    scene.add(keyLight);

    // (C) Cool Sky Fill Light (Lifts harsh shadows from opposite side)
    const fillLight = new THREE.DirectionalLight(0xcfe7fc, 0.75);
    fillLight.position.set(-8, 6, -4);
    scene.add(fillLight);

    // (D) Warm Golden Backlight / Rim Light (Highlights character edges & pot contour)
    const rimLight = new THREE.DirectionalLight(0xfbbf24, 1.4);
    rimLight.position.set(0, 8, -9);
    scene.add(rimLight);

    // (E) Floor Radiosity Bounce Simulation (Warm floor bounce on chins & dhotis)
    const floorBounce = new THREE.DirectionalLight(0xffedd5, 0.45);
    floorBounce.position.set(0, -3, 3);
    scene.add(floorBounce);

    // 5. GROUND / TEMPLE COURTYARD WITH SUBTLE STONE PATTERN & CEREMONIAL RANGOLI DAIS
    const groundGeo = new THREE.PlaneGeometry(75, 75);
    groundGeo.rotateX(-Math.PI / 2);

    const { map: stoneMap, bump: stoneBump } = createStonePaverTexture();
    const groundMat = new THREE.MeshPhysicalMaterial({
      map: stoneMap,
      bumpMap: stoneBump,
      bumpScale: 0.035,
      roughness: 0.82,
      metalness: 0.02,
      clearcoat: 0.03,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    scene.add(ground);

    // Central Ceremonial Rangoli Dais
    const daisGeo = new THREE.CylinderGeometry(4.6, 4.7, 0.035, 64);
    const { map: daisMap, bump: daisBump } = createRangoliDaisTexture();
    const daisMat = new THREE.MeshPhysicalMaterial({
      map: daisMap,
      bumpMap: daisBump,
      bumpScale: 0.02,
      roughness: 0.72,
      metalness: 0.03,
      clearcoat: 0.06,
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.set(0, 0.018, 0);
    dais.receiveShadow = true;
    scene.add(dais);

    // Dais Beveled Sandstone Edge Trim Ring
    const daisTrimGeo = new THREE.TorusGeometry(4.65, 0.038, 8, 48);
    daisTrimGeo.rotateX(Math.PI / 2);
    const daisTrimMat = new THREE.MeshPhysicalMaterial({
      color: 0xedd6be,
      roughness: 0.8,
      metalness: 0.04,
    });
    const daisTrim = new THREE.Mesh(daisTrimGeo, daisTrimMat);
    daisTrim.position.set(0, 0.025, 0);
    scene.add(daisTrim);

    // 6. BUILD SCENE OBJECTS, TEMPLE BACKDROP & COURTYARD CROWD
    buildTempleBackdrop(scene, templeFlagsRef, diyaLightsRef);
    buildFestiveToran(scene);
    buildDecoratedBambooPoles(scene, templeFlagsRef);
    buildDahiHandi(scene, handiGroupRef, potMeshRef, butterTopRef);
    buildGopalas(scene, gopalasRef);

    // Register Gopala hitboxes for cheering interaction
    allHitMeshesRef.current = [];
    gopalasRef.current.forEach((g) => {
      g.hitMesh.userData = { type: 'gopala', target: g };
      allHitMeshesRef.current.push(g.hitMesh);
    });

    // Build Perimeter Courtyard Spectators
    buildCourtyardCrowd(scene, spectatorsRef, allHitMeshesRef);

    buildPotShatterPhysics(scene, shardsDataRef, curdDataRef);
    buildPetalsShower(scene, petalsDataRef);

    // 7. MOUSE, TOUCH & 3D INTERACTIVE CHEERING CONTROLS
    const raycaster = new THREE.Raycaster();
    let dragDist = 0;

    const handleCrowdClick = (clientX: number, clientY: number) => {
      const rect = dom.getBoundingClientRect();
      const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const hits = raycaster.intersectObjects(allHitMeshesRef.current, false);
      if (hits.length > 0) {
        const hitData = hits[0].object.userData;
        if (hitData.type === 'spectator') {
          const spec = hitData.target as SpectatorRig;
          const headPos = new THREE.Vector3();
          spec.headGroup.getWorldPosition(headPos);
          const chant = SPECTATOR_CHEERS[Math.floor(Math.random() * SPECTATOR_CHEERS.length)];
          spawnCheerPopup(scene, headPos, chant, popupsRef);
          spec.cheerBounce = 1.0;
        } else if (hitData.type === 'gopala') {
          const g = hitData.target as GopalaRig;
          const headPos = new THREE.Vector3();
          g.headGroup.getWorldPosition(headPos);
          let chant = '';
          if (g.isKrishna) {
            chant = KRISHNA_CHEERS[Math.floor(Math.random() * KRISHNA_CHEERS.length)];
          } else if (g.isDrummer) {
            chant = DRUMMER_CHEERS[Math.floor(Math.random() * DRUMMER_CHEERS.length)];
          } else {
            chant = CLIMBER_CHEERS[Math.floor(Math.random() * CLIMBER_CHEERS.length)];
          }
          spawnCheerPopup(scene, headPos, chant, popupsRef);
          g.cheerBounce = 1.0;
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      userInteractedRef.current = true;
      dragDist = 0;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      if (isDraggingRef.current) {
        dragDist += Math.hypot(dx, dy);
        orbitAnglesRef.current.theta -= dx * 0.0055;
        orbitAnglesRef.current.phi = Math.max(
          0.05,
          Math.min(Math.PI / 2.25, orbitAnglesRef.current.phi + dy * 0.0045)
        );
        dom.style.cursor = 'grabbing';
      } else {
        // Hover pointer cursor when over interactive crowd member
        const rect = dom.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
        const hits = raycaster.intersectObjects(allHitMeshesRef.current, false);
        if (hits.length > 0) {
          dom.style.cursor = 'pointer';
        } else {
          dom.style.cursor = 'grab';
        }
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      dom.style.cursor = 'grab';
      // Register intentional click when drag distance is small
      if (dragDist < 6) {
        handleCrowdClick(e.clientX, e.clientY);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      userInteractedRef.current = true;
      orbitAnglesRef.current.radius = Math.max(
        5.2,
        Math.min(16.0, orbitAnglesRef.current.radius + e.deltaY * 0.005)
      );
    };

    // Mobile touch interaction
    let touchMoved = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        userInteractedRef.current = true;
        touchMoved = 0;
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouseRef.current.x;
      const dy = e.touches[0].clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchMoved += Math.hypot(dx, dy);

      orbitAnglesRef.current.theta -= dx * 0.006;
      orbitAnglesRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI / 2.25, orbitAnglesRef.current.phi + dy * 0.005)
      );
    };

    const onTouchEnd = (e: TouchEvent) => {
      isDraggingRef.current = false;
      if (touchMoved < 8 && e.changedTouches.length > 0) {
        handleCrowdClick(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    // 8. RESIZE OBSERVER
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // 9. ANIMATION & RENDER LOOP
    let animId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const { currentTime, onPotBroken } = propsRef.current;
      const t = currentTime;

      // 1. Natural Wind Sway on Dahi Handi & Temple Saffron Flags
      if (handiGroupRef.current) {
        const sway = Math.sin(elapsed * 1.5) * 0.038;
        handiGroupRef.current.rotation.z = sway;
        handiGroupRef.current.rotation.x = Math.cos(elapsed * 1.1) * 0.022;
      }

      // Temple Pennants / Flags breeze flutter
      templeFlagsRef.current.forEach((flag, idx) => {
        flag.rotation.y = Math.sin(elapsed * 2.2 + idx * 1.5) * 0.16;
        flag.rotation.z = Math.cos(elapsed * 1.6 + idx * 1.1) * 0.07;
      });

      // Subtle Sacred Diya Flame Flicker on Temple Deepastambhas
      diyaLightsRef.current.forEach((light, idx) => {
        light.intensity = 0.85 + Math.sin(elapsed * 7.5 + idx * 2.3) * 0.14;
      });

      // 2. Check for Pot Smash / Rewind Reset
      if (t < 14.3) {
        potBrokenTriggeredRef.current = false;
        if (potMeshRef.current) potMeshRef.current.visible = true;
        if (butterTopRef.current) butterTopRef.current.visible = true;

        shardsDataRef.current.forEach((s) => (s.mesh.visible = false));
        curdDataRef.current.forEach((c) => (c.mesh.visible = false));
        petalsDataRef.current.forEach((p) => (p.mesh.visible = false));
      }

      // Pot Strike Climax at t = 14.4s
      if (t >= 14.4 && !potBrokenTriggeredRef.current) {
        potBrokenTriggeredRef.current = true;
        cameraShakeRef.current = 1.0; // Trigger micro-shake on impact

        if (potMeshRef.current) potMeshRef.current.visible = false;
        if (butterTopRef.current) butterTopRef.current.visible = false;

        // Play festive audio
        festiveAudio.playPotBreakSound();
        festiveAudio.playCheerSound();

        // Initialize Terracotta Ceramic Shards with High-Velocity Explosive Trajectories
        shardsDataRef.current.forEach((shard) => {
          shard.mesh.visible = true;
          shard.mesh.position.set(0, 4.8, 0);

          const angle = Math.random() * Math.PI * 2;
          const upAngle = (Math.random() - 0.25) * Math.PI * 0.55;
          const speed = 2.8 + Math.random() * 5.0;

          shard.velocity.set(
            Math.cos(angle) * Math.cos(upAngle) * speed,
            Math.sin(upAngle) * speed + 1.5,
            Math.sin(angle) * Math.cos(upAngle) * speed
          );

          shard.rotVelocity.set(
            (Math.random() - 0.5) * 14,
            (Math.random() - 0.5) * 14,
            (Math.random() - 0.5) * 14
          );
        });

        // Initialize Curd / Butter Splatter Droplets
        curdDataRef.current.forEach((curd) => {
          curd.mesh.visible = true;
          curd.mesh.position.set(
            (Math.random() - 0.5) * 0.35,
            4.8 + Math.random() * 0.25,
            (Math.random() - 0.5) * 0.35
          );
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.2 + Math.random() * 4.2;

          curd.velocity.set(
            Math.cos(angle) * speed,
            Math.random() * 3.0 - 0.6,
            Math.sin(angle) * speed
          );
        });

        // Initialize Marigold and Rose Petals
        petalsDataRef.current.forEach((petal) => {
          petal.mesh.visible = true;
          petal.mesh.position.set(
            (Math.random() - 0.5) * 6,
            5.2 + Math.random() * 3,
            (Math.random() - 0.5) * 5
          );
          petal.velocity.set(
            (Math.random() - 0.5) * 1.5,
            -0.8 - Math.random() * 1.2,
            (Math.random() - 0.5) * 1.5
          );
          petal.rotVelocity.set(
            Math.random() * 4,
            Math.random() * 4,
            Math.random() * 4
          );
        });

        if (onPotBroken) onPotBroken();
      }

      // Physics Simulation on Shatter Shards & Splatter
      if (t >= 14.4) {
        const dt = Math.min(delta, 0.04);

        // Ceramic Shards
        shardsDataRef.current.forEach((shard) => {
          if (!shard.mesh.visible) return;
          shard.velocity.y -= 10.5 * dt; // Gravity
          shard.mesh.position.addScaledVector(shard.velocity, dt);
          shard.mesh.rotation.x += shard.rotVelocity.x * dt;
          shard.mesh.rotation.y += shard.rotVelocity.y * dt;

          // Ground bounce & friction
          if (shard.mesh.position.y < 0.05) {
            shard.mesh.position.y = 0.05;
            shard.velocity.y = -shard.velocity.y * 0.32;
            shard.velocity.x *= 0.65;
            shard.velocity.z *= 0.65;
          }
        });

        // Curd / Butter
        curdDataRef.current.forEach((curd) => {
          if (!curd.mesh.visible) return;
          curd.velocity.y -= 8.0 * dt;
          curd.mesh.position.addScaledVector(curd.velocity, dt);

          // Flatten into creamy butter pool on ground
          if (curd.mesh.position.y < 0.035) {
            curd.mesh.position.y = 0.035;
            curd.velocity.set(0, 0, 0);
            curd.mesh.scale.set(curd.initialScale * 1.8, 0.08, curd.initialScale * 1.8);
          }
        });

        // Petals Fluttering with Aerodynamic Turbulence
        petalsDataRef.current.forEach((p) => {
          if (!p.mesh.visible) return;
          p.mesh.position.addScaledVector(p.velocity, dt);
          p.mesh.rotation.x += p.rotVelocity.x * dt;
          p.mesh.rotation.y += p.rotVelocity.y * dt;
          p.mesh.position.x += Math.sin(elapsed * 3 + p.swaySeed) * dt * 0.35;

          if (p.mesh.position.y < 0.02) {
            p.mesh.position.y = 0.02;
            p.velocity.set(0, 0, 0);
            p.rotVelocity.set(0, 0, 0);
            p.mesh.rotation.x = Math.PI / 2;
          }
        });
      }

      // 3. ACTIVE 3D CHEERING POP-UPS & CELEBRATION SPARKLES
      const nowSec = performance.now() / 1000;
      const popups = popupsRef.current;
      for (let i = popups.length - 1; i >= 0; i--) {
        const popup = popups[i];
        const age = nowSec - popup.createdAt;

        if (age >= popup.maxLife) {
          scene.remove(popup.sprite);
          popup.sprite.material.dispose();
          popup.sparkles.forEach((s) => {
            scene.remove(s.mesh);
            (s.mesh.material as THREE.Material).dispose();
            s.mesh.geometry.dispose();
          });
          popups.splice(i, 1);
          continue;
        }

        // Elastic Pop-in scale with overshoot
        const popProgress = Math.min(1, age / 0.24);
        const easeOvershoot = 1 + 2.4 * Math.pow(popProgress - 1, 3) + 1.4 * Math.pow(popProgress - 1, 2);
        const targetScaleX = 2.4 * Math.min(1.25, Math.max(0.1, easeOvershoot));
        const targetScaleY = 0.75 * Math.min(1.25, Math.max(0.1, easeOvershoot));
        popup.sprite.scale.set(targetScaleX, targetScaleY, 1);

        // Float upward with subtle wind sway
        popup.sprite.position.y = popup.initialY + (age / popup.maxLife) * 1.2;
        popup.sprite.position.x += Math.sin(age * 5.0) * delta * 0.15;

        // Smooth fade out in the final 0.45s
        if (age > popup.maxLife - 0.45) {
          popup.sprite.material.opacity = Math.max(0, (popup.maxLife - age) / 0.45);
        }

        // Radiating marigold sparkle particles
        popup.sparkles.forEach((s) => {
          s.velocity.y -= 7.0 * delta; // Gravity
          s.mesh.position.addScaledVector(s.velocity, delta);
          s.mesh.rotation.x += s.rotVel.x * delta;
          s.mesh.rotation.y += s.rotVel.y * delta;
          s.mesh.scale.multiplyScalar(0.978);
          if (age > popup.maxLife - 0.45) {
            (s.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(
              0,
              (popup.maxLife - age) / 0.45
            );
          }
        });
      }

      // 4. COURTYARD SPECTATORS IDLE CELEBRATION & CHEER BOUNCE
      spectatorsRef.current.forEach((spec) => {
        // Idle sway & rhythmic head nod
        spec.root.rotation.y = spec.baseRotY + Math.sin(elapsed * 2.2 + spec.clapOffset) * 0.06;
        spec.headGroup.rotation.y = Math.sin(elapsed * 1.8 + spec.clapOffset) * 0.1;
        spec.headGroup.rotation.x = -0.05 + Math.sin(elapsed * 3.2 + spec.clapOffset) * 0.05;

        // Hand/Arm Gestures
        if (spec.isWavingFlag) {
          spec.rightArm.rotation.z = -Math.PI / 4 + Math.sin(elapsed * 4.5 + spec.clapOffset) * 0.42;
          spec.rightArm.rotation.x = Math.cos(elapsed * 3.5 + spec.clapOffset) * 0.25;
          spec.leftArm.rotation.x = -0.3 + Math.sin(elapsed * 2.5 + spec.clapOffset) * 0.15;
        } else if (spec.hasCymbals) {
          const cymbalBeat = Math.abs(Math.sin(elapsed * 5.5 + spec.clapOffset));
          spec.leftArm.rotation.y = -0.25 + cymbalBeat * 0.35;
          spec.rightArm.rotation.y = 0.25 - cymbalBeat * 0.35;
          spec.torso.position.y = 0.58 + cymbalBeat * 0.02;
        } else {
          // Energetic clapping
          const clapCycle = Math.abs(Math.sin(elapsed * 7.0 + spec.clapOffset));
          spec.leftArm.rotation.y = -0.3 + clapCycle * 0.4;
          spec.rightArm.rotation.y = 0.3 - clapCycle * 0.4;
          spec.leftArm.rotation.x = -0.35;
          spec.rightArm.rotation.x = -0.35;
          spec.torso.position.y = 0.58 + clapCycle * 0.035;
        }

        // Interactive Cheer Bounce on User Click
        if (spec.cheerBounce > 0) {
          spec.cheerBounce = Math.max(0, spec.cheerBounce - delta * 3.2);
          const bouncePhase = Math.sin((1 - spec.cheerBounce) * Math.PI);
          spec.squashGroup.position.y = bouncePhase * 0.42;
          spec.squashGroup.scale.set(
            1 - bouncePhase * 0.18,
            1 + bouncePhase * 0.28,
            1 - bouncePhase * 0.18
          );
          spec.leftArm.rotation.x = -bouncePhase * 1.5;
          spec.rightArm.rotation.x = -bouncePhase * 1.5;
        } else {
          spec.squashGroup.position.y = 0;
          spec.squashGroup.scale.set(1, 1, 1);
        }
      });

      // 5. ARTICULATED CHARACTER KINEMATICS
      const gopalas = gopalasRef.current;
      const yellow = gopalas.find((g) => g.id === 'yellow');
      const green = gopalas.find((g) => g.id === 'green');
      const red = gopalas.find((g) => g.id === 'red');
      const amber = gopalas.find((g) => g.id === 'amber');
      const purple = gopalas.find((g) => g.id === 'purple');
      const blue = gopalas.find((g) => g.id === 'blue');

      // (A) Pre-Start: Offstage
      if (t <= 0.1) {
        gopalas.forEach((g) => {
          resetPose(g);
          g.root.position.set(16, 0, 0);
        });
      }

      // (B) Phase 1: Joyous Entrance Rush (0.1s to 3.8s)
      else if (t > 0.1 && t <= 3.8) {
        if (yellow) {
          resetPose(yellow);
          const p = Math.min(1, Math.max(0, (t - 0.2) / 2.7));
          yellow.root.position.x = THREE.MathUtils.lerp(-8.5, -0.92, p);
          yellow.root.position.z = THREE.MathUtils.lerp(1.6, -0.15, p);
          applyRunningKinematics(yellow, t * 13, Math.PI / 2.2);
        }

        if (green) {
          resetPose(green);
          const p = Math.min(1, Math.max(0, (t - 0.4) / 2.7));
          green.root.position.x = THREE.MathUtils.lerp(0.0, 0.0, p);
          green.root.position.z = THREE.MathUtils.lerp(-6.5, 0.32, p);
          applyRunningKinematics(green, t * 13, 0);
        }

        if (red) {
          resetPose(red);
          const p = Math.min(1, Math.max(0, (t - 0.3) / 2.7));
          red.root.position.x = THREE.MathUtils.lerp(8.5, 0.92, p);
          red.root.position.z = THREE.MathUtils.lerp(1.6, -0.15, p);
          applyRunningKinematics(red, t * 13, -Math.PI / 2.2);
        }

        if (amber) {
          resetPose(amber);
          const p = Math.min(1, Math.max(0, (t - 0.7) / 2.7));
          amber.root.position.x = THREE.MathUtils.lerp(-9.0, -1.8, p);
          amber.root.position.z = THREE.MathUtils.lerp(2.8, 0.8, p);
          applyRunningKinematics(amber, t * 13, Math.PI / 2.3);
        }

        if (purple) {
          resetPose(purple);
          const p = Math.min(1, Math.max(0, (t - 0.8) / 2.7));
          purple.root.position.x = THREE.MathUtils.lerp(9.0, 1.8, p);
          purple.root.position.z = THREE.MathUtils.lerp(2.8, 0.8, p);
          applyRunningKinematics(purple, t * 13, -Math.PI / 2.3);
        }

        if (blue) {
          resetPose(blue);
          const p = Math.min(1, Math.max(0, (t - 1.1) / 2.5));
          blue.root.position.x = THREE.MathUtils.lerp(0, 0, p);
          blue.root.position.z = THREE.MathUtils.lerp(7.5, 2.5, p);
          applyRunningKinematics(blue, t * 12, Math.PI);
        }
      }

      // (C) Phase 2: Base Tier Horse Squat & Interlocking Foundation (3.8s to 6.8s)
      else if (t > 3.8 && t <= 6.8) {
        const squatP = Math.min(1, (t - 3.8) / 1.5);
        // Chest breathing cycle
        const breath = Math.sin(elapsed * 4) * 0.015;

        // Yellow (Left Pillar)
        if (yellow) {
          resetPose(yellow);
          yellow.root.position.set(-0.92, 0, -0.15);
          yellow.root.rotation.y = 0.42;

          yellow.pelvis.position.y = THREE.MathUtils.lerp(0.54, 0.41, squatP) + breath;
          yellow.leftHip.rotation.x = -0.48 * squatP;
          yellow.leftKnee.rotation.x = 0.72 * squatP;
          yellow.rightHip.rotation.x = -0.48 * squatP;
          yellow.rightKnee.rotation.x = 0.72 * squatP;

          // Strong right arm locks firmly across Green's left shoulder
          yellow.rightShoulder.rotation.z = -1.15 * squatP;
          yellow.rightShoulder.rotation.x = 0.32 * squatP;
          yellow.rightElbow.rotation.x = 0.65 * squatP;
          yellow.headGroup.rotation.x = -0.28;
        }

        // Green (Center Keystone)
        if (green) {
          resetPose(green);
          green.root.position.set(0.0, 0, 0.32);
          green.root.rotation.y = 0;

          green.pelvis.position.y = THREE.MathUtils.lerp(0.54, 0.41, squatP) + breath;
          green.leftHip.rotation.x = -0.48 * squatP;
          green.leftKnee.rotation.x = 0.72 * squatP;
          green.rightHip.rotation.x = -0.48 * squatP;
          green.rightKnee.rotation.x = 0.72 * squatP;

          // Spreads both arms across to brace Yellow & Red
          green.leftShoulder.rotation.z = 1.2 * squatP;
          green.leftElbow.rotation.x = 0.55 * squatP;
          green.rightShoulder.rotation.z = -1.2 * squatP;
          green.rightElbow.rotation.x = 0.55 * squatP;
          green.headGroup.rotation.x = -0.32;
        }

        // Red (Right Pillar)
        if (red) {
          resetPose(red);
          red.root.position.set(0.92, 0, -0.15);
          red.root.rotation.y = -0.42;

          red.pelvis.position.y = THREE.MathUtils.lerp(0.54, 0.41, squatP) + breath;
          red.leftHip.rotation.x = -0.48 * squatP;
          red.leftKnee.rotation.x = 0.72 * squatP;
          red.rightHip.rotation.x = -0.48 * squatP;
          red.rightKnee.rotation.x = 0.72 * squatP;

          // Strong left arm locks firmly across Green's right shoulder
          red.leftShoulder.rotation.z = 1.15 * squatP;
          red.leftShoulder.rotation.x = 0.32 * squatP;
          red.leftElbow.rotation.x = 0.65 * squatP;
          red.headGroup.rotation.x = -0.28;
        }

        if (amber) {
          resetPose(amber);
          amber.root.position.set(-1.65, 0, 0.65);
          amber.root.rotation.y = 0.52;
          amber.leftShoulder.rotation.z = 0.6 + Math.sin(t * 6) * 0.2;
          amber.rightShoulder.rotation.z = -0.6 - Math.sin(t * 6) * 0.2;
        }

        if (purple) {
          resetPose(purple);
          purple.root.position.set(1.65, 0, 0.65);
          purple.root.rotation.y = -0.52;
          purple.leftShoulder.rotation.z = 0.6 + Math.sin(t * 6) * 0.2;
          purple.rightShoulder.rotation.z = -0.6 - Math.sin(t * 6) * 0.2;
        }

        if (blue) {
          resetPose(blue);
          blue.root.position.set(0, 0, 2.3);
          blue.root.rotation.y = Math.PI;
          blue.leftShoulder.rotation.z = 0.9 + Math.sin(t * 8) * 0.25;
          blue.rightShoulder.rotation.z = -0.9 - Math.sin(t * 8) * 0.25;
        }
      }

      // (D) Phase 3: Tier 2 Climbs onto Base Tier Shoulders (6.8s to 10.2s)
      else if (t > 6.8 && t <= 10.2) {
        // Base Tier holds with heavy strain
        const strainWobble = Math.sin(elapsed * 5) * 0.012;
        [yellow, green, red].forEach((b) => {
          if (!b) return;
          b.pelvis.position.y = 0.41 + strainWobble;
          b.leftKnee.rotation.x = 0.72;
          b.rightKnee.rotation.x = 0.72;
          b.headGroup.rotation.x = -0.32;
        });

        const climbP = Math.min(1, (t - 6.8) / 2.6);

        // Amber ascends onto Yellow & Green's shoulders
        if (amber) {
          resetPose(amber);
          amber.root.position.x = THREE.MathUtils.lerp(-1.65, -0.44, climbP);
          amber.root.position.y = THREE.MathUtils.lerp(0, 1.48, climbP);
          amber.root.position.z = THREE.MathUtils.lerp(0.65, 0.06, climbP);
          amber.root.rotation.y = 0.16;

          if (climbP < 0.95) {
            amber.rightHip.rotation.x = -0.85;
            amber.rightKnee.rotation.x = 1.15;
            amber.leftHip.rotation.x = 0.2;
            amber.leftKnee.rotation.x = 0.1;
            amber.leftShoulder.rotation.z = 0.8;
            amber.rightShoulder.rotation.z = -0.8;
          } else {
            amber.pelvis.position.y = 0.48;
            amber.leftHip.rotation.x = -0.22;
            amber.leftKnee.rotation.x = 0.38;
            amber.rightHip.rotation.x = -0.22;
            amber.rightKnee.rotation.x = 0.38;

            // Interlocks with Purple
            amber.rightShoulder.rotation.z = -1.15;
            amber.rightElbow.rotation.x = 0.55;
            amber.headGroup.rotation.x = -0.32;
          }
        }

        // Purple ascends onto Red & Green's shoulders
        if (purple) {
          resetPose(purple);
          purple.root.position.x = THREE.MathUtils.lerp(1.65, 0.44, climbP);
          purple.root.position.y = THREE.MathUtils.lerp(0, 1.48, climbP);
          purple.root.position.z = THREE.MathUtils.lerp(0.65, 0.06, climbP);
          purple.root.rotation.y = -0.16;

          if (climbP < 0.95) {
            purple.leftHip.rotation.x = -0.85;
            purple.leftKnee.rotation.x = 1.15;
            purple.rightHip.rotation.x = 0.2;
            purple.rightKnee.rotation.x = 0.1;
            purple.leftShoulder.rotation.z = 0.8;
            purple.rightShoulder.rotation.z = -0.8;
          } else {
            purple.pelvis.position.y = 0.48;
            purple.leftHip.rotation.x = -0.22;
            purple.leftKnee.rotation.x = 0.38;
            purple.rightHip.rotation.x = -0.22;
            purple.rightKnee.rotation.x = 0.38;

            purple.leftShoulder.rotation.z = 1.15;
            purple.leftElbow.rotation.x = 0.55;
            purple.headGroup.rotation.x = -0.32;
          }
        }

        if (blue) {
          resetPose(blue);
          const bp = Math.min(1, (t - 7.5) / 2.2);
          blue.root.position.z = THREE.MathUtils.lerp(2.3, 0.85, bp);
          blue.root.rotation.y = Math.PI;
          applyRunningKinematics(blue, t * 11, Math.PI);
        }
      }

      // (E) Phase 4: Bal Gopal Scales to Apex & Winds Up Golden Lathi (10.2s to 14.2s)
      else if (t > 10.2 && t <= 14.2) {
        // Living breathing human tower wobble
        const towerWobble = Math.sin(t * 3.6) * 0.022;

        [yellow, green, red].forEach((b) => {
          if (!b) return;
          b.pelvis.position.y = 0.41;
          b.leftKnee.rotation.x = 0.72;
          b.rightKnee.rotation.x = 0.72;
          b.headGroup.rotation.x = -0.36;
        });

        if (amber) {
          amber.root.position.set(-0.44 + towerWobble, 1.48, 0.06);
          amber.rightShoulder.rotation.z = -1.15;
          amber.headGroup.rotation.x = -0.36;
        }

        if (purple) {
          purple.root.position.set(0.44 + towerWobble, 1.48, 0.06);
          purple.leftShoulder.rotation.z = 1.15;
          purple.headGroup.rotation.x = -0.36;
        }

        const climbP = Math.min(1, (t - 10.2) / 2.7);

        if (blue) {
          resetPose(blue);
          blue.root.position.x = towerWobble * 1.5;
          blue.root.position.y = THREE.MathUtils.lerp(0.2, 2.84, climbP);
          blue.root.position.z = THREE.MathUtils.lerp(0.85, 0.06, climbP);
          blue.root.rotation.y = 0;

          if (climbP < 0.92) {
            // Climbing steps
            const cycle = t * 11;
            blue.leftHip.rotation.x = Math.sin(cycle) * 0.75;
            blue.leftKnee.rotation.x = Math.max(0, -Math.sin(cycle) * 1.2);
            blue.rightHip.rotation.x = -Math.sin(cycle) * 0.75;
            blue.rightKnee.rotation.x = Math.max(0, Math.sin(cycle) * 1.2);
            blue.headGroup.rotation.x = -0.42;
          } else {
            // Summit reached! Bal Gopal stands proudly directly under the Dahi Handi!
            blue.pelvis.position.y = 0.54;
            blue.leftKnee.rotation.x = 0.18;
            blue.rightKnee.rotation.x = 0.18;

            // Dramatic Anticipation & Strike Wind-Up
            const windupP = Math.min(1, (t - 13.0) / 1.2);
            blue.rightShoulder.rotation.z = THREE.MathUtils.lerp(-0.35, -Math.PI * 0.78, windupP);
            blue.rightShoulder.rotation.x = THREE.MathUtils.lerp(0, -0.48, windupP);
            blue.rightElbow.rotation.x = THREE.MathUtils.lerp(0.4, 1.2, windupP);

            // Left arm extends for balance
            blue.leftShoulder.rotation.z = THREE.MathUtils.lerp(0.3, 0.85, windupP);
            blue.headGroup.rotation.x = -0.58; // Eyes locked on the pot!
            blue.mouth.scale.set(1.5, 1.5, 1);
          }
        }
      }

      // (F) Phase 5: The Strike! (14.2s to 15.0s)
      else if (t > 14.2 && t <= 15.0) {
        const strikeP = (t - 14.2) / 0.8;

        if (blue) {
          resetPose(blue);
          blue.root.position.set(0, 2.84, 0.06);

          if (strikeP < 0.3) {
            // High-speed downward swing
            const swing = strikeP / 0.3;
            blue.rightShoulder.rotation.z = THREE.MathUtils.lerp(-Math.PI * 0.78, -Math.PI * 0.28, swing);
            blue.rightShoulder.rotation.x = THREE.MathUtils.lerp(-0.48, 0.85, swing);
            blue.rightElbow.rotation.x = THREE.MathUtils.lerp(1.2, 0.1, swing);
            blue.torso.rotation.x = 0.26;
            blue.headGroup.rotation.x = -0.32;
          } else {
            // Triumphant follow-through & cheer!
            blue.rightShoulder.rotation.z = -Math.PI * 0.68;
            blue.rightShoulder.rotation.x = 0.22;
            blue.leftShoulder.rotation.z = Math.PI * 0.68;
            blue.mouth.scale.set(1.8, 1.8, 1);
            blue.torso.rotation.x = -0.16;
          }
        }
      }

      // (G) Phase 6: Blender Grand Victory Celebration (15.0s+)
      else if (t > 15.0) {
        // Bal Gopal victory dance at apex
        if (blue) {
          resetPose(blue);
          const apexHop = Math.abs(Math.sin(elapsed * 8)) * 0.22;
          blue.root.position.set(0, 2.84 + apexHop, 0.06);

          // Both arms high in ecstatic victory
          blue.leftShoulder.rotation.z = Math.PI * 0.76 + Math.sin(elapsed * 6) * 0.25;
          blue.rightShoulder.rotation.z = -Math.PI * 0.76 - Math.sin(elapsed * 6) * 0.25;
          blue.leftElbow.rotation.x = 0.32;
          blue.rightElbow.rotation.x = 0.32;
          blue.mouth.scale.set(1.7, 1.7, 1);
          blue.headGroup.rotation.y = Math.sin(elapsed * 4) * 0.25;
        }

        // Amber cheers with raised arms
        if (amber) {
          resetPose(amber);
          amber.root.position.set(-0.44, 1.48 + Math.abs(Math.sin(elapsed * 7 + 1)) * 0.16, 0.06);
          amber.leftShoulder.rotation.z = Math.PI * 0.65 + Math.sin(elapsed * 8) * 0.2;
          amber.rightShoulder.rotation.z = -Math.PI * 0.65 - Math.sin(elapsed * 8) * 0.2;
          amber.mouth.scale.set(1.5, 1.5, 1);
        }

        // Purple plays fast energetic Dholak rhythm!
        if (purple) {
          resetPose(purple);
          purple.root.position.set(0.44, 1.48 + Math.abs(Math.sin(elapsed * 7 + 2)) * 0.16, 0.06);
          purple.leftShoulder.rotation.x = -0.52;
          purple.leftElbow.rotation.x = 0.8 + Math.sin(elapsed * 18) * 0.4;
          purple.rightShoulder.rotation.x = -0.52;
          purple.rightElbow.rotation.x = 0.8 - Math.sin(elapsed * 18) * 0.4;
          purple.headGroup.rotation.x = Math.sin(elapsed * 8) * 0.15;
          purple.mouth.scale.set(1.5, 1.5, 1);
        }

        // Base Tier celebrates with bouncing rhythm and raised arms
        [yellow, green, red].forEach((b, idx) => {
          if (!b) return;
          resetPose(b);
          const bounce = Math.abs(Math.sin(elapsed * 6 + idx)) * 0.14;
          b.pelvis.position.y = 0.41 + bounce;
          b.leftShoulder.rotation.z = Math.PI * 0.52 + Math.sin(elapsed * 7 + idx) * 0.22;
          b.rightShoulder.rotation.z = -Math.PI * 0.52 - Math.sin(elapsed * 7 + idx) * 0.22;
          b.mouth.scale.set(1.6, 1.6, 1);
        });
      }

      // 6. GOPALA CHEER BOUNCE (Reactive Squash & Stretch on User Click)
      gopalas.forEach((g) => {
        if (g.cheerBounce > 0) {
          g.cheerBounce = Math.max(0, g.cheerBounce - delta * 3.4);
          const phase = Math.sin((1 - g.cheerBounce) * Math.PI);
          g.squashGroup.position.y += phase * 0.35;
          g.squashGroup.scale.set(
            1 - phase * 0.15,
            1 + phase * 0.25,
            1 - phase * 0.15
          );
        }
      });

      // 7. SECONDARY INERTIA PHYSICS (Peacock Feather & Dholak)
      if (blue && blue.peacockFeather) {
        const headRotY = blue.headGroup.rotation.y;
        const targetAngle = -headRotY * 0.45;
        const force = (targetAngle - blue.featherAngle) * 35;
        blue.featherVelocity = (blue.featherVelocity + force * delta) * 0.82;
        blue.featherAngle += blue.featherVelocity * delta;
        blue.peacockFeather.rotation.z = blue.featherAngle;
      }

      // 8. CINEMATIC CAMERA SYSTEM (Automatic Tracking with User Orbit Override)
      let lookTargetY = 2.5;

      if (!userInteractedRef.current && !isDraggingRef.current) {
        // Cinematic multi-phase director camera
        if (t <= 3.8) {
          // Act 1: Sweeping entrance tracking shot
          orbitAnglesRef.current.theta = THREE.MathUtils.lerp(orbitAnglesRef.current.theta, -0.25, delta * 1.5);
          orbitAnglesRef.current.phi = THREE.MathUtils.lerp(orbitAnglesRef.current.phi, 0.14, delta * 1.5);
          orbitAnglesRef.current.radius = THREE.MathUtils.lerp(orbitAnglesRef.current.radius, 10.5, delta * 1.5);
          lookTargetY = 2.4;
        } else if (t > 3.8 && t <= 10.2) {
          // Act 2: Tilting up as tiers ascend
          orbitAnglesRef.current.theta = THREE.MathUtils.lerp(orbitAnglesRef.current.theta, 0.05, delta * 1.2);
          orbitAnglesRef.current.phi = THREE.MathUtils.lerp(orbitAnglesRef.current.phi, 0.18, delta * 1.2);
          orbitAnglesRef.current.radius = THREE.MathUtils.lerp(orbitAnglesRef.current.radius, 9.6, delta * 1.2);
          lookTargetY = 2.9;
        } else if (t > 10.2 && t <= 14.2) {
          // Act 3: Low-angle dramatic hero shot framing Bal Gopal under the Handi
          orbitAnglesRef.current.theta = THREE.MathUtils.lerp(orbitAnglesRef.current.theta, -0.1, delta * 2.0);
          orbitAnglesRef.current.phi = THREE.MathUtils.lerp(orbitAnglesRef.current.phi, 0.24, delta * 2.0);
          orbitAnglesRef.current.radius = THREE.MathUtils.lerp(orbitAnglesRef.current.radius, 8.4, delta * 2.0);
          lookTargetY = 3.6;
        } else if (t > 14.2) {
          // Act 4: Sweeping 360° victory celebration arc
          orbitAnglesRef.current.theta += delta * 0.15; // Slow majestic orbit
          orbitAnglesRef.current.phi = THREE.MathUtils.lerp(orbitAnglesRef.current.phi, 0.18, delta * 1.5);
          orbitAnglesRef.current.radius = THREE.MathUtils.lerp(orbitAnglesRef.current.radius, 10.2, delta * 1.5);
          lookTargetY = 2.8;
        }
      }

      // Camera Shake Damping on Pot Impact
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (cameraShakeRef.current > 0.001) {
        shakeOffsetX = (Math.random() - 0.5) * 0.12 * cameraShakeRef.current;
        shakeOffsetY = (Math.random() - 0.5) * 0.12 * cameraShakeRef.current;
        cameraShakeRef.current *= Math.pow(0.05, delta); // Fast exponential decay in 0.2s
      }

      // Compute spherical camera coordinates
      const { theta, phi, radius } = orbitAnglesRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta) + shakeOffsetX;
      camera.position.y = radius * Math.cos(phi) + 1.2 + shakeOffsetY;
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);

      camera.lookAt(0, lookTargetY, 0);

      // Render Final Frame
      renderer.render(scene, camera);
    };

    renderLoop();

    // 10. CLEANUP
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      id="janmashtami-canvas-viewport"
    />
  );
};
