import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import helvetikerBoldJson from 'three/examples/fonts/helvetiker_bold.typeface.json';
import RAPIER from '@dimforge/rapier3d-compat';
import gsap from 'gsap';

interface HeroKeychain3DProps {
  reducedMotion: boolean;
  startEntrance: boolean;
  onSceneReady: () => void;
}

interface CharmSpec {
  id: 'cassette' | 'beads' | 'pearl' | 'letterD' | 'key';
  thetaDeg: number;
  phiDeg: number;
  spawnZ: number;
  collider: { type: 'cuboid'; hx: number; hy: number; hz: number } | { type: 'ball'; r: number };
  density: number;
  offset: number;
  linkCount: number;
  ropeLen: number;
  isBeadChain?: boolean;
}

const CHARM_SPECS: CharmSpec[] = [
  {
    id: 'cassette',
    thetaDeg: -50,
    phiDeg: -64,
    spawnZ: -0.2,
    collider: { type: 'cuboid', hx: 0.42, hy: 0.52, hz: 0.15 },
    density: 1.4,
    offset: 0.64,
    linkCount: 8,
    ropeLen: 0.06,
  },
  {
    id: 'beads',
    thetaDeg: -18,
    phiDeg: -16,
    spawnZ: 0.4,
    collider: { type: 'ball', r: 0.12 },
    density: 30,
    offset: 0.22,
    linkCount: 9,
    ropeLen: 0.135,
    isBeadChain: true,
  },
  {
    id: 'pearl',
    thetaDeg: 10,
    phiDeg: 6,
    spawnZ: 0.45,
    collider: { type: 'cuboid', hx: 0.5, hy: 0.5, hz: 0.12 },
    density: 1.4,
    offset: 0.62,
    linkCount: 9,
    ropeLen: 0.06,
  },
  {
    id: 'letterD',
    thetaDeg: 44,
    phiDeg: 52,
    spawnZ: 0.55,
    collider: { type: 'cuboid', hx: 0.42, hy: 0.48, hz: 0.12 },
    density: 1.4,
    offset: 0.6,
    linkCount: 10,
    ropeLen: 0.06,
  },
  {
    id: 'key',
    thetaDeg: 84,
    phiDeg: 88,
    spawnZ: -0.25,
    collider: { type: 'cuboid', hx: 0.22, hy: 0.64, hz: 0.05 },
    density: 4,
    offset: 0.7,
    linkCount: 9,
    ropeLen: 0.06,
  },
];

const mkGroup = (member: number, filter: number) =>
  (((member & 0xffff) << 16) | (filter & 0xffff)) >>> 0;

const G_NONE = 0;
const G_TAGS = 1 << 1;
const G_CHAIN = 1 << 2;

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const IDENTITY_QUAT = new THREE.Quaternion();
const UP_VECTOR = new THREE.Vector3(0, 1, 0);

function createHolographicTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 256, 320);
  const stops = ['#b8f1ff', '#c9b8ff', '#ffc2ec', '#fff1b8', '#b8ffd9', '#9fc4ff', '#e2b8ff'];
  stops.forEach((col, i) => grad.addColorStop(i / (stops.length - 1), col));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 320);

  // Deterministic pseudo-random soft holographic ellipses
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 26; i++) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#8fa0ff';
    ctx.beginPath();
    ctx.ellipse(
      rand() * 256,
      rand() * 320,
      18 + rand() * 48,
      10 + rand() * 30,
      rand() * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeLoopMesh(material: THREE.Material, y: number, radius = 0.075): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.0225, 14, 28), material);
  mesh.rotation.y = Math.PI / 2;
  mesh.position.y = y;
  return mesh;
}

function buildCharmMesh(
  id: CharmSpec['id'],
  loopMat: THREE.Material,
  font: ReturnType<FontLoader['parse']>,
  disposables: { geometries: THREE.BufferGeometry[]; materials: THREE.Material[]; textures: THREE.Texture[] }
): THREE.Group {
  const group = new THREE.Group();

  if (id === 'cassette') {
    const shellGeo = new RoundedBoxGeometry(0.8, 1.02, 0.15, 5, 0.06);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0xe9eeff,
      roughness: 0.08,
      transmission: 1,
      thickness: 0.35,
      ior: 1.42,
      iridescence: 1,
      iridescenceIOR: 1.7,
      iridescenceThicknessRange: [180, 820],
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);

    const holoTex = createHolographicTexture();
    const labelGeo = new RoundedBoxGeometry(0.58, 0.8, 0.05, 3, 0.03);
    const labelMat = new THREE.MeshPhysicalMaterial({
      map: holoTex,
      metalness: 0.45,
      roughness: 0.18,
      iridescence: 1,
      iridescenceIOR: 1.9,
      iridescenceThicknessRange: [250, 900],
      clearcoat: 1,
    });
    const label = new THREE.Mesh(labelGeo, labelMat);

    const winGeo = new RoundedBoxGeometry(0.2, 0.5, 0.07, 3, 0.02);
    const winMat = new THREE.MeshPhysicalMaterial({
      color: 0x2a3a8c,
      metalness: 0.3,
      roughness: 0.25,
      clearcoat: 1,
    });
    const win = new THREE.Mesh(winGeo, winMat);

    const reelGeo = new THREE.TorusGeometry(0.07, 0.026, 14, 28);
    const reelTop = new THREE.Mesh(reelGeo, loopMat);
    reelTop.position.set(0, 0.17, 0.03);
    const reelBot = new THREE.Mesh(reelGeo, loopMat);
    reelBot.position.set(0, -0.17, 0.03);

    const loop = makeLoopMesh(loopMat, 0.59);
    group.add(shell, label, win, reelTop, reelBot, loop);

    disposables.geometries.push(shellGeo, labelGeo, winGeo, reelGeo, loop.geometry);
    disposables.materials.push(shellMat, labelMat, winMat);
    disposables.textures.push(holoTex);
  } else if (id === 'beads') {
    const beadGeo = new THREE.SphereGeometry(0.085, 24, 24);
    const beadMat = new THREE.MeshPhysicalMaterial({
      color: 0x1430e0,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    });
    const bead = new THREE.Mesh(beadGeo, beadMat);
    group.add(bead);
    disposables.geometries.push(beadGeo);
    disposables.materials.push(beadMat);
  } else if (id === 'pearl') {
    const pearlGeo = new THREE.TorusGeometry(0.33, 0.15, 36, 72);
    const pearlMat = new THREE.MeshPhysicalMaterial({
      color: 0xf7f4f2,
      metalness: 0.05,
      roughness: 0.26,
      iridescence: 0.9,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [300, 700],
      sheen: 1,
      sheenColor: new THREE.Color(0xffe6f6),
      sheenRoughness: 0.4,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    });
    const pearl = new THREE.Mesh(pearlGeo, pearlMat);
    const loop = makeLoopMesh(loopMat, 0.56);
    group.add(pearl, loop);
    disposables.geometries.push(pearlGeo, loop.geometry);
    disposables.materials.push(pearlMat);
  } else if (id === 'letterD') {
    const textGeo = new TextGeometry('D', {
      font,
      size: 0.74,
      depth: 0.1,
      curveSegments: 10,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.055,
      bevelSegments: 8,
    });
    textGeo.center();
    const dMat = new THREE.MeshPhysicalMaterial({
      color: 0xff5512,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    });
    const dMesh = new THREE.Mesh(textGeo, dMat);
    const loop = makeLoopMesh(loopMat, 0.54);
    group.add(dMesh, loop);
    disposables.geometries.push(textGeo, loop.geometry);
    disposables.materials.push(dMat);
  } else if (id === 'key') {
    const shape = new THREE.Shape();
    const bowStart = -0.32 * Math.PI;
    const bowEnd = 1.32 * Math.PI;
    shape.absarc(0, 0.36, 0.21, bowStart, bowEnd, false);
    shape.lineTo(-0.06, 0.12);
    shape.lineTo(-0.06, -0.62);
    shape.lineTo(0.01, -0.7);
    shape.lineTo(0.06, -0.66);
    shape.lineTo(0.11, -0.6);
    shape.lineTo(0.065, -0.52);
    shape.lineTo(0.11, -0.45);
    shape.lineTo(0.065, -0.37);
    shape.lineTo(0.11, -0.3);
    shape.lineTo(0.065, -0.22);
    shape.lineTo(0.11, -0.14);
    shape.lineTo(0.06, -0.08);
    shape.lineTo(0.06, 0.12);
    shape.closePath();

    const hole = new THREE.Path();
    hole.absarc(0, 0.44, 0.055, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const keyGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.045,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 3,
      curveSegments: 28,
    });
    keyGeo.translate(0, 0.065, -0.0225);

    const keyMat = new THREE.MeshPhysicalMaterial({
      color: 0xe4e6ea,
      metalness: 1,
      roughness: 0.16,
      clearcoat: 0.4,
    });
    const keyMesh = new THREE.Mesh(keyGeo, keyMat);
    const loop = makeLoopMesh(loopMat, 0.6, 0.07);
    group.add(keyMesh, loop);
    disposables.geometries.push(keyGeo, loop.geometry);
    disposables.materials.push(keyMat);
  }

  return group;
}

function clampBodyYaw(body: RAPIER.RigidBody, limitRad: number, easeToIdentity: boolean) {
  const rot = body.rotation();
  const q = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  const yaw = Math.atan2(fwd.x, fwd.z);
  let changed = false;

  if (Math.abs(yaw) > limitRad) {
    const delta = Math.sign(yaw) * limitRad - yaw;
    const fix = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, delta);
    q.premultiply(fix);
    const av = body.angvel();
    body.setAngvel({ x: av.x, y: 0, z: av.z }, false);
    changed = true;
  }

  if (easeToIdentity && !body.isSleeping()) {
    q.slerp(IDENTITY_QUAT, 0.001);
    changed = true;
  }

  if (changed) {
    body.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, false);
  }
}

export function HeroKeychain3D({
  reducedMotion,
  startEntrance,
  onSceneReady,
}: HeroKeychain3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const entranceStartedRef = useRef(false);
  const entranceTriggerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (startEntrance && !entranceStartedRef.current && entranceTriggerRef.current) {
      entranceStartedRef.current = true;
      entranceTriggerRef.current();
    }
  }, [startEntrance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let rafId = 0;
    let isVisible = true;
    let entranceTimeline: gsap.core.Timeline | null = null;

    const disposables = {
      geometries: [] as THREE.BufferGeometry[],
      materials: [] as THREE.Material[],
      textures: [] as THREE.Texture[],
    };

    const cleanupFns: (() => void)[] = [];

    async function initScene() {
      await RAPIER.init();
      if (disposed || !canvas) return;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0xe3e9f2, 0);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 1.05;

      const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
      rimLight.position.set(-29, -14.8, -35);
      rimLight.target.position.set(0, 2.2, 0);
      scene.add(rimLight, rimLight.target);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
      keyLight.position.set(6, 10, 12);
      scene.add(keyLight);

      const cameraRig = new THREE.Group();
      cameraRig.position.set(0, reducedMotion ? 0 : -4, 10);
      scene.add(cameraRig);

      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 500);
      cameraRig.add(camera);

      const updateSize = () => {
        const parent = canvas.parentElement;
        const w = parent ? parent.clientWidth : window.innerWidth;
        const h = parent ? parent.clientHeight : window.innerHeight;
        if (w <= 0 || h <= 0) return;
        const aspect = w / h;
        renderer.setSize(w, h, false);
        camera.aspect = aspect;
        if (aspect >= 0.9) {
          camera.position.set(0, 1.06, -4.4);
        } else {
          camera.position.set(0, -0.8, 3.6);
        }
        camera.updateProjectionMatrix();
      };
      updateSize();

      // Shared materials
      const steelLoopMat = new THREE.MeshPhysicalMaterial({
        color: 0xcfd3da,
        metalness: 1,
        roughness: 0.18,
      });
      const ovalChainMat = new THREE.MeshPhysicalMaterial({
        color: 0xa9afba,
        metalness: 1,
        roughness: 0.2,
      });
      const beadChainMat = new THREE.MeshPhysicalMaterial({
        color: 0x1430e0,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
      });
      disposables.materials.push(steelLoopMat, ovalChainMat, beadChainMat);

      // Main keyring at (0, 3.2, 0)
      const mainRingGeo = new THREE.TorusGeometry(0.5, 0.04, 24, 64);
      const mainRingMesh = new THREE.Mesh(mainRingGeo, steelLoopMat);
      mainRingMesh.position.set(0, 3.2, 0);
      scene.add(mainRingMesh);
      disposables.geometries.push(mainRingGeo);

      const startRingGeo = new THREE.TorusGeometry(0.12, 0.0144, 12, 28);
      startRingGeo.rotateY(Math.PI / 2);
      const endRingGeo = new THREE.TorusGeometry(0.08, 0.0144, 12, 24);
      endRingGeo.rotateY(Math.PI / 2);
      const ovalLinkGeo = new THREE.TorusGeometry(0.062, 0.02, 12, 24);
      ovalLinkGeo.scale(1, 1.5, 1);
      const beadLinkGeo = new THREE.SphereGeometry(0.068, 18, 18);
      disposables.geometries.push(startRingGeo, endRingGeo, ovalLinkGeo, beadLinkGeo);

      // Parse bundled typeface JSON for the 3D "D"
      const font = new FontLoader().parse(helvetikerBoldJson as never);

      // Rapier Physics World
      const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
      world.timestep = 1 / 60;

      interface ChainRuntime {
        startRing: RAPIER.RigidBody;
        startRingMesh: THREE.Mesh;
        endRing: RAPIER.RigidBody;
        endRingMesh: THREE.Mesh;
        links: RAPIER.RigidBody[];
        linkInstanced: THREE.InstancedMesh;
        smoothedDirs: THREE.Vector3[];
        isBeadChain: boolean;
        charmBody: RAPIER.RigidBody;
        charmMesh: THREE.Group;
      }

      const chains: ChainRuntime[] = [];
      const allDynamicBodies: RAPIER.RigidBody[] = [];

      for (const spec of CHARM_SPECS) {
        const thetaRad = THREE.MathUtils.degToRad(spec.thetaDeg - 90);
        const base = new THREE.Vector3(
          0.5 * Math.cos(thetaRad),
          3.2 + 0.5 * Math.sin(thetaRad),
          0
        );

        const anchor = world.createRigidBody(
          RAPIER.RigidBodyDesc.fixed().setTranslation(base.x, base.y, base.z)
        );

        const startRing = world.createRigidBody(
          RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(base.x, base.y, base.z)
            .setLinearDamping(2.3)
            .setAngularDamping(2.9)
            .setCanSleep(true)
        );
        world.createCollider(
          RAPIER.ColliderDesc.cuboid(0.12 * 0.12, 0.12, 0.12)
            .setDensity(5)
            .setCollisionGroups(mkGroup(G_CHAIN, G_TAGS | G_CHAIN)),
          startRing
        );
        world.createImpulseJoint(
          RAPIER.JointData.spherical({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }),
          anchor,
          startRing,
          true
        );
        const startRingMesh = new THREE.Mesh(startRingGeo, steelLoopMat);
        scene.add(startRingMesh);
        allDynamicBodies.push(startRing);

        const links: RAPIER.RigidBody[] = [];
        const smoothedDirs: THREE.Vector3[] = [];

        for (let i = 0; i < spec.linkCount; i++) {
          const linkBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
              .setTranslation(base.x + 0.5, base.y, base.z)
              .setLinearDamping(2.3)
              .setAngularDamping(2.9)
              .setCanSleep(true)
          );
          world.createCollider(
            RAPIER.ColliderDesc.ball(0.1)
              .setDensity(1)
              .setCollisionGroups(mkGroup(G_CHAIN, G_NONE)),
            linkBody
          );
          if (i === 0) {
            world.createImpulseJoint(
              RAPIER.JointData.spherical({ x: 0, y: -0.12, z: 0 }, { x: 0, y: 0, z: 0 }),
              startRing,
              linkBody,
              true
            );
          } else {
            world.createImpulseJoint(
              RAPIER.JointData.rope(spec.ropeLen, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }),
              links[i - 1],
              linkBody,
              true
            );
          }
          links.push(linkBody);
          smoothedDirs.push(new THREE.Vector3(0, -1, 0));
          allDynamicBodies.push(linkBody);
        }

        const endRing = world.createRigidBody(
          RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(base.x, base.y, base.z)
            .setLinearDamping(2.3)
            .setAngularDamping(2.9)
            .setCanSleep(true)
        );
        world.createCollider(
          RAPIER.ColliderDesc.cuboid(0.08 * 0.12, 0.08, 0.08)
            .setDensity(5)
            .setCollisionGroups(mkGroup(G_CHAIN, G_TAGS | G_CHAIN)),
          endRing
        );
        world.createImpulseJoint(
          RAPIER.JointData.spherical({ x: 0, y: -0.08, z: 0 }, { x: 0, y: 0, z: 0 }),
          links[links.length - 1],
          endRing,
          true
        );
        const endRingMesh = new THREE.Mesh(endRingGeo, steelLoopMat);
        scene.add(endRingMesh);
        allDynamicBodies.push(endRing);

        const charmBody = world.createRigidBody(
          RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(base.x, base.y, spec.spawnZ)
            .setLinearDamping(2.3)
            .setAngularDamping(2.9)
            .setCanSleep(true)
        );
        const charmColliderDesc =
          spec.collider.type === 'cuboid'
            ? RAPIER.ColliderDesc.cuboid(spec.collider.hx, spec.collider.hy, spec.collider.hz)
            : RAPIER.ColliderDesc.ball(spec.collider.r);
        world.createCollider(
          charmColliderDesc.setDensity(spec.density).setCollisionGroups(mkGroup(G_TAGS, G_TAGS)),
          charmBody
        );

        world.createImpulseJoint(
          RAPIER.JointData.fixed(
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 0, z: 0, w: 1 },
            { x: 0, y: spec.offset, z: 0 },
            { x: 0, y: 0, z: 0, w: 1 }
          ),
          endRing,
          charmBody,
          true
        );

        const phiRad = THREE.MathUtils.degToRad(spec.phiDeg - 90);
        charmBody.addForce(
          {
            x: 0.7 * Math.cos(phiRad),
            y: 0.7 * Math.sin(phiRad),
            z: spec.spawnZ,
          },
          true
        );
        allDynamicBodies.push(charmBody);

        const linkInstanced = new THREE.InstancedMesh(
          spec.isBeadChain ? beadLinkGeo : ovalLinkGeo,
          spec.isBeadChain ? beadChainMat : ovalChainMat,
          spec.linkCount
        );
        linkInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(linkInstanced);

        const charmMesh = buildCharmMesh(spec.id, steelLoopMat, font, disposables);
        scene.add(charmMesh);

        chains.push({
          startRing,
          startRingMesh,
          endRing,
          endRingMesh,
          links,
          linkInstanced,
          smoothedDirs,
          isBeadChain: Boolean(spec.isBeadChain),
          charmBody,
          charmMesh,
        });
      }

      const syncMeshes = (dt: number) => {
        const dummy = new THREE.Object3D();
        const twistQuat = new THREE.Quaternion();
        const alignQuat = new THREE.Quaternion();
        const targetDir = new THREE.Vector3();
        const pCurr = new THREE.Vector3();
        const pOther = new THREE.Vector3();
        const lerpAlpha = Math.min(1, 10 * dt);

        for (const chain of chains) {
          const srP = chain.startRing.translation();
          const srR = chain.startRing.rotation();
          chain.startRingMesh.position.set(srP.x, srP.y, srP.z);
          chain.startRingMesh.quaternion.set(srR.x, srR.y, srR.z, srR.w);

          const erP = chain.endRing.translation();
          const erR = chain.endRing.rotation();
          chain.endRingMesh.position.set(erP.x, erP.y, erP.z);
          chain.endRingMesh.quaternion.set(erR.x, erR.y, erR.z, erR.w);

          const chP = chain.charmBody.translation();
          const chR = chain.charmBody.rotation();
          chain.charmMesh.position.set(chP.x, chP.y, chP.z);
          chain.charmMesh.quaternion.set(chR.x, chR.y, chR.z, chR.w);

          for (let i = 0; i < chain.links.length; i++) {
            const tCurr = chain.links[i].translation();
            pCurr.set(tCurr.x, tCurr.y, tCurr.z);

            if (i < chain.links.length - 1) {
              const tNext = chain.links[i + 1].translation();
              pOther.set(tNext.x, tNext.y, tNext.z);
              targetDir.subVectors(pOther, pCurr);
            } else {
              const tPrev = chain.links[i - 1].translation();
              pOther.set(tPrev.x, tPrev.y, tPrev.z);
              targetDir.subVectors(pCurr, pOther);
            }

            if (targetDir.lengthSq() > 1e-6) {
              targetDir.normalize();
              chain.smoothedDirs[i].lerp(targetDir, lerpAlpha).normalize();
            }

            alignQuat.setFromUnitVectors(UP_VECTOR, chain.smoothedDirs[i]);
            if (!chain.isBeadChain) {
              const twistDeg = i * 16 + (i % 2 === 1 ? 90 : 0);
              twistQuat.setFromAxisAngle(UP_VECTOR, THREE.MathUtils.degToRad(twistDeg));
              alignQuat.multiply(twistQuat);
            }

            dummy.position.copy(pCurr);
            dummy.quaternion.copy(alignQuat);
            dummy.updateMatrix();
            chain.linkInstanced.setMatrixAt(i, dummy.matrix);
          }
          chain.linkInstanced.instanceMatrix.needsUpdate = true;
        }
      };

      // Mouse push field on z = 0 plane
      const pointerNDC = new THREE.Vector2();
      let pointerInside = false;
      const raycaster = new THREE.Raycaster();
      const zZeroPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const hitPoint = new THREE.Vector3();

      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          pointerInside = true;
          pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        } else {
          pointerInside = false;
        }
      };
      const onPointerLeave = () => {
        pointerInside = false;
      };

      if (!reducedMotion) {
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.addEventListener('mouseleave', onPointerLeave);
        cleanupFns.push(() => {
          window.removeEventListener('pointermove', onPointerMove);
          document.removeEventListener('mouseleave', onPointerLeave);
        });
      }

      const deg15 = THREE.MathUtils.degToRad(15);
      const deg12 = THREE.MathUtils.degToRad(12);

      if (reducedMotion) {
        for (const b of allDynamicBodies) b.setGravityScale(1, true);
        for (let i = 0; i < 240; i++) {
          world.step();
          for (const chain of chains) {
            clampBodyYaw(chain.startRing, deg15, false);
            clampBodyYaw(chain.endRing, deg12, false);
            clampBodyYaw(chain.charmBody, deg12, false);
          }
        }
        syncMeshes(1);
        renderer.render(scene, camera);
        onSceneReady();
      } else {
        // Pre-settle slightly at initial rest or start floating for entrance
        for (const b of allDynamicBodies) b.setGravityScale(-0.25, true);
        world.step();
        syncMeshes(1);
        renderer.render(scene, camera);
        onSceneReady();

        const triggerEntrance = () => {
          const state = { progress: 0 };
          let dropped = false;
          entranceTimeline = gsap.timeline({
            defaults: { duration: 1.5, delay: 0.5, ease: 'elastic.out(1, 1)' },
          });
          entranceTimeline.to(cameraRig.position, { y: 0 }, 0);
          entranceTimeline.to(
            state,
            {
              progress: 1,
              onUpdate: () => {
                if (state.progress >= 0.995 && !dropped) {
                  dropped = true;
                  for (const b of allDynamicBodies) b.setGravityScale(1, true);
                } else if (!dropped) {
                  for (const b of allDynamicBodies) b.setGravityScale(-0.25, true);
                }
              },
              onComplete: () => {
                for (const b of allDynamicBodies) b.setGravityScale(1, true);
              },
            },
            0
          );
        };

        entranceTriggerRef.current = triggerEntrance;
        if (startEntrance && !entranceStartedRef.current) {
          entranceStartedRef.current = true;
          triggerEntrance();
        }
      }

      const heroEl = canvas.parentElement;
      const io = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.01 }
      );
      if (heroEl) io.observe(heroEl);
      cleanupFns.push(() => io.disconnect());

      const ro = new ResizeObserver(() => {
        updateSize();
        if (reducedMotion) renderer.render(scene, camera);
      });
      if (heroEl) ro.observe(heroEl);
      cleanupFns.push(() => ro.disconnect());

      let lastTime = performance.now();
      let accumulator = 0;
      const FIXED_DT = 1 / 60;

      const animate = (now: number) => {
        if (disposed) return;
        rafId = requestAnimationFrame(animate);

        const rawDt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;

        if (!isVisible || reducedMotion) return;

        accumulator += rawDt;
        while (accumulator >= FIXED_DT) {
          if (pointerInside) {
            raycaster.setFromCamera(pointerNDC, camera);
            if (raycaster.ray.intersectPlane(zZeroPlane, hitPoint)) {
              for (const chain of chains) {
                const t = chain.charmBody.translation();
                const dx = t.x - hitPoint.x;
                const dy = t.y - hitPoint.y;
                const dz = t.z - hitPoint.z;
                const d = Math.hypot(dx, dy, dz);
                if (d > 0.0001 && d < 2) {
                  const factor = (4.4 * Math.pow(1 - d / 2, 2) * FIXED_DT) / d;
                  chain.charmBody.applyImpulse(
                    { x: dx * factor, y: dy * factor, z: dz * factor },
                    true
                  );
                }
              }
            }
          }

          world.step();
          accumulator -= FIXED_DT;
        }

        for (const chain of chains) {
          clampBodyYaw(chain.startRing, deg15, false);
          clampBodyYaw(chain.endRing, deg12, false);
          clampBodyYaw(chain.charmBody, deg12, true);
        }

        syncMeshes(rawDt);
        renderer.render(scene, camera);
      };

      if (!reducedMotion) {
        rafId = requestAnimationFrame(animate);
      }

      cleanupFns.push(() => {
        cancelAnimationFrame(rafId);
        entranceTimeline?.kill();
        world.free();
        envRT.dispose();
        pmrem.dispose();
        disposables.geometries.forEach((g) => g.dispose());
        disposables.materials.forEach((m) => m.dispose());
        disposables.textures.forEach((t) => t.dispose());
        renderer.dispose();
      });
    }

    initScene().catch(() => {
      onSceneReady();
    });

    return () => {
      disposed = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="deome-hero-canvas" aria-hidden="true" />;
}
