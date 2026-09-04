'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { festiveAudio } from '@/lib/audio';

export interface JanmashtamiCanvasProps {
  currentTime: number; // 0 to 29 seconds
  isPlaying: boolean;
  cameraMode: 'video' | 'orbit' | 'climber' | 'celebration';
  onPotBroken?: () => void;
  interactiveClimbStep?: number; // For game mode
  isGameMode?: boolean;
}

interface GopalaRig {
  id: string;
  name: string;
  color: number;
  group: THREE.Group;
  head: THREE.Mesh;
  mouth: THREE.Mesh;
  eyeLeft: THREE.Mesh;
  eyeRight: THREE.Mesh;
  torso: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  dholak?: THREE.Group;
  peacockFeather?: THREE.Group;
  baseColor: number;
}

// Ease out back easing function
function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// Helper: Build Hanging Floral Toran
function buildFloralToran(scene: THREE.Scene) {
  const toranGroup = new THREE.Group();
  toranGroup.position.set(0, 6.2, 0);

  // Rope across top
  const ropePoints: THREE.Vector3[] = [];
  for (let x = -8; x <= 8; x += 0.5) {
    const sag = Math.cos((x / 8) * (Math.PI / 2)) * 0.22;
    ropePoints.push(new THREE.Vector3(x, -sag, 0));
  }
  const ropeCurve = new THREE.CatmullRomCurve3(ropePoints);
  const ropeGeo = new THREE.TubeGeometry(ropeCurve, 64, 0.038, 8, false);
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xc49a45, roughness: 0.8 });
  const ropeMesh = new THREE.Mesh(ropeGeo, ropeMat);
  toranGroup.add(ropeMesh);

  // Hanging Mango leaves (Ashoka / Aam ke patte)
  const leafGeo = new THREE.ConeGeometry(0.12, 0.85, 5);
  leafGeo.rotateZ(Math.PI);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e5c38, roughness: 0.6 });

  const flowerColors = [0x1e88e5, 0xe53935, 0xfdd835, 0x8e24aa, 0x43a047, 0xfb8c00];
  const petalGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.03, 6);
  petalGeo.rotateX(Math.PI / 2);

  for (let i = -7.2; i <= 7.2; i += 0.9) {
    const sag = Math.cos((i / 8) * (Math.PI / 2)) * 0.22;
    const y = -sag;

    if (Math.abs(i) > 0.6) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(i, y - 0.42, 0);
      leaf.rotation.z = (Math.random() - 0.5) * 0.15;
      toranGroup.add(leaf);
    }

    const colorIndex = Math.abs(Math.floor(i * 3)) % flowerColors.length;
    const flowerMat = new THREE.MeshStandardMaterial({
      color: flowerColors[colorIndex],
      roughness: 0.4,
    });
    const flower = new THREE.Mesh(petalGeo, flowerMat);
    flower.position.set(i + 0.35, y, 0.05);

    const centerGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const centerMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b });
    const center = new THREE.Mesh(centerGeo, centerMat);
    center.position.set(i + 0.35, y, 0.07);

    toranGroup.add(flower);
    toranGroup.add(center);
  }

  scene.add(toranGroup);
}

// Helper: Build Dahi Handi Pot & Butter
function buildDahiHandi(
  scene: THREE.Scene,
  handiGroupRef: React.RefObject<THREE.Group | null>,
  potMeshRef: React.RefObject<THREE.Mesh | null>,
  butterTopRef: React.RefObject<THREE.Mesh | null>
) {
  const handiGroup = new THREE.Group();
  handiGroup.position.set(0, 5.2, 0);
  handiGroupRef.current = handiGroup;

  const stringMat = new THREE.MeshStandardMaterial({ color: 0x8d3328, roughness: 0.7 });
  for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / 3) {
    const sx = Math.sin(angle) * 0.42;
    const sz = Math.cos(angle) * 0.42;
    const strPoints = [
      new THREE.Vector3(0, 0.8, 0),
      new THREE.Vector3(sx, 0, sz),
      new THREE.Vector3(0, -0.65, 0),
    ];
    const strCurve = new THREE.CatmullRomCurve3(strPoints);
    const strGeo = new THREE.TubeGeometry(strCurve, 16, 0.015, 6, false);
    const strMesh = new THREE.Mesh(strGeo, stringMat);
    handiGroup.add(strMesh);
  }

  const potPoints: THREE.Vector2[] = [];
  potPoints.push(new THREE.Vector2(0, -0.6));
  potPoints.push(new THREE.Vector2(0.25, -0.58));
  potPoints.push(new THREE.Vector2(0.52, -0.3));
  potPoints.push(new THREE.Vector2(0.58, 0.0));
  potPoints.push(new THREE.Vector2(0.5, 0.28));
  potPoints.push(new THREE.Vector2(0.32, 0.38));
  potPoints.push(new THREE.Vector2(0.38, 0.48));
  potPoints.push(new THREE.Vector2(0.34, 0.5));
  potPoints.push(new THREE.Vector2(0.0, 0.48));

  const potGeo = new THREE.LatheGeometry(potPoints, 32);
  const potMat = new THREE.MeshStandardMaterial({
    color: 0xba372a,
    roughness: 0.55,
    metalness: 0.05,
  });
  const potMesh = new THREE.Mesh(potGeo, potMat);
  potMesh.castShadow = true;
  potMesh.receiveShadow = true;
  potMeshRef.current = potMesh;
  handiGroup.add(potMesh);

  const ringGeo = new THREE.TorusGeometry(0.56, 0.018, 8, 32);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.position.y = 0.0;
  handiGroup.add(ring1);

  const ring2 = ring1.clone();
  ring2.scale.set(0.9, 0.9, 0.9);
  ring2.position.y = -0.15;
  handiGroup.add(ring2);

  const butterGeo = new THREE.SphereGeometry(0.33, 20, 16);
  butterGeo.scale(1, 0.6, 1);
  const butterMat = new THREE.MeshStandardMaterial({
    color: 0xfefefe,
    roughness: 0.25,
  });
  const butterTop = new THREE.Mesh(butterGeo, butterMat);
  butterTop.position.set(0, 0.45, 0);
  butterTopRef.current = butterTop;
  handiGroup.add(butterTop);

  for (let d = 0; d < 4; d++) {
    const dripGeo = new THREE.ConeGeometry(0.045, 0.18, 8);
    dripGeo.rotateZ(Math.PI);
    const drip = new THREE.Mesh(dripGeo, butterMat);
    const angle = (d * Math.PI) / 2 + 0.3;
    drip.position.set(Math.sin(angle) * 0.37, 0.35, Math.cos(angle) * 0.37);
    handiGroup.add(drip);
  }

  scene.add(handiGroup);
}

// Helper: Build cute chibi Gopala character rigs
function buildGopalas(scene: THREE.Scene, gopalasRef: React.RefObject<GopalaRig[]>) {
  const charactersData = [
    { id: 'yellow', name: 'Gopala Sunny', color: 0xf5b014, xInit: 8.5 },
    { id: 'blue', name: 'Bal Gopal', color: 0x38bdf8, xInit: 9.5, isKrishna: true },
    { id: 'red', name: 'Gopala Veeru', color: 0xef4444, xInit: 10.5 },
    { id: 'purple', name: 'Gopala Dholak', color: 0xab47bc, xInit: 11.5, hasDholak: true },
    { id: 'green', name: 'Gopala Chintu', color: 0x84cc16, xInit: 12.5 },
    { id: 'amber', name: 'Gopala Keshav', color: 0xf59e0b, xInit: 13.5 },
  ];

  const rigs: GopalaRig[] = [];

  charactersData.forEach((data) => {
    const group = new THREE.Group();
    group.position.set(data.xInit, 0, 0);

    const skinMat = new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: 0.4,
    });

    // Head
    const headGeo = new THREE.SphereGeometry(0.38, 24, 20);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 1.15, 0);
    head.castShadow = true;
    group.add(head);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.08, 12, 10);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-0.36, 0, 0);
    head.add(earL);
    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(0.36, 0, 0);
    head.add(earR);

    // Eyes
    const eyeWhiteGeo = new THREE.SphereGeometry(0.09, 12, 12);
    eyeWhiteGeo.scale(0.85, 1.2, 0.5);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const eyePupilGeo = new THREE.SphereGeometry(0.048, 10, 10);
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x111827 });

    const eyeL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeL.position.set(-0.13, 0.04, 0.33);
    const pupilL = new THREE.Mesh(eyePupilGeo, eyePupilMat);
    pupilL.position.set(0, 0, 0.05);
    eyeL.add(pupilL);
    head.add(eyeL);

    const eyeR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeR.position.set(0.13, 0.04, 0.33);
    const pupilR = new THREE.Mesh(eyePupilGeo, eyePupilMat);
    pupilR.position.set(0, 0, 0.05);
    eyeR.add(pupilR);
    head.add(eyeR);

    // Smiling Open Mouth
    const mouthGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16, 1, false, 0, Math.PI);
    mouthGeo.rotateX(Math.PI / 2);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.16, 0.34);
    head.add(mouth);

    // Bal Gopal Peacock Feather & Crown
    let peacockFeather: THREE.Group | undefined;
    if (data.isKrishna) {
      peacockFeather = new THREE.Group();
      const bandGeo = new THREE.TorusGeometry(0.37, 0.025, 8, 24);
      bandGeo.rotateX(Math.PI / 2);
      const bandMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7, roughness: 0.3 });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.set(0, 0.1, 0);
      head.add(band);

      const quillGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6);
      const quillMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
      const quill = new THREE.Mesh(quillGeo, quillMat);
      quill.position.set(0.08, 0.48, -0.05);
      quill.rotation.z = -0.25;

      const eyeFeatherGeo = new THREE.SphereGeometry(0.1, 12, 10);
      eyeFeatherGeo.scale(0.8, 1.2, 0.2);
      const featherMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
      const featherEye = new THREE.Mesh(eyeFeatherGeo, featherMat);
      featherEye.position.set(0, 0.22, 0);
      quill.add(featherEye);

      const featherCenter = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      featherCenter.position.set(0, 0.22, 0.02);
      quill.add(featherCenter);

      peacockFeather.add(quill);
      head.add(peacockFeather);
    }

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.45, 16);
    const torso = new THREE.Mesh(torsoGeo, skinMat);
    torso.position.set(0, 0.65, 0);
    torso.castShadow = true;
    group.add(torso);

    const dhotiGeo = new THREE.CylinderGeometry(0.29, 0.31, 0.22, 16);
    const dhotiMat = new THREE.MeshStandardMaterial({
      color: data.isKrishna ? 0xfef08a : 0xf97316,
      roughness: 0.6,
    });
    const dhoti = new THREE.Mesh(dhotiGeo, dhotiMat);
    dhoti.position.set(0, -0.12, 0);
    torso.add(dhoti);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.065, 0.07, 0.38, 10);
    armGeo.translate(0, -0.19, 0);
    const handGeo = new THREE.SphereGeometry(0.075, 10, 8);
    handGeo.translate(0, -0.38, 0);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.3, 0.8, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
    const leftHandMesh = new THREE.Mesh(handGeo, skinMat);
    leftArm.add(leftArmMesh, leftHandMesh);
    group.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.3, 0.8, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
    const rightHandMesh = new THREE.Mesh(handGeo, skinMat);
    rightArm.add(rightArmMesh, rightHandMesh);
    group.add(rightArm);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.085, 0.42, 10);
    legGeo.translate(0, -0.21, 0);
    const footGeo = new THREE.SphereGeometry(0.09, 10, 8);
    footGeo.scale(1, 0.6, 1.4);
    footGeo.translate(0, -0.42, 0.04);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.14, 0.45, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, skinMat);
    const leftFootMesh = new THREE.Mesh(footGeo, skinMat);
    leftLeg.add(leftLegMesh, leftFootMesh);
    group.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.14, 0.45, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, skinMat);
    const rightFootMesh = new THREE.Mesh(footGeo, skinMat);
    rightLeg.add(rightLegMesh, rightFootMesh);
    group.add(rightLeg);

    // Dholak
    let dholak: THREE.Group | undefined;
    if (data.hasDholak) {
      dholak = new THREE.Group();
      const drumGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.55, 16);
      drumGeo.rotateZ(Math.PI / 2);
      const drumMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
      const drumMesh = new THREE.Mesh(drumGeo, drumMat);

      const faceGeo = new THREE.CircleGeometry(0.2, 16);
      const faceMat = new THREE.MeshStandardMaterial({ color: 0xf5ebe0, roughness: 0.8 });
      const faceL = new THREE.Mesh(faceGeo, faceMat);
      faceL.position.set(-0.28, 0, 0);
      faceL.rotation.y = -Math.PI / 2;
      const faceR = new THREE.Mesh(faceGeo, faceMat);
      faceR.position.set(0.28, 0, 0);
      faceR.rotation.y = Math.PI / 2;

      dholak.add(drumMesh, faceL, faceR);
      dholak.position.set(0, 0.58, 0.35);
      group.add(dholak);
    }

    scene.add(group);

    rigs.push({
      id: data.id,
      name: data.name,
      color: data.color,
      group,
      head,
      mouth,
      eyeLeft: eyeL,
      eyeRight: eyeR,
      torso,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      dholak,
      peacockFeather,
      baseColor: data.color,
    });
  });

  gopalasRef.current = rigs;
}

// Helper: Build Pot Shards & Curd Splatters
function buildPotBreakParticles(
  scene: THREE.Scene,
  shardsRef: React.RefObject<THREE.Mesh[]>,
  splashesRef: React.RefObject<THREE.Mesh[]>
) {
  const shards: THREE.Mesh[] = [];
  const shardGeo = new THREE.TetrahedronGeometry(0.16, 0);
  const shardMat = new THREE.MeshStandardMaterial({ color: 0xba372a, roughness: 0.6 });

  for (let i = 0; i < 24; i++) {
    const shard = new THREE.Mesh(shardGeo, shardMat);
    shard.visible = false;
    scene.add(shard);
    shards.push(shard);
  }
  shardsRef.current = shards;

  const splashes: THREE.Mesh[] = [];
  const curdGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const curdMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

  for (let i = 0; i < 35; i++) {
    const splash = new THREE.Mesh(curdGeo, curdMat);
    splash.visible = false;
    scene.add(splash);
    splashes.push(splash);
  }
  splashesRef.current = splashes;
}

// Helper: Confetti and Petals System
function buildCelebrationParticles(
  scene: THREE.Scene,
  confettiParticlesRef: React.RefObject<THREE.Points | null>,
  petalsParticlesRef: React.RefObject<THREE.Points | null>
) {
  const confettiCount = 350;
  const confettiGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(confettiCount * 3);
  const colors = new Float32Array(confettiCount * 3);

  const colorPalette = [
    new THREE.Color(0xf59e0b),
    new THREE.Color(0xef4444),
    new THREE.Color(0x3b82f6),
    new THREE.Color(0x10b981),
    new THREE.Color(0xec4899),
    new THREE.Color(0xffffff),
  ];

  for (let i = 0; i < confettiCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = 5 + Math.random() * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

    const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  confettiGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  confettiGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const confettiMat = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0,
  });

  const confettiParticles = new THREE.Points(confettiGeo, confettiMat);
  scene.add(confettiParticles);
  confettiParticlesRef.current = confettiParticles;

  const petalsCount = 180;
  const petalsGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(petalsCount * 3);
  const pColors = new Float32Array(petalsCount * 3);

  const petalPalette = [
    new THREE.Color(0xf59e0b),
    new THREE.Color(0xd97706),
    new THREE.Color(0xfef08a),
  ];

  for (let i = 0; i < petalsCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 12;
    pPos[i * 3 + 1] = 4 + Math.random() * 5;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 4;

    const c = petalPalette[Math.floor(Math.random() * petalPalette.length)];
    pColors[i * 3] = c.r;
    pColors[i * 3 + 1] = c.g;
    pColors[i * 3 + 2] = c.b;
  }

  petalsGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  petalsGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

  const petalsMat = new THREE.PointsMaterial({
    size: 0.22,
    vertexColors: true,
    transparent: true,
    opacity: 0,
  });

  const petalsParticles = new THREE.Points(petalsGeo, petalsMat);
  scene.add(petalsParticles);
  petalsParticlesRef.current = petalsParticles;
}

// Helper: "Happy Janmashtami" Floating 3D Banner
function buildHappyJanmashtamiBanner(
  scene: THREE.Scene,
  happyTextGroupRef: React.RefObject<THREE.Group | null>
) {
  const bannerGroup = new THREE.Group();
  bannerGroup.position.set(0, 3.4, -0.8);
  bannerGroup.scale.set(0.001, 0.001, 0.001);

  const auraGeo = new THREE.CircleGeometry(2.6, 32);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.45,
  });
  const aura = new THREE.Mesh(auraGeo, auraMat);
  aura.position.set(0, 0, -0.05);
  bannerGroup.add(aura);

  const rayMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.35 });
  for (let i = 0; i < 16; i++) {
    const rayGeo = new THREE.ConeGeometry(0.12, 1.2, 4);
    const ray = new THREE.Mesh(rayGeo, rayMat);
    const angle = (i * Math.PI * 2) / 16;
    ray.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, -0.04);
    ray.rotation.z = angle - Math.PI / 2;
    bannerGroup.add(ray);
  }

  scene.add(bannerGroup);
  happyTextGroupRef.current = bannerGroup;
}

// Helper: Animate single Gopala
function animateGopala(rig: GopalaRig, index: number, time: number, elapsed: number) {
  const { group, head, leftArm, rightArm, leftLeg, rightLeg, mouth, dholak } = rig;

  leftArm.rotation.set(0, 0, 0);
  rightArm.rotation.set(0, 0, 0);
  leftLeg.rotation.set(0, 0, 0);
  rightLeg.rotation.set(0, 0, 0);
  head.rotation.set(0, 0, 0);
  mouth.scale.set(1, 1, 1);

  if (time < 6.5) {
    const startRunTime = 1.8 + index * 0.45;
    const endRunTime = 5.2 + index * 0.2;
    const startX = 8.5 + index * 1.1;
    const targetX = -1.2 + index * 0.48;

    if (time < startRunTime) {
      group.position.set(startX, 0, 0);
    } else if (time < endRunTime) {
      const runProgress = (time - startRunTime) / (endRunTime - startRunTime);
      const curX = THREE.MathUtils.lerp(startX, targetX, runProgress);
      const bounce = Math.abs(Math.sin((time - startRunTime) * 14)) * 0.15;
      group.position.set(curX, bounce, 0);

      const legCycle = Math.sin((time - startRunTime) * 16);
      leftLeg.rotation.x = legCycle * 0.7;
      rightLeg.rotation.x = -legCycle * 0.7;
      leftArm.rotation.x = -legCycle * 0.8;
      rightArm.rotation.x = legCycle * 0.8;
      group.rotation.y = -Math.PI / 2 + 0.1;
    } else {
      group.position.set(targetX, 0, 0);
      group.rotation.y = 0;
      const jump = Math.abs(Math.sin(elapsed * 8 + index)) * 0.2;
      group.position.y = jump;

      leftArm.rotation.z = Math.PI * 0.65 + Math.sin(elapsed * 10 + index) * 0.3;
      rightArm.rotation.z = -Math.PI * 0.65 - Math.sin(elapsed * 10 + index) * 0.3;
      head.rotation.y = Math.sin(elapsed * 4 + index) * 0.2;
      mouth.scale.set(1.4, 1.4, 1);
    }
    return;
  }

  if (time >= 6.5 && time < 18.5) {
    const towerWobble = Math.sin(time * 3.5) * 0.035;

    if (rig.id === 'yellow') {
      const tForm = Math.min(1, (time - 6.5) / 1.5);
      group.position.x = THREE.MathUtils.lerp(-1.0, -0.65, tForm);
      group.position.y = 0;
      group.position.z = 0.1;
      group.rotation.y = 0.3;
      leftArm.rotation.z = 0.5;
      rightArm.rotation.z = -1.1;
      rightArm.rotation.x = -0.4;
    } else if (rig.id === 'green') {
      const tForm = Math.min(1, (time - 6.5) / 1.5);
      group.position.x = THREE.MathUtils.lerp(0.8, 0.0, tForm);
      group.position.y = 0;
      group.position.z = 0;
      leftArm.rotation.z = 1.2;
      rightArm.rotation.z = -1.2;
      leftArm.rotation.x = -0.3;
      rightArm.rotation.x = -0.3;
    } else if (rig.id === 'red') {
      const tForm = Math.min(1, (time - 6.5) / 1.5);
      group.position.x = THREE.MathUtils.lerp(1.2, 0.65, tForm);
      group.position.y = 0;
      group.position.z = 0.1;
      group.rotation.y = -0.3;
      leftArm.rotation.z = 1.1;
      rightArm.rotation.z = -0.5;
    } else if (rig.id === 'amber') {
      if (time < 8.5) {
        group.position.set(-1.4, 0, 0.3);
        leftArm.rotation.z = 1.2;
        rightArm.rotation.z = -1.2;
      } else if (time < 11.0) {
        const climbP = (time - 8.5) / 2.5;
        group.position.x = THREE.MathUtils.lerp(-1.4, -0.35 + towerWobble, climbP);
        group.position.y = THREE.MathUtils.lerp(0, 1.35, climbP);
        group.position.z = 0.05;
        leftLeg.rotation.x = Math.sin((time - 8.5) * 10) * 0.6;
        rightLeg.rotation.x = -Math.sin((time - 8.5) * 10) * 0.6;
      } else {
        group.position.set(-0.35 + towerWobble, 1.35, 0.05);
        leftArm.rotation.z = 0.7;
        rightArm.rotation.z = -0.9;
        head.rotation.x = -0.2;
      }
    } else if (rig.id === 'purple') {
      if (time < 9.0) {
        group.position.set(1.4, 0, 0.3);
        leftArm.rotation.z = 1.2;
        rightArm.rotation.z = -1.2;
      } else if (time < 11.5) {
        const climbP = (time - 9.0) / 2.5;
        group.position.x = THREE.MathUtils.lerp(1.4, 0.35 + towerWobble, climbP);
        group.position.y = THREE.MathUtils.lerp(0, 1.35, climbP);
        group.position.z = 0.05;
        leftLeg.rotation.x = -Math.sin((time - 9.0) * 10) * 0.6;
        rightLeg.rotation.x = Math.sin((time - 9.0) * 10) * 0.6;
      } else {
        group.position.set(0.35 + towerWobble, 1.35, 0.05);
        leftArm.rotation.z = 0.9;
        rightArm.rotation.z = -0.7;
        head.rotation.x = -0.2;
      }
    } else if (rig.id === 'blue') {
      if (time < 11.5) {
        group.position.set(0, 0, 0.6);
        leftArm.rotation.z = Math.sin(time * 8) * 0.5 + 0.8;
        rightArm.rotation.z = -Math.sin(time * 8) * 0.5 - 0.8;
      } else if (time < 16.5) {
        const climbP = (time - 11.5) / 5.0;
        group.position.x = towerWobble * 1.5;
        group.position.y = THREE.MathUtils.lerp(0, 2.7, climbP);
        group.position.z = 0.1;
        leftLeg.rotation.x = Math.sin(time * 12) * 0.8;
        rightLeg.rotation.x = -Math.sin(time * 12) * 0.8;
        leftArm.rotation.x = -Math.sin(time * 12) * 0.8;
        rightArm.rotation.x = Math.sin(time * 12) * 0.8;
        head.rotation.x = -0.4;
      } else {
        group.position.set(towerWobble * 1.5, 2.7, 0.1);
        if (time < 17.5) {
          const stretchP = (time - 16.5) / 1.0;
          rightArm.rotation.z = -Math.PI * 0.85;
          rightArm.rotation.x = -0.2 - stretchP * 0.3;
          leftArm.rotation.z = 0.6;
          head.rotation.x = -0.5;
        } else {
          rightArm.rotation.z = -Math.PI * 0.7;
          rightArm.rotation.x = 0.5;
          head.rotation.x = -0.2;
          mouth.scale.set(1.8, 1.8, 1);
        }
      }
    }
    return;
  }

  if (time >= 18.5) {
    const dancePositions = [
      { id: 'red', x: -2.7, phase: 0 },
      { id: 'blue', x: -1.6, phase: 1.2 },
      { id: 'yellow', x: -0.6, phase: 2.4 },
      { id: 'purple', x: 0.5, phase: 0, isDrummer: true },
      { id: 'amber', x: 1.6, phase: 1.8 },
      { id: 'green', x: 2.7, phase: 3.0 },
    ];

    const cfg = dancePositions.find((d) => d.id === rig.id) || { x: 0, phase: 0, isDrummer: false };
    group.position.x = cfg.x;
    group.position.z = 0;

    const danceBounce = Math.abs(Math.sin(elapsed * 7 + cfg.phase)) * 0.22;
    group.position.y = danceBounce;
    group.rotation.z = Math.sin(elapsed * 5 + cfg.phase) * 0.12;
    mouth.scale.set(1.6, 1.6, 1);

    if (cfg.isDrummer && dholak) {
      dholak.rotation.z = Math.sin(elapsed * 10) * 0.1;
      leftArm.rotation.x = -0.6 + Math.sin(elapsed * 16) * 0.4;
      leftArm.rotation.z = 0.3;
      rightArm.rotation.x = -0.6 - Math.sin(elapsed * 16) * 0.4;
      rightArm.rotation.z = -0.3;
      head.rotation.x = Math.sin(elapsed * 8) * 0.2;
    } else {
      leftArm.rotation.z = Math.PI * 0.65 + Math.sin(elapsed * 6 + cfg.phase) * 0.35;
      rightArm.rotation.z = -Math.PI * 0.65 + Math.sin(elapsed * 6 + cfg.phase) * 0.35;
      leftLeg.rotation.x = Math.sin(elapsed * 7 + cfg.phase) * 0.3;
      rightLeg.rotation.x = -Math.sin(elapsed * 7 + cfg.phase) * 0.3;
    }
  }
}

export const JanmashtamiCanvas: React.FC<JanmashtamiCanvasProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const gopalasRef = useRef<GopalaRig[]>([]);
  const handiGroupRef = useRef<THREE.Group | null>(null);
  const potMeshRef = useRef<THREE.Mesh | null>(null);
  const butterTopRef = useRef<THREE.Mesh | null>(null);
  const shardsRef = useRef<THREE.Mesh[]>([]);
  const splashesRef = useRef<THREE.Mesh[]>([]);
  const confettiParticlesRef = useRef<THREE.Points | null>(null);
  const petalsParticlesRef = useRef<THREE.Points | null>(null);
  const happyTextGroupRef = useRef<THREE.Group | null>(null);

  // Store latest props in a ref for consumption in the animation loop
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  // Interaction / Orbit state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const orbitRotationRef = useRef({ theta: 0, phi: 0.15, radius: 14.5 });
  const targetCameraPosRef = useRef(new THREE.Vector3(0, 3.2, 14.5));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 3.0, 0));

  const hasBrokenTriggeredRef = useRef(false);
  const lastChantTimeRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf8f8f2);

    // 2. Setup Camera
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 14.5);
    camera.lookAt(0, 3.0, 0);
    cameraRef.current = camera;

    // 3. Setup WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff0dd, 1.2);
    sunLight.position.set(5, 12, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -5;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const warmRimLight = new THREE.DirectionalLight(0xffd59e, 0.45);
    warmRimLight.position.set(-6, 8, -5);
    scene.add(warmRimLight);

    // 5. Floor
    const floorGeo = new THREE.PlaneGeometry(35, 30);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // 6. Build Hanging Toran
    buildFloralToran(scene);

    // 7. Build Dahi Handi
    buildDahiHandi(scene, handiGroupRef, potMeshRef, butterTopRef);

    // 8. Build Characters (6 Cute Gopalas)
    buildGopalas(scene, gopalasRef);

    // 9. Build Shards and Splatters for Pot Break
    buildPotBreakParticles(scene, shardsRef, splashesRef);

    // 10. Build Confetti and Petals Emitter
    buildCelebrationParticles(scene, confettiParticlesRef, petalsParticlesRef);

    // 11. Build 3D "Happy Janmashtami" Floating Typography Group
    buildHappyJanmashtamiBanner(scene, happyTextGroupRef);

    // 12. Mouse / Touch Orbit listeners
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      orbitRotationRef.current.theta -= dx * 0.008;
      orbitRotationRef.current.phi = Math.max(-0.2, Math.min(Math.PI / 2.2, orbitRotationRef.current.phi + dy * 0.008));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMousePosRef.current.x;
      const dy = e.touches[0].clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      orbitRotationRef.current.theta -= dx * 0.008;
      orbitRotationRef.current.phi = Math.max(-0.2, Math.min(Math.PI / 2.2, orbitRotationRef.current.phi + dy * 0.008));
    };
    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    dom.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
    resizeObserver.observe(container);

    // Frame rendering function inside effect
    const renderScene = (delta: number, elapsed: number) => {
      const currentProps = propsRef.current;
      const time = currentProps.currentTime;
      const isPlaying = currentProps.isPlaying;
      const isGameMode = currentProps.isGameMode;
      const interactiveClimbStep = currentProps.interactiveClimbStep || 0;
      const onPotBroken = currentProps.onPotBroken;
      const cameraMode = currentProps.cameraMode;

      const gopalas = gopalasRef.current;
      const handi = handiGroupRef.current;
      const pot = potMeshRef.current;
      const butter = butterTopRef.current;

      const effectiveTime = isGameMode
        ? interactiveClimbStep === 0
          ? 3.5
          : interactiveClimbStep === 1
          ? 8.0
          : interactiveClimbStep === 2
          ? 12.0
          : interactiveClimbStep === 3
          ? 16.0
          : 22.0
        : time;

      // Natural pot sway
      if (handi && effectiveTime < 17.5) {
        handi.rotation.z = Math.sin(elapsed * 2.2) * 0.04;
        handi.rotation.x = Math.cos(elapsed * 1.8) * 0.02;
      }

      // Audio beat triggers
      if (effectiveTime >= 7.0 && effectiveTime <= 16.5 && isPlaying) {
        if (elapsed - lastChantTimeRef.current > 0.6) {
          festiveAudio.playDholak('dha', 0.6);
          lastChantTimeRef.current = elapsed;
        }
      }

      // Pot Break Event
      if (effectiveTime >= 17.5 && !hasBrokenTriggeredRef.current) {
        hasBrokenTriggeredRef.current = true;
        festiveAudio.playPotBreakSound();
        festiveAudio.playCheerSound();
        festiveAudio.startFestiveMusic(120);
        if (onPotBroken) onPotBroken();
      } else if (effectiveTime < 17.5 && hasBrokenTriggeredRef.current) {
        hasBrokenTriggeredRef.current = false;
        festiveAudio.stopFestiveMusic();
      }

      // Pot visibility & particles
      if (pot && butter) {
        const isBroken = effectiveTime >= 17.5;
        pot.visible = !isBroken;
        butter.visible = !isBroken;

        const breakAge = effectiveTime - 17.5;
        const shards = shardsRef.current;
        const splashes = splashesRef.current;

        if (isBroken && breakAge < 10) {
          shards.forEach((shard, i) => {
            shard.visible = true;
            const seed = i * 137.5;
            const dirX = Math.cos(seed) * (1.2 + (i % 5) * 0.4);
            const dirY = Math.sin(seed) * 1.5 + 0.5 - breakAge * 4.5;
            const dirZ = Math.sin(seed * 2) * 1.2;

            shard.position.set(dirX * breakAge, 5.2 + dirY * breakAge, dirZ * breakAge);
            shard.rotation.x = breakAge * 8 + i;
            shard.rotation.y = breakAge * 7;
          });

          splashes.forEach((splash, i) => {
            splash.visible = true;
            const seed = i * 93.7;
            const dirX = Math.cos(seed) * (0.8 + (i % 4) * 0.3);
            const dirY = -breakAge * 3.5 - Math.sin(seed) * 0.4;
            const dirZ = Math.sin(seed * 1.5) * 0.9;

            splash.position.set(dirX * breakAge, 5.3 + dirY, dirZ * breakAge);
            const scale = Math.max(0.01, 1 - breakAge * 0.12);
            splash.scale.set(scale, scale, scale);
          });
        } else {
          shards.forEach((s) => (s.visible = false));
          splashes.forEach((s) => (s.visible = false));
        }
      }

      // Confetti & Petals
      if (confettiParticlesRef.current && petalsParticlesRef.current) {
        const cMat = confettiParticlesRef.current.material as THREE.PointsMaterial;
        const pMat = petalsParticlesRef.current.material as THREE.PointsMaterial;

        if (effectiveTime >= 17.5) {
          cMat.opacity = Math.min(1, (effectiveTime - 17.5) * 1.5);
          pMat.opacity = Math.min(1, (effectiveTime - 17.5) * 1.2);

          const cGeo = confettiParticlesRef.current.geometry;
          const pos = cGeo.attributes.position.array as Float32Array;
          for (let i = 1; i < pos.length; i += 3) {
            pos[i] -= delta * 1.8;
            if (pos[i] < 0) pos[i] = 7.5;
          }
          cGeo.attributes.position.needsUpdate = true;

          const pGeo = petalsParticlesRef.current.geometry;
          const pPos = pGeo.attributes.position.array as Float32Array;
          for (let i = 1; i < pPos.length; i += 3) {
            pPos[i] -= delta * 1.2;
            pPos[i - 1] += Math.sin(elapsed + i) * delta * 0.4;
            if (pPos[i] < 0) pPos[i] = 7.0;
          }
          pGeo.attributes.position.needsUpdate = true;
        } else {
          cMat.opacity = 0;
          pMat.opacity = 0;
        }
      }

      // Happy Janmashtami Banner
      if (happyTextGroupRef.current) {
        if (effectiveTime >= 19.0) {
          const progress = Math.min(1, (effectiveTime - 19.0) * 1.5);
          const scale = THREE.MathUtils.lerp(0.01, 1.0, easeOutBack(progress));
          happyTextGroupRef.current.scale.set(scale, scale, scale);
          happyTextGroupRef.current.rotation.z = Math.sin(elapsed * 1.5) * 0.03;
        } else {
          happyTextGroupRef.current.scale.set(0.001, 0.001, 0.001);
        }
      }

      // Animate Gopalas
      gopalas.forEach((gopala, index) => {
        animateGopala(gopala, index, effectiveTime, elapsed);
      });

      // Update Camera
      if (cameraMode === 'orbit' && isDraggingRef.current) {
        const { theta, phi, radius } = orbitRotationRef.current;
        targetCameraPosRef.current.set(
          radius * Math.sin(theta) * Math.cos(phi),
          radius * Math.sin(phi) + 2.5,
          radius * Math.cos(theta) * Math.cos(phi)
        );
        targetLookAtRef.current.set(0, 2.5, 0);
      } else if (cameraMode === 'climber') {
        targetCameraPosRef.current.set(0, 4.2, 7.5);
        targetLookAtRef.current.set(0, 4.2, 0);
      } else if (cameraMode === 'celebration') {
        targetCameraPosRef.current.set(0, 2.2, 10.5);
        targetLookAtRef.current.set(0, 1.8, 0);
      } else {
        targetCameraPosRef.current.set(0, 3.2, 14.2);
        targetLookAtRef.current.set(0, 3.0, 0);
      }

      camera.position.lerp(targetCameraPosRef.current, delta * 4.0);
      camera.lookAt(targetLookAtRef.current);

      renderer.render(scene, camera);
    };

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      renderScene(delta, elapsed);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] md:min-h-[580px] select-none cursor-grab active:cursor-grabbing overflow-hidden rounded-2xl shadow-inner bg-[#f8f8f2]"
      id="threejs-canvas-wrapper"
    >
      <div className="absolute top-3 left-4 text-xs font-semibold tracking-wider text-amber-900/60 pointer-events-none uppercase">
        ✦ Shri Krishna Janmashtami ✦
      </div>
      <div className="absolute top-3 right-4 text-xs font-medium text-amber-800/60 pointer-events-none">
        3D WebGL Engine
      </div>
    </div>
  );
};
