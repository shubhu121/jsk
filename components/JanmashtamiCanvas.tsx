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

// 1. Temple Courtyard Sandstone Floor with Sacred Rangoli Mandala
function createCourtyardTexture(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base warm temple sandstone
  ctx.fillStyle = '#f6ede0';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle natural stone grain noise
  for (let i = 0; i < 45000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const alpha = Math.random() * 0.06;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(180, 130, 90, ${alpha})` : `rgba(255, 255, 255, ${alpha * 1.5})`;
    ctx.fillRect(x, y, 2 + Math.random() * 2, 2 + Math.random() * 2);
  }

  // Stone tile grid lines (subtle courtyard flagstones)
  ctx.strokeStyle = 'rgba(160, 120, 80, 0.12)';
  ctx.lineWidth = 3;
  for (let x = 0; x <= 1024; x += 256) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += 256) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Sacred Ceremonial Rangoli Mandala in the center
  const cx = 512;
  const cy = 512;

  // Outer concentric rings
  const ringRadii = [380, 350, 300, 240, 180, 120, 60];
  ringRadii.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = idx % 2 === 0 ? 'rgba(217, 119, 6, 0.35)' : 'rgba(239, 68, 68, 0.28)';
    ctx.lineWidth = 4;
    ctx.stroke();
  });

  // Radiating 16 Lotus Petals
  const petals = 16;
  ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
  ctx.lineWidth = 2.5;

  for (let i = 0; i < petals; i++) {
    const angle = (i * Math.PI * 2) / petals;
    const nextAngle = ((i + 1) * Math.PI * 2) / petals;
    const midAngle = angle + Math.PI / petals;

    const rBase = 180;
    const rTip = 290;

    const x1 = cx + Math.cos(angle) * rBase;
    const y1 = cy + Math.sin(angle) * rBase;
    const xTip = cx + Math.cos(midAngle) * rTip;
    const yTip = cy + Math.sin(midAngle) * rTip;
    const x2 = cx + Math.cos(nextAngle) * rBase;
    const y2 = cy + Math.sin(nextAngle) * rBase;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx + Math.cos(midAngle) * (rBase * 1.2), cy + Math.sin(midAngle) * (rBase * 1.2), xTip, yTip);
    ctx.quadraticCurveTo(cx + Math.cos(midAngle) * (rBase * 1.2), cy + Math.sin(midAngle) * (rBase * 1.2), x2, y2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Sacred Om / Diya dots
  for (let i = 0; i < 32; i++) {
    const angle = (i * Math.PI * 2) / 32;
    const bx = cx + Math.cos(angle) * 340;
    const by = cy + Math.sin(angle) * 340;
    ctx.beginPath();
    ctx.arc(bx, by, 5, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(220, 38, 38, 0.6)' : 'rgba(245, 158, 11, 0.7)';
    ctx.fill();
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(1, 1);

  // Bump Canvas
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    bCtx.fillStyle = Math.random() > 0.5 ? '#999999' : '#666666';
    bCtx.fillRect(x, y, 2, 2);
  }
  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;

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
}

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

    // 5. GROUND / TEMPLE COURTYARD WITH PROCEDURAL SANDSTONE & RANGOLI
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    groundGeo.rotateX(-Math.PI / 2);

    const { map: courtMap, bump: courtBump } = createCourtyardTexture();
    const groundMat = new THREE.MeshPhysicalMaterial({
      map: courtMap,
      bumpMap: courtBump,
      bumpScale: 0.03,
      roughness: 0.88,
      metalness: 0.02,
      clearcoat: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    scene.add(ground);

    // 6. BUILD SCENE OBJECTS
    buildFestiveToran(scene);
    buildDahiHandi(scene, handiGroupRef, potMeshRef, butterTopRef);
    buildGopalas(scene, gopalasRef);
    buildPotShatterPhysics(scene, shardsDataRef, curdDataRef);
    buildPetalsShower(scene, petalsDataRef);

    // 7. MOUSE & TOUCH ORBIT CONTROLS
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      userInteractedRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      orbitAnglesRef.current.theta -= dx * 0.0055;
      orbitAnglesRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI / 2.25, orbitAnglesRef.current.phi + dy * 0.0045)
      );
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      userInteractedRef.current = true;
      orbitAnglesRef.current.radius = Math.max(
        5.2,
        Math.min(16.0, orbitAnglesRef.current.radius + e.deltaY * 0.005)
      );
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

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

      // 1. Natural Wind Sway on Dahi Handi
      if (handiGroupRef.current) {
        const sway = Math.sin(elapsed * 1.5) * 0.038;
        handiGroupRef.current.rotation.z = sway;
        handiGroupRef.current.rotation.x = Math.cos(elapsed * 1.1) * 0.022;
      }

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

      // 3. ARTICULATED CHARACTER KINEMATICS
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

      // 4. SECONDARY INERTIA PHYSICS (Peacock Feather & Dholak)
      if (blue && blue.peacockFeather) {
        const headRotY = blue.headGroup.rotation.y;
        const targetAngle = -headRotY * 0.45;
        const force = (targetAngle - blue.featherAngle) * 35;
        blue.featherVelocity = (blue.featherVelocity + force * delta) * 0.82;
        blue.featherAngle += blue.featherVelocity * delta;
        blue.peacockFeather.rotation.z = blue.featherAngle;
      }

      // 5. CINEMATIC CAMERA SYSTEM (Automatic Tracking with User Orbit Override)
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
