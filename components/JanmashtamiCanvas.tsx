'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { festiveAudio } from '@/lib/audio';

export interface JanmashtamiCanvasProps {
  currentTime: number; // 0 to 22+ seconds
  isPlaying: boolean;
  onPotBroken?: () => void;
  isMuted?: boolean;
}

interface GopalaRig {
  id: string;
  name: string;
  color: number;
  isKrishna?: boolean;
  isDrummer?: boolean;
  root: THREE.Group;
  pelvis: THREE.Group;
  torso: THREE.Group;
  neck: THREE.Group;
  head: THREE.Mesh;
  mouth: THREE.Mesh;
  eyeL: THREE.Mesh;
  eyeR: THREE.Mesh;
  pupilL: THREE.Mesh;
  pupilR: THREE.Mesh;
  leftShoulder: THREE.Group;
  leftElbow: THREE.Group;
  leftHand: THREE.Mesh;
  rightShoulder: THREE.Group;
  rightElbow: THREE.Group;
  rightHand: THREE.Mesh;
  leftHip: THREE.Group;
  leftKnee: THREE.Group;
  leftFoot: THREE.Mesh;
  rightHip: THREE.Group;
  rightKnee: THREE.Group;
  rightFoot: THREE.Mesh;
  stick?: THREE.Mesh;
  dholak?: THREE.Group;
  peacockFeather?: THREE.Group;
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

// Build Hanging Floral Toran
function buildToran(scene: THREE.Scene) {
  const toranGroup = new THREE.Group();
  toranGroup.position.set(0, 5.8, 0);

  // Rope across top
  const ropePoints: THREE.Vector3[] = [];
  for (let x = -8.5; x <= 8.5; x += 0.5) {
    const sag = Math.cos((x / 8.5) * (Math.PI / 2)) * 0.28;
    ropePoints.push(new THREE.Vector3(x, -sag, 0));
  }
  const ropeCurve = new THREE.CatmullRomCurve3(ropePoints);
  const ropeGeo = new THREE.TubeGeometry(ropeCurve, 64, 0.035, 8, false);
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xc49a45, roughness: 0.8 });
  const ropeMesh = new THREE.Mesh(ropeGeo, ropeMat);
  toranGroup.add(ropeMesh);

  // Hanging Mango leaves & Marigolds
  const leafGeo = new THREE.ConeGeometry(0.12, 0.75, 5);
  leafGeo.rotateZ(Math.PI);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x236830, roughness: 0.55 });

  const marigoldColors = [0xf59e0b, 0xd97706, 0xef4444, 0xfacc15];
  const petalGeo = new THREE.SphereGeometry(0.11, 10, 8);
  petalGeo.scale(1, 0.65, 1);

  for (let i = -7.5; i <= 7.5; i += 0.85) {
    const sag = Math.cos((i / 8.5) * (Math.PI / 2)) * 0.28;
    const y = -sag;

    if (Math.abs(i) > 0.5) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(i, y - 0.38, 0);
      leaf.rotation.z = (Math.random() - 0.5) * 0.18;
      toranGroup.add(leaf);
    }

    const flowerColor = marigoldColors[Math.abs(Math.floor(i * 4)) % marigoldColors.length];
    const flowerMat = new THREE.MeshStandardMaterial({ color: flowerColor, roughness: 0.4 });
    const flower = new THREE.Mesh(petalGeo, flowerMat);
    flower.position.set(i + 0.32, y - 0.05, 0.04);
    toranGroup.add(flower);
  }

  scene.add(toranGroup);
}

// Build Dahi Handi Pot & Butter
function buildDahiHandi(
  scene: THREE.Scene,
  handiGroupRef: React.RefObject<THREE.Group | null>,
  potMeshRef: React.RefObject<THREE.Mesh | null>,
  butterTopRef: React.RefObject<THREE.Mesh | null>
) {
  const handiGroup = new THREE.Group();
  handiGroup.position.set(0, 4.8, 0);
  handiGroupRef.current = handiGroup;

  // Hanging Ropes
  const stringMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 });
  for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / 3) {
    const sx = Math.sin(angle) * 0.42;
    const sz = Math.cos(angle) * 0.42;
    const strPoints = [
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(sx, 0.05, sz),
      new THREE.Vector3(0, -0.65, 0),
    ];
    const strCurve = new THREE.CatmullRomCurve3(strPoints);
    const strGeo = new THREE.TubeGeometry(strCurve, 16, 0.016, 6, false);
    const strMesh = new THREE.Mesh(strGeo, stringMat);
    handiGroup.add(strMesh);
  }

  // Terracotta Matki (clay pot)
  const potPoints: THREE.Vector2[] = [];
  potPoints.push(new THREE.Vector2(0, -0.58));
  potPoints.push(new THREE.Vector2(0.24, -0.56));
  potPoints.push(new THREE.Vector2(0.50, -0.28));
  potPoints.push(new THREE.Vector2(0.56, 0.02));
  potPoints.push(new THREE.Vector2(0.48, 0.28));
  potPoints.push(new THREE.Vector2(0.32, 0.38));
  potPoints.push(new THREE.Vector2(0.38, 0.48));
  potPoints.push(new THREE.Vector2(0.34, 0.50));
  potPoints.push(new THREE.Vector2(0.0, 0.48));

  const potGeo = new THREE.LatheGeometry(potPoints, 32);
  const potMat = new THREE.MeshStandardMaterial({
    color: 0xc2410c, // Rich terracotta
    roughness: 0.5,
    metalness: 0.05,
  });
  const potMesh = new THREE.Mesh(potGeo, potMat);
  potMesh.castShadow = true;
  potMesh.receiveShadow = true;
  potMeshRef.current = potMesh;
  handiGroup.add(potMesh);

  // Decorative White paste rings
  const ringGeo = new THREE.TorusGeometry(0.54, 0.018, 8, 32);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.position.y = 0.02;
  handiGroup.add(ring1);

  const ring2 = ring1.clone();
  ring2.scale.set(0.88, 0.88, 0.88);
  ring2.position.y = -0.16;
  handiGroup.add(ring2);

  // Creamy Curd / Butter on top
  const butterGeo = new THREE.SphereGeometry(0.32, 20, 16);
  butterGeo.scale(1, 0.55, 1);
  const butterMat = new THREE.MeshStandardMaterial({
    color: 0xfffdfa,
    roughness: 0.2,
    metalness: 0.02,
  });
  const butterTop = new THREE.Mesh(butterGeo, butterMat);
  butterTop.position.set(0, 0.45, 0);
  butterTopRef.current = butterTop;
  handiGroup.add(butterTop);

  // Butter dripping droplets
  for (let d = 0; d < 4; d++) {
    const dripGeo = new THREE.ConeGeometry(0.042, 0.18, 8);
    dripGeo.rotateZ(Math.PI);
    const drip = new THREE.Mesh(dripGeo, butterMat);
    const angle = (d * Math.PI) / 2 + 0.35;
    drip.position.set(Math.sin(angle) * 0.36, 0.34, Math.cos(angle) * 0.36);
    handiGroup.add(drip);
  }

  scene.add(handiGroup);
}

// Build Articulated 3D Chibi Gopala Rig
function createArticulatedGopala(data: {
  id: string;
  name: string;
  skinColor: number;
  dhotiColor: number;
  isKrishna?: boolean;
  isDrummer?: boolean;
}): GopalaRig {
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    color: data.skinColor,
    roughness: 0.38,
    metalness: 0.02,
  });

  const dhotiMat = new THREE.MeshStandardMaterial({
    color: data.dhotiColor,
    roughness: 0.65,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.8,
    roughness: 0.25,
  });

  // Pelvis / Hips root
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.52;
  root.add(pelvis);

  // Dhoti / Waist
  const dhotiWaistGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.22, 16);
  const dhotiWaist = new THREE.Mesh(dhotiWaistGeo, dhotiMat);
  dhotiWaist.position.y = 0.02;
  dhotiWaist.castShadow = true;
  pelvis.add(dhotiWaist);

  // Gold Waistband / Belt
  const beltGeo = new THREE.TorusGeometry(0.26, 0.022, 8, 24);
  beltGeo.rotateX(Math.PI / 2);
  const belt = new THREE.Mesh(beltGeo, goldMat);
  belt.position.y = 0.1;
  pelvis.add(belt);

  // Dhoti Front Pleat
  const pleatGeo = new THREE.BoxGeometry(0.12, 0.28, 0.06);
  const pleat = new THREE.Mesh(pleatGeo, dhotiMat);
  pleat.position.set(0, -0.06, 0.24);
  pelvis.add(pleat);

  // Torso / Chest
  const torso = new THREE.Group();
  torso.position.y = 0.12;
  pelvis.add(torso);

  const chestGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.38, 16);
  chestGeo.scale(1.05, 1, 0.9);
  const chest = new THREE.Mesh(chestGeo, skinMat);
  chest.position.y = 0.18;
  chest.castShadow = true;
  torso.add(chest);

  // Angavastram / Sash across chest
  const sashGeo = new THREE.TorusGeometry(0.25, 0.028, 8, 24);
  sashGeo.rotateY(Math.PI / 4);
  sashGeo.rotateX(Math.PI / 3);
  const sash = new THREE.Mesh(sashGeo, dhotiMat);
  sash.position.y = 0.18;
  torso.add(sash);

  // Gold Pearl Necklace
  const necklaceGeo = new THREE.TorusGeometry(0.16, 0.015, 8, 20);
  necklaceGeo.rotateX(Math.PI / 2.2);
  const necklace = new THREE.Mesh(necklaceGeo, goldMat);
  necklace.position.set(0, 0.32, 0.08);
  torso.add(necklace);

  // Neck & Head
  const neck = new THREE.Group();
  neck.position.y = 0.38;
  torso.add(neck);

  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 12), skinMat);
  neckMesh.position.y = 0.04;
  neck.add(neckMesh);

  // Head (Cute Chibi sphere)
  const headGeo = new THREE.SphereGeometry(0.36, 28, 24);
  headGeo.scale(1.04, 1.0, 1.0);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 0.34;
  head.castShadow = true;
  neck.add(head);

  // Ears & Earrings
  const earGeo = new THREE.SphereGeometry(0.075, 12, 10);
  const earL = new THREE.Mesh(earGeo, skinMat);
  earL.position.set(-0.35, 0.0, 0);
  head.add(earL);

  const earRingGeo = new THREE.TorusGeometry(0.045, 0.012, 6, 12);
  const earRingL = new THREE.Mesh(earRingGeo, goldMat);
  earRingL.position.set(0, -0.05, 0);
  earL.add(earRingL);

  const earR = new THREE.Mesh(earGeo, skinMat);
  earR.position.set(0.35, 0.0, 0);
  head.add(earR);

  const earRingR = new THREE.Mesh(earRingGeo, goldMat);
  earRingR.position.set(0, -0.05, 0);
  earR.add(earRingR);

  // Eyes (White Sclera + Dark Pupil + Specular Sparkle)
  const eyeWhiteGeo = new THREE.SphereGeometry(0.085, 16, 16);
  eyeWhiteGeo.scale(0.85, 1.15, 0.45);
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });

  const pupilGeo = new THREE.SphereGeometry(0.046, 12, 12);
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111827 });

  const sparkleGeo = new THREE.SphereGeometry(0.016, 8, 8);
  const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Left Eye
  const eyeL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  eyeL.position.set(-0.13, 0.04, 0.31);
  const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
  pupilL.position.set(0, 0, 0.045);
  const sparkleL = new THREE.Mesh(sparkleGeo, sparkleMat);
  sparkleL.position.set(0.016, 0.016, 0.04);
  pupilL.add(sparkleL);
  eyeL.add(pupilL);
  head.add(eyeL);

  // Right Eye
  const eyeR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  eyeR.position.set(0.13, 0.04, 0.31);
  const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
  pupilR.position.set(0, 0, 0.045);
  const sparkleR = new THREE.Mesh(sparkleGeo, sparkleMat);
  sparkleR.position.set(0.016, 0.016, 0.04);
  pupilR.add(sparkleR);
  eyeR.add(pupilR);
  head.add(eyeR);

  // Eyebrows
  const browMat = new THREE.MeshBasicMaterial({ color: 0x3f2305 });
  const browGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.12, 6);
  browGeo.rotateZ(Math.PI / 2);

  const browL = new THREE.Mesh(browGeo, browMat);
  browL.position.set(-0.13, 0.16, 0.32);
  browL.rotation.z = -0.15;
  head.add(browL);

  const browR = new THREE.Mesh(browGeo, browMat);
  browR.position.set(0.13, 0.16, 0.32);
  browR.rotation.z = 0.15;
  head.add(browR);

  // Cute Button Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), skinMat);
  nose.position.set(0, -0.03, 0.36);
  head.add(nose);

  // Expressive Smiling Mouth (3D cavity with pink tongue)
  const mouthGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.04, 16, 1, false, 0, Math.PI);
  mouthGeo.rotateX(Math.PI / 2);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, -0.14, 0.33);

  const tongueGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const tongueMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const tongue = new THREE.Mesh(tongueGeo, tongueMat);
  tongue.position.set(0, -0.02, 0.02);
  mouth.add(tongue);
  head.add(mouth);

  // Sacred Tilak on Forehead
  const tilakU = new THREE.Mesh(
    new THREE.TorusGeometry(0.035, 0.008, 4, 12, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  tilakU.rotation.z = Math.PI;
  tilakU.position.set(0, 0.16, 0.35);
  head.add(tilakU);

  const tilakDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.016, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xdc2626 })
  );
  tilakDot.position.set(0, 0.16, 0.36);
  head.add(tilakDot);

  // Krishna's Choti (hair bun), Crown, and Peacock Feather
  let peacockFeather: THREE.Group | undefined;
  let stick: THREE.Mesh | undefined;

  if (data.isKrishna) {
    // Hair Bun
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
    const bunGeo = new THREE.SphereGeometry(0.15, 16, 14);
    bunGeo.scale(1, 1.2, 0.9);
    const bun = new THREE.Mesh(bunGeo, hairMat);
    bun.position.set(0.05, 0.38, -0.08);
    head.add(bun);

    // Gold Crown / Tiara
    const tiaraGeo = new THREE.TorusGeometry(0.35, 0.026, 8, 28);
    tiaraGeo.rotateX(Math.PI / 2.2);
    const tiara = new THREE.Mesh(tiaraGeo, goldMat);
    tiara.position.set(0, 0.12, 0.02);
    head.add(tiara);

    // Peacock Feather (Mor Pankh)
    peacockFeather = new THREE.Group();
    const quillGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6);
    const quillMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.4 });
    const quill = new THREE.Mesh(quillGeo, quillMat);
    quill.position.set(0.1, 0.56, -0.08);
    quill.rotation.z = -0.3;

    // Layered feather eye
    const outerEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    outerEye.scale.set(0.75, 1.2, 0.18);
    outerEye.position.set(0, 0.24, 0);
    quill.add(outerEye);

    const midEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x15803d })
    );
    midEye.position.set(0, 0.24, 0.02);
    quill.add(midEye);

    const innerEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.038, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    innerEye.position.set(0, 0.24, 0.035);
    quill.add(innerEye);

    peacockFeather.add(quill);
    head.add(peacockFeather);

    // Butter Breaking Golden Stick (Lathi / Flute)
    const stickGeo = new THREE.CylinderGeometry(0.022, 0.025, 0.85, 8);
    stick = new THREE.Mesh(stickGeo, goldMat);
    stick.rotation.x = Math.PI / 2;
    stick.position.set(0, -0.05, 0.25);
    stick.castShadow = true;
  }

  // --- ARTICULATED ARMS (Shoulder -> Upper Arm -> Elbow -> Forearm -> Hand) ---
  const upperArmGeo = new THREE.CylinderGeometry(0.062, 0.058, 0.24, 10);
  upperArmGeo.translate(0, -0.12, 0);

  const forearmGeo = new THREE.CylinderGeometry(0.055, 0.052, 0.22, 10);
  forearmGeo.translate(0, -0.11, 0);

  const handGeo = new THREE.SphereGeometry(0.068, 10, 8);
  handGeo.scale(1, 1.1, 0.7);

  const kadaGeo = new THREE.TorusGeometry(0.058, 0.015, 6, 12);
  kadaGeo.rotateX(Math.PI / 2);

  // Left Arm
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-0.25, 0.3, 0);
  const leftUpperArm = new THREE.Mesh(upperArmGeo, skinMat);
  leftUpperArm.castShadow = true;
  leftShoulder.add(leftUpperArm);

  const leftElbow = new THREE.Group();
  leftElbow.position.set(0, -0.24, 0);
  const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
  leftForearm.castShadow = true;
  leftElbow.add(leftForearm);

  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.set(0, -0.22, 0);
  const kadaL = new THREE.Mesh(kadaGeo, goldMat);
  kadaL.position.set(0, 0.02, 0);
  leftHand.add(kadaL);
  leftElbow.add(leftHand);

  leftShoulder.add(leftElbow);
  torso.add(leftShoulder);

  // Right Arm
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(0.25, 0.3, 0);
  const rightUpperArm = new THREE.Mesh(upperArmGeo, skinMat);
  rightUpperArm.castShadow = true;
  rightShoulder.add(rightUpperArm);

  const rightElbow = new THREE.Group();
  rightElbow.position.set(0, -0.24, 0);
  const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
  rightForearm.castShadow = true;
  rightElbow.add(rightForearm);

  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.set(0, -0.22, 0);
  const kadaR = new THREE.Mesh(kadaGeo, goldMat);
  kadaR.position.set(0, 0.02, 0);
  rightHand.add(kadaR);

  if (stick) {
    rightHand.add(stick);
  }

  rightElbow.add(rightHand);
  rightShoulder.add(rightElbow);
  torso.add(rightShoulder);

  // --- ARTICULATED LEGS (Hip -> Thigh -> Knee -> Calf -> Foot) ---
  const thighGeo = new THREE.CylinderGeometry(0.075, 0.07, 0.25, 10);
  thighGeo.translate(0, -0.125, 0);

  const calfGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.24, 10);
  calfGeo.translate(0, -0.12, 0);

  const footGeo = new THREE.SphereGeometry(0.082, 10, 8);
  footGeo.scale(0.85, 0.6, 1.4);
  footGeo.translate(0, -0.04, 0.04);

  // Left Leg
  const leftHip = new THREE.Group();
  leftHip.position.set(-0.13, -0.05, 0);
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
  rightHip.position.set(0.13, -0.05, 0);
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

  // Dholak Drum for Drummer
  let dholak: THREE.Group | undefined;
  if (data.isDrummer) {
    dholak = new THREE.Group();

    // Wooden Drum Barrel
    const drumGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.56, 16);
    drumGeo.rotateZ(Math.PI / 2);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
    const drumMesh = new THREE.Mesh(drumGeo, drumMat);
    drumMesh.castShadow = true;
    dholak.add(drumMesh);

    // Leather Drum Heads
    const faceGeo = new THREE.CircleGeometry(0.18, 16);
    const faceMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 });
    const syahiGeo = new THREE.CircleGeometry(0.07, 12);
    const syahiMat = new THREE.MeshBasicMaterial({ color: 0x1f2937 });

    // Left Head
    const faceL = new THREE.Mesh(faceGeo, faceMat);
    faceL.position.set(-0.282, 0, 0);
    faceL.rotation.y = -Math.PI / 2;
    const syahiL = new THREE.Mesh(syahiGeo, syahiMat);
    syahiL.position.set(0, 0, 0.005);
    faceL.add(syahiL);
    dholak.add(faceL);

    // Right Head
    const faceR = new THREE.Mesh(faceGeo, faceMat);
    faceR.position.set(0.282, 0, 0);
    faceR.rotation.y = Math.PI / 2;
    const syahiR = new THREE.Mesh(syahiGeo, syahiMat);
    syahiR.position.set(0, 0, 0.005);
    faceR.add(syahiR);
    dholak.add(faceR);

    // Neck Strap
    const strapCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 0, 0),
      new THREE.Vector3(-0.1, 0.35, -0.2),
      new THREE.Vector3(0.1, 0.35, -0.2),
      new THREE.Vector3(0.2, 0, 0),
    ]);
    const strapGeo = new THREE.TubeGeometry(strapCurve, 16, 0.015, 6, false);
    const strapMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c });
    const strap = new THREE.Mesh(strapGeo, strapMat);
    dholak.add(strap);

    dholak.position.set(0, 0.22, 0.32);
    torso.add(dholak);
  }

  return {
    id: data.id,
    name: data.name,
    color: data.skinColor,
    isKrishna: data.isKrishna,
    isDrummer: data.isDrummer,
    root,
    pelvis,
    torso,
    neck,
    head,
    mouth,
    eyeL,
    eyeR,
    pupilL,
    pupilR,
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
  };
}

// Instantiate the 6 Gopalas in the Scene
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
    // Park off-stage initially
    rig.root.position.set(15, 0, 0);
    scene.add(rig.root);
    rigs.push(rig);
  });

  gopalasRef.current = rigs;
}

// Build Shatter Shards & Curd Splash Particles
function buildPotShatterPhysics(
  scene: THREE.Scene,
  shardsDataRef: React.RefObject<ShardData[]>,
  curdDataRef: React.RefObject<CurdData[]>
) {
  // 1. Terracotta Shards
  const shardList: ShardData[] = [];
  const shardGeo = new THREE.DodecahedronGeometry(0.12, 0);
  const shardMat = new THREE.MeshStandardMaterial({
    color: 0xc2410c,
    roughness: 0.6,
  });

  for (let i = 0; i < 28; i++) {
    const mesh = new THREE.Mesh(shardGeo, shardMat);
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

  // 2. Curd / Butter Splatter Droplets
  const curdList: CurdData[] = [];
  const curdGeo = new THREE.SphereGeometry(0.08, 10, 8);
  const curdMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
  });

  for (let i = 0; i < 48; i++) {
    const mesh = new THREE.Mesh(curdGeo, curdMat);
    mesh.visible = false;
    scene.add(mesh);

    curdList.push({
      mesh,
      velocity: new THREE.Vector3(),
      initialScale: 0.6 + Math.random() * 0.8,
    });
  }
  curdDataRef.current = curdList;
}

// Build Confetti Shower
function buildConfettiShower(scene: THREE.Scene, confettiPointsRef: React.RefObject<THREE.Points | null>) {
  const count = 300;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const palette = [
    new THREE.Color(0xf59e0b),
    new THREE.Color(0xef4444),
    new THREE.Color(0x38bdf8),
    new THREE.Color(0x10b981),
    new THREE.Color(0xa855f7),
    new THREE.Color(0xfef08a),
  ];

  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 1] = 5 + Math.random() * 6;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8;

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    opacity: 0,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);
  confettiPointsRef.current = points;
}

// Helper to reset pose to neutral
function resetPose(rig: GopalaRig) {
  rig.pelvis.position.set(0, 0.52, 0);
  rig.pelvis.rotation.set(0, 0, 0);
  rig.torso.rotation.set(0, 0, 0);
  rig.neck.rotation.set(0, 0, 0);
  rig.head.rotation.set(0, 0, 0);
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

// Apply Bipedal Running Kinematics
function applyRunningKinematics(rig: GopalaRig, runCycle: number, forwardAngle: number) {
  rig.root.rotation.y = forwardAngle;
  rig.torso.rotation.x = 0.16; // Body leans forward

  // Pelvis bounces with each step
  rig.pelvis.position.y = 0.52 + Math.abs(Math.sin(runCycle)) * 0.08;

  // Alternating Leg Stride
  const legSwing = Math.sin(runCycle);
  rig.leftHip.rotation.x = legSwing * 0.75;
  rig.leftKnee.rotation.x = Math.max(0, -legSwing * 1.15); // Knee bends back naturally

  rig.rightHip.rotation.x = -legSwing * 0.75;
  rig.rightKnee.rotation.x = Math.max(0, legSwing * 1.15);

  // Counter-swinging Arms with bent elbows
  rig.leftShoulder.rotation.x = -legSwing * 0.8;
  rig.leftShoulder.rotation.z = 0.25;
  rig.leftElbow.rotation.x = 0.9; // 90-degree bent elbow

  rig.rightShoulder.rotation.x = legSwing * 0.8;
  rig.rightShoulder.rotation.z = -0.25;
  rig.rightElbow.rotation.x = 0.9;

  // Cheerful open mouth
  rig.mouth.scale.set(1.4, 1.4, 1);
  rig.head.rotation.x = -0.05;
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

  const shardsDataRef = useRef<ShardData[]>([]);
  const curdDataRef = useRef<CurdData[]>([]);
  const confettiPointsRef = useRef<THREE.Points | null>(null);

  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  const potBrokenTriggeredRef = useRef(false);

  // Mouse orbit controls
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const orbitAnglesRef = useRef({ theta: 0, phi: 0.15, radius: 9.8 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfaf6);
    scene.fog = new THREE.FogExp2(0xfcfaf6, 0.015);
    sceneRef.current = scene;

    // CAMERA SETUP
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 80);
    camera.position.set(0, 2.8, 9.8);
    cameraRef.current = camera;

    // RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff3d6, 1.4);
    sunLight.position.set(6, 12, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -9;
    sunLight.shadow.camera.right = 9;
    sunLight.shadow.camera.top = 9;
    sunLight.shadow.camera.bottom = -4;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.45);
    fillLight.position.set(-6, 5, -4);
    scene.add(fillLight);

    // GROUND / STAGE
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8,
      roughness: 0.9,
      metalness: 0.02,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    scene.add(ground);

    // Rangoli Pattern on the Ground (Festive Circle)
    const rangoliGeo = new THREE.RingGeometry(0.3, 2.6, 48);
    rangoliGeo.rotateX(-Math.PI / 2);
    const rangoliMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.22,
    });
    const rangoli = new THREE.Mesh(rangoliGeo, rangoliMat);
    rangoli.position.y = 0.005;
    scene.add(rangoli);

    // BUILD SCENE OBJECTS
    buildToran(scene);
    buildDahiHandi(scene, handiGroupRef, potMeshRef, butterTopRef);
    buildGopalas(scene, gopalasRef);
    buildPotShatterPhysics(scene, shardsDataRef, curdDataRef);
    buildConfettiShower(scene, confettiPointsRef);

    // MOUSE / TOUCH ORBIT HANDLERS
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      orbitAnglesRef.current.theta -= dx * 0.006;
      orbitAnglesRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI / 2.3, orbitAnglesRef.current.phi + dy * 0.005)
      );
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitAnglesRef.current.radius = Math.max(
        5.5,
        Math.min(15.0, orbitAnglesRef.current.radius + e.deltaY * 0.005)
      );
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // RESIZE OBSERVER
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // ANIMATION RAF LOOP
    let animId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const { currentTime, isPlaying, onPotBroken } = propsRef.current;

      // 1. Gently Sway the Suspended Dahi Handi (Wind Physics)
      if (handiGroupRef.current) {
        const sway = Math.sin(elapsed * 1.6) * 0.04;
        handiGroupRef.current.rotation.z = sway;
        handiGroupRef.current.rotation.x = Math.cos(elapsed * 1.2) * 0.025;
      }

      // 2. Animate Articulated Characters Based on Master Timeline
      const gopalas = gopalasRef.current;
      const t = currentTime;

      // Reset Pot Shatter state if rewound
      if (t < 14.3) {
        potBrokenTriggeredRef.current = false;
        if (potMeshRef.current) potMeshRef.current.visible = true;
        if (butterTopRef.current) butterTopRef.current.visible = true;

        shardsDataRef.current.forEach((s) => (s.mesh.visible = false));
        curdDataRef.current.forEach((c) => (c.mesh.visible = false));
        if (confettiPointsRef.current) {
          (confettiPointsRef.current.material as THREE.PointsMaterial).opacity = 0;
        }
      }

      // Check for Strike Moment
      if (t >= 14.4 && !potBrokenTriggeredRef.current) {
        potBrokenTriggeredRef.current = true;
        if (potMeshRef.current) potMeshRef.current.visible = false;
        if (butterTopRef.current) butterTopRef.current.visible = false;

        // Play audio smash
        festiveAudio.playPotBreakSound();
        festiveAudio.playCheerSound();

        // Initialize 28 Terracotta Shards with Radial Explosive Trajectories
        shardsDataRef.current.forEach((shard) => {
          shard.mesh.visible = true;
          shard.mesh.position.set(0, 4.8, 0);

          const angle = Math.random() * Math.PI * 2;
          const upAngle = (Math.random() - 0.3) * Math.PI * 0.5;
          const speed = 2.5 + Math.random() * 4.5;

          shard.velocity.set(
            Math.cos(angle) * Math.cos(upAngle) * speed,
            Math.sin(upAngle) * speed + 1.2,
            Math.sin(angle) * Math.cos(upAngle) * speed
          );

          shard.rotVelocity.set(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12
          );
        });

        // Initialize 48 Curd / Butter Droplets
        curdDataRef.current.forEach((curd) => {
          curd.mesh.visible = true;
          curd.mesh.position.set(
            (Math.random() - 0.5) * 0.3,
            4.8 + Math.random() * 0.2,
            (Math.random() - 0.5) * 0.3
          );
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.0 + Math.random() * 3.5;

          curd.velocity.set(
            Math.cos(angle) * speed,
            Math.random() * 2.5 - 0.5,
            Math.sin(angle) * speed
          );
        });

        if (onPotBroken) onPotBroken();
      }

      // Update Shard & Curd physics if broken
      if (t >= 14.4) {
        const dt = Math.min(delta, 0.05);

        shardsDataRef.current.forEach((shard) => {
          if (!shard.mesh.visible) return;
          shard.velocity.y -= 9.8 * dt; // Gravity
          shard.mesh.position.addScaledVector(shard.velocity, dt);
          shard.mesh.rotation.x += shard.rotVelocity.x * dt;
          shard.mesh.rotation.y += shard.rotVelocity.y * dt;

          // Bounce on ground
          if (shard.mesh.position.y < 0.05) {
            shard.mesh.position.y = 0.05;
            shard.velocity.y = -shard.velocity.y * 0.35;
            shard.velocity.x *= 0.6;
            shard.velocity.z *= 0.6;
          }
        });

        curdDataRef.current.forEach((curd) => {
          if (!curd.mesh.visible) return;
          curd.velocity.y -= 7.5 * dt;
          curd.mesh.position.addScaledVector(curd.velocity, dt);

          // Flatten on ground into curd splash
          if (curd.mesh.position.y < 0.04) {
            curd.mesh.position.y = 0.04;
            curd.velocity.set(0, 0, 0);
            curd.mesh.scale.set(curd.initialScale * 1.5, 0.1, curd.initialScale * 1.5);
          }
        });

        // Confetti Flutter
        if (confettiPointsRef.current) {
          const mat = confettiPointsRef.current.material as THREE.PointsMaterial;
          mat.opacity = Math.min(1.0, (t - 14.4) * 1.5);
          const pos = confettiPointsRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < pos.length; i += 3) {
            pos[i + 1] -= dt * 1.8; // fall
            pos[i] += Math.sin(elapsed * 2 + i) * dt * 0.4;
            if (pos[i + 1] < 0.1) {
              pos[i + 1] = 7 + Math.random() * 2;
            }
          }
          confettiPointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }

      // --- INDIVIDUAL GOPALA CHOREOGRAPHY & ARTICULATION ---
      const yellow = gopalas.find((g) => g.id === 'yellow');
      const green = gopalas.find((g) => g.id === 'green');
      const red = gopalas.find((g) => g.id === 'red');
      const amber = gopalas.find((g) => g.id === 'amber');
      const purple = gopalas.find((g) => g.id === 'purple');
      const blue = gopalas.find((g) => g.id === 'blue');

      // -------------------------------------------------------------
      // PHASE 0: Pre-Start (t <= 0.1s)
      // -------------------------------------------------------------
      if (t <= 0.1) {
        gopalas.forEach((g) => {
          resetPose(g);
          g.root.position.set(15, 0, 0);
        });
      }

      // -------------------------------------------------------------
      // PHASE 1: Running onto Stage (0.1s to 3.8s)
      // -------------------------------------------------------------
      else if (t > 0.1 && t <= 3.8) {
        // Yellow runs in from Left
        if (yellow) {
          resetPose(yellow);
          const p = Math.min(1, Math.max(0, (t - 0.2) / 2.8));
          yellow.root.position.x = THREE.MathUtils.lerp(-8.0, -0.9, p);
          yellow.root.position.z = THREE.MathUtils.lerp(1.5, -0.15, p);
          applyRunningKinematics(yellow, t * 14, Math.PI / 2.2);
        }

        // Green runs in from Back-Center
        if (green) {
          resetPose(green);
          const p = Math.min(1, Math.max(0, (t - 0.4) / 2.8));
          green.root.position.x = THREE.MathUtils.lerp(0.0, 0.0, p);
          green.root.position.z = THREE.MathUtils.lerp(-6.0, 0.3, p);
          applyRunningKinematics(green, t * 14, 0);
        }

        // Red runs in from Right
        if (red) {
          resetPose(red);
          const p = Math.min(1, Math.max(0, (t - 0.3) / 2.8));
          red.root.position.x = THREE.MathUtils.lerp(8.0, 0.9, p);
          red.root.position.z = THREE.MathUtils.lerp(1.5, -0.15, p);
          applyRunningKinematics(red, t * 14, -Math.PI / 2.2);
        }

        // Amber runs in from Left-Back
        if (amber) {
          resetPose(amber);
          const p = Math.min(1, Math.max(0, (t - 0.8) / 2.8));
          amber.root.position.x = THREE.MathUtils.lerp(-8.5, -1.8, p);
          amber.root.position.z = THREE.MathUtils.lerp(2.5, 0.8, p);
          applyRunningKinematics(amber, t * 14, Math.PI / 2.3);
        }

        // Purple (Dholak) runs in from Right-Back
        if (purple) {
          resetPose(purple);
          const p = Math.min(1, Math.max(0, (t - 0.9) / 2.8));
          purple.root.position.x = THREE.MathUtils.lerp(8.5, 1.8, p);
          purple.root.position.z = THREE.MathUtils.lerp(2.5, 0.8, p);
          applyRunningKinematics(purple, t * 14, -Math.PI / 2.3);
        }

        // Bal Gopal (Krishna) watches with arms waving
        if (blue) {
          resetPose(blue);
          const p = Math.min(1, Math.max(0, (t - 1.2) / 2.5));
          blue.root.position.x = THREE.MathUtils.lerp(0, 0, p);
          blue.root.position.z = THREE.MathUtils.lerp(7.0, 2.4, p);
          blue.root.rotation.y = Math.PI;
          applyRunningKinematics(blue, t * 12, Math.PI);
        }
      }

      // -------------------------------------------------------------
      // PHASE 2: Base Tier Squat & Interlock (3.8s to 6.8s)
      // -------------------------------------------------------------
      else if (t > 3.8 && t <= 6.8) {
        const squatP = Math.min(1, (t - 3.8) / 1.5);

        // Yellow (Left Base)
        if (yellow) {
          resetPose(yellow);
          yellow.root.position.set(-0.9, 0, -0.15);
          yellow.root.rotation.y = 0.4;

          // Strong horse squat: thighs rotate forward, knees bend
          yellow.pelvis.position.y = THREE.MathUtils.lerp(0.52, 0.40, squatP);
          yellow.leftHip.rotation.x = -0.45 * squatP;
          yellow.leftKnee.rotation.x = 0.65 * squatP;
          yellow.rightHip.rotation.x = -0.45 * squatP;
          yellow.rightKnee.rotation.x = 0.65 * squatP;

          // Right arm raises across and links firmly to Green's left shoulder
          yellow.rightShoulder.rotation.z = -1.1 * squatP;
          yellow.rightShoulder.rotation.x = 0.3 * squatP;
          yellow.rightElbow.rotation.x = 0.6 * squatP;

          yellow.head.rotation.x = -0.25; // Looking up to support
        }

        // Green (Center Base)
        if (green) {
          resetPose(green);
          green.root.position.set(0.0, 0, 0.3);
          green.root.rotation.y = 0;

          green.pelvis.position.y = THREE.MathUtils.lerp(0.52, 0.40, squatP);
          green.leftHip.rotation.x = -0.45 * squatP;
          green.leftKnee.rotation.x = 0.65 * squatP;
          green.rightHip.rotation.x = -0.45 * squatP;
          green.rightKnee.rotation.x = 0.65 * squatP;

          // Spreads both arms across to hold Yellow and Red
          green.leftShoulder.rotation.z = 1.15 * squatP;
          green.leftElbow.rotation.x = 0.5 * squatP;
          green.rightShoulder.rotation.z = -1.15 * squatP;
          green.rightElbow.rotation.x = 0.5 * squatP;

          green.head.rotation.x = -0.3;
        }

        // Red (Right Base)
        if (red) {
          resetPose(red);
          red.root.position.set(0.9, 0, -0.15);
          red.root.rotation.y = -0.4;

          red.pelvis.position.y = THREE.MathUtils.lerp(0.52, 0.40, squatP);
          red.leftHip.rotation.x = -0.45 * squatP;
          red.leftKnee.rotation.x = 0.65 * squatP;
          red.rightHip.rotation.x = -0.45 * squatP;
          red.rightKnee.rotation.x = 0.65 * squatP;

          // Left arm raises across and links firmly to Green's right shoulder
          red.leftShoulder.rotation.z = 1.1 * squatP;
          red.leftShoulder.rotation.x = 0.3 * squatP;
          red.leftElbow.rotation.x = 0.6 * squatP;

          red.head.rotation.x = -0.25;
        }

        // Amber and Purple prepare to climb
        if (amber) {
          resetPose(amber);
          amber.root.position.set(-1.6, 0, 0.6);
          amber.root.rotation.y = 0.5;
          amber.leftShoulder.rotation.z = 0.6 + Math.sin(t * 6) * 0.2;
          amber.rightShoulder.rotation.z = -0.6 - Math.sin(t * 6) * 0.2;
        }

        if (purple) {
          resetPose(purple);
          purple.root.position.set(1.6, 0, 0.6);
          purple.root.rotation.y = -0.5;
          purple.leftShoulder.rotation.z = 0.6 + Math.sin(t * 6) * 0.2;
          purple.rightShoulder.rotation.z = -0.6 - Math.sin(t * 6) * 0.2;
        }

        if (blue) {
          resetPose(blue);
          blue.root.position.set(0, 0, 2.2);
          blue.root.rotation.y = Math.PI;
          blue.leftShoulder.rotation.z = 1.0 + Math.sin(t * 8) * 0.3;
          blue.rightShoulder.rotation.z = -1.0 - Math.sin(t * 8) * 0.3;
        }
      }

      // -------------------------------------------------------------
      // PHASE 3: Tier 2 Ascends onto Base Shoulders (6.8s to 10.2s)
      // -------------------------------------------------------------
      else if (t > 6.8 && t <= 10.2) {
        // Base Tier holds strong
        [yellow, green, red].forEach((b) => {
          if (!b) return;
          b.pelvis.position.y = 0.40;
          b.leftHip.rotation.x = -0.45;
          b.leftKnee.rotation.x = 0.65;
          b.rightHip.rotation.x = -0.45;
          b.rightKnee.rotation.x = 0.65;
          b.head.rotation.x = -0.3;
        });

        const climbP = Math.min(1, (t - 6.8) / 2.6);

        // Amber steps up and stands on Yellow & Green's shoulders
        if (amber) {
          resetPose(amber);
          amber.root.position.x = THREE.MathUtils.lerp(-1.6, -0.42, climbP);
          amber.root.position.y = THREE.MathUtils.lerp(0, 1.45, climbP);
          amber.root.position.z = THREE.MathUtils.lerp(0.6, 0.05, climbP);
          amber.root.rotation.y = 0.15;

          if (climbP < 0.95) {
            // Climbing leg motion
            amber.rightHip.rotation.x = -0.8;
            amber.rightKnee.rotation.x = 1.1; // foot high on shoulder
            amber.leftHip.rotation.x = 0.2;
            amber.leftKnee.rotation.x = 0.1;
            amber.leftShoulder.rotation.z = 0.8;
            amber.rightShoulder.rotation.z = -0.8;
          } else {
            // Firm stance on shoulders
            amber.pelvis.position.y = 0.46;
            amber.leftHip.rotation.x = -0.2;
            amber.leftKnee.rotation.x = 0.35;
            amber.rightHip.rotation.x = -0.2;
            amber.rightKnee.rotation.x = 0.35;

            // Locks right arm with Purple
            amber.rightShoulder.rotation.z = -1.1;
            amber.rightElbow.rotation.x = 0.5;
            amber.head.rotation.x = -0.3;
          }
        }

        // Purple steps up and stands on Red & Green's shoulders
        if (purple) {
          resetPose(purple);
          purple.root.position.x = THREE.MathUtils.lerp(1.6, 0.42, climbP);
          purple.root.position.y = THREE.MathUtils.lerp(0, 1.45, climbP);
          purple.root.position.z = THREE.MathUtils.lerp(0.6, 0.05, climbP);
          purple.root.rotation.y = -0.15;

          if (climbP < 0.95) {
            purple.leftHip.rotation.x = -0.8;
            purple.leftKnee.rotation.x = 1.1;
            purple.rightHip.rotation.x = 0.2;
            purple.rightKnee.rotation.x = 0.1;
            purple.leftShoulder.rotation.z = 0.8;
            purple.rightShoulder.rotation.z = -0.8;
          } else {
            purple.pelvis.position.y = 0.46;
            purple.leftHip.rotation.x = -0.2;
            purple.leftKnee.rotation.x = 0.35;
            purple.rightHip.rotation.x = -0.2;
            purple.rightKnee.rotation.x = 0.35;

            // Locks left arm with Amber
            purple.leftShoulder.rotation.z = 1.1;
            purple.leftElbow.rotation.x = 0.5;
            purple.head.rotation.x = -0.3;
          }
        }

        // Bal Gopal steps closer ready to ascend
        if (blue) {
          resetPose(blue);
          const bp = Math.min(1, (t - 7.5) / 2.2);
          blue.root.position.z = THREE.MathUtils.lerp(2.2, 0.8, bp);
          blue.root.rotation.y = Math.PI;
          applyRunningKinematics(blue, t * 10, Math.PI);
        }
      }

      // -------------------------------------------------------------
      // PHASE 4: Bal Gopal Scales to Apex & Prepares Strike (10.2s to 14.2s)
      // -------------------------------------------------------------
      else if (t > 10.2 && t <= 14.2) {
        // Base & Tier 2 hold strong with slight organic tower wobble
        const towerWobble = Math.sin(t * 3.5) * 0.025;

        [yellow, green, red].forEach((b) => {
          if (!b) return;
          b.pelvis.position.y = 0.40;
          b.leftKnee.rotation.x = 0.65;
          b.rightKnee.rotation.x = 0.65;
          b.head.rotation.x = -0.35;
        });

        if (amber) {
          amber.root.position.set(-0.42 + towerWobble, 1.45, 0.05);
          amber.rightShoulder.rotation.z = -1.1;
          amber.head.rotation.x = -0.35;
        }

        if (purple) {
          purple.root.position.set(0.42 + towerWobble, 1.45, 0.05);
          purple.leftShoulder.rotation.z = 1.1;
          purple.head.rotation.x = -0.35;
        }

        // Bal Gopal climbs up
        const climbP = Math.min(1, (t - 10.2) / 2.8);

        if (blue) {
          resetPose(blue);
          blue.root.position.x = towerWobble * 1.5;
          blue.root.position.y = THREE.MathUtils.lerp(0.2, 2.78, climbP);
          blue.root.position.z = THREE.MathUtils.lerp(0.8, 0.05, climbP);
          blue.root.rotation.y = 0;

          if (climbP < 0.92) {
            // Climbing leg motions
            const stepCycle = t * 10;
            blue.leftHip.rotation.x = Math.sin(stepCycle) * 0.7;
            blue.leftKnee.rotation.x = Math.max(0, -Math.sin(stepCycle) * 1.1);
            blue.rightHip.rotation.x = -Math.sin(stepCycle) * 0.7;
            blue.rightKnee.rotation.x = Math.max(0, Math.sin(stepCycle) * 1.1);
            blue.head.rotation.x = -0.4;
          } else {
            // Apex summit reached! Bal Gopal stands tall directly under the Handi!
            blue.pelvis.position.y = 0.52;
            blue.leftKnee.rotation.x = 0.15;
            blue.rightKnee.rotation.x = 0.15;

            // Wind up the strike: Golden stick pulled back high above head!
            const windupP = Math.min(1, (t - 13.0) / 1.2);
            blue.rightShoulder.rotation.z = THREE.MathUtils.lerp(-0.3, -Math.PI * 0.75, windupP);
            blue.rightShoulder.rotation.x = THREE.MathUtils.lerp(0, -0.45, windupP);
            blue.rightElbow.rotation.x = THREE.MathUtils.lerp(0.4, 1.1, windupP);

            // Left arm reaches for balance
            blue.leftShoulder.rotation.z = THREE.MathUtils.lerp(0.3, 0.8, windupP);
            blue.head.rotation.x = -0.55; // Gazing directly at the Handi
            blue.mouth.scale.set(1.5, 1.5, 1);
          }
        }
      }

      // -------------------------------------------------------------
      // PHASE 5: The Strike! (14.2s to 15.0s)
      // -------------------------------------------------------------
      else if (t > 14.2 && t <= 15.0) {
        const strikeP = (t - 14.2) / 0.8;

        if (blue) {
          resetPose(blue);
          blue.root.position.set(0, 2.78, 0.05);

          if (strikeP < 0.3) {
            // Powerful downward & forward strike swing!
            const swingP = strikeP / 0.3;
            blue.rightShoulder.rotation.z = THREE.MathUtils.lerp(-Math.PI * 0.75, -Math.PI * 0.3, swingP);
            blue.rightShoulder.rotation.x = THREE.MathUtils.lerp(-0.45, 0.8, swingP);
            blue.rightElbow.rotation.x = THREE.MathUtils.lerp(1.1, 0.1, swingP);
            blue.torso.rotation.x = 0.25;
            blue.head.rotation.x = -0.3;
          } else {
            // Follow-through and triumphant shout!
            blue.rightShoulder.rotation.z = -Math.PI * 0.65;
            blue.rightShoulder.rotation.x = 0.2;
            blue.leftShoulder.rotation.z = Math.PI * 0.65;
            blue.mouth.scale.set(1.8, 1.8, 1);
            blue.torso.rotation.x = -0.15;
          }
        }
      }

      // -------------------------------------------------------------
      // PHASE 6: Grand Victory Celebration Dance! (15.0s+)
      // -------------------------------------------------------------
      else if (t > 15.0) {
        // Bal Gopal dances at the Apex or jumps joyfully
        if (blue) {
          resetPose(blue);
          const apexJump = Math.abs(Math.sin(elapsed * 8)) * 0.2;
          blue.root.position.set(0, 2.78 + apexJump, 0.05);

          // Both arms high in victory!
          blue.leftShoulder.rotation.z = Math.PI * 0.75 + Math.sin(elapsed * 6) * 0.25;
          blue.rightShoulder.rotation.z = -Math.PI * 0.75 - Math.sin(elapsed * 6) * 0.25;
          blue.leftElbow.rotation.x = 0.3;
          blue.rightElbow.rotation.x = 0.3;
          blue.mouth.scale.set(1.7, 1.7, 1);
          blue.head.rotation.y = Math.sin(elapsed * 4) * 0.2;
        }

        // Amber and Purple cheer with arms in the air
        if (amber) {
          resetPose(amber);
          amber.root.position.set(-0.42, 1.45 + Math.abs(Math.sin(elapsed * 7 + 1)) * 0.15, 0.05);
          amber.leftShoulder.rotation.z = Math.PI * 0.65 + Math.sin(elapsed * 8) * 0.2;
          amber.rightShoulder.rotation.z = -Math.PI * 0.65 - Math.sin(elapsed * 8) * 0.2;
          amber.mouth.scale.set(1.5, 1.5, 1);
        }

        if (purple) {
          resetPose(purple);
          purple.root.position.set(0.42, 1.45 + Math.abs(Math.sin(elapsed * 7 + 2)) * 0.15, 0.05);
          // Purple plays rhythmic Dholak!
          purple.leftShoulder.rotation.x = -0.5;
          purple.leftElbow.rotation.x = 0.8 + Math.sin(elapsed * 16) * 0.35;
          purple.rightShoulder.rotation.x = -0.5;
          purple.rightElbow.rotation.x = 0.8 - Math.sin(elapsed * 16) * 0.35;
          purple.head.rotation.x = Math.sin(elapsed * 8) * 0.15;
          purple.mouth.scale.set(1.5, 1.5, 1);
        }

        // Base Tier celebrates with rhythmic knee bends & raised hands
        [yellow, green, red].forEach((b, idx) => {
          if (!b) return;
          resetPose(b);
          const bounce = Math.abs(Math.sin(elapsed * 6 + idx)) * 0.12;
          b.pelvis.position.y = 0.40 + bounce;
          b.leftShoulder.rotation.z = Math.PI * 0.5 + Math.sin(elapsed * 7 + idx) * 0.2;
          b.rightShoulder.rotation.z = -Math.PI * 0.5 - Math.sin(elapsed * 7 + idx) * 0.2;
          b.mouth.scale.set(1.6, 1.6, 1);
        });
      }

      // 3. CAMERA LOGIC
      // Smooth orbit + cinematic focus tracking
      if (!isDraggingRef.current) {
        let targetRadius = 9.8;
        let targetLookY = 2.6;

        if (t > 10.2 && t <= 15.0) {
          // Track Bal Gopal climbing to apex
          targetRadius = 8.5;
          targetLookY = 3.6;
        } else if (t > 15.0) {
          // Pull back slightly to view full celebration
          targetRadius = 10.5;
          targetLookY = 2.8;
        }

        orbitAnglesRef.current.radius = THREE.MathUtils.lerp(
          orbitAnglesRef.current.radius,
          targetRadius,
          delta * 2
        );
      }

      // Calculate camera position from spherical angles
      const { theta, phi, radius } = orbitAnglesRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi) + 1.2;
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);

      camera.lookAt(0, 2.5, 0);

      // Render Frame
      renderer.render(scene, camera);
    };

    renderLoop();

    // CLEANUP
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
