/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { 
  Shield, 
  Activity, 
  Award, 
  Clock, 
  Crosshair, 
  Terminal, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Zap, 
  Flame, 
  Wifi, 
  Cpu, 
  AlertTriangle 
} from "lucide-react";

// Types for Game State Management
interface Tower {
  mesh: THREE.Mesh;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

interface Enemy {
  group: THREE.Group;
  core: THREE.Mesh;
  outerRing: THREE.Mesh;
  speed: number;
  baseY: number;
  floatOffset: number;
  id: number;
}

interface Bullet {
  mesh: THREE.Mesh;
  origin: THREE.Vector3;
  target: THREE.Vector3;
  progress: number; // 0 to 1
  duration: number;
  objectHit: THREE.Object3D | null;
}

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface BlinkingLed {
  mesh: THREE.Mesh;
  blinkSpeed: number;
  phase: number;
}

// Procedural Audio Synthesizer Class
class SoundSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  constructor() {
    // Audio Context is initialized on first user interaction
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public playLaser() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playExplosion() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Sub-bass thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Digital glitch noise
    const noiseOsc = this.ctx.createOscillator();
    const noiseGain = this.ctx.createGain();
    noiseOsc.type = "sawtooth";
    noiseOsc.frequency.setValueAtTime(2000, this.ctx.currentTime);
    noiseOsc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.2);

    noiseGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    noiseOsc.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);

    noiseOsc.start();
    noiseOsc.stop(this.ctx.currentTime + 0.2);
  }

  public playDamage() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public playAccessGranted() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [329.63, 392.00, 523.25, 659.25]; // E4, G4, C5, E5 (rising cyber chords)

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  public playGameOver() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440.00, 392.00, 349.23, 261.63]; // A4, G4, F4, C4 (descending disconnect sequence)

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.15 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.45);
    });
  }
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Sound Engine Instance
  const synthRef = useRef<SoundSynth>(new SoundSynth());
  const [muted, setMuted] = useState(false);

  // Game UI State
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("cyber_shooter_high_score");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [health, setHealth] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isLocked, setIsLocked] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);
  
  // Dynamic statistics for hacker feeling
  const [playerCoords, setPlayerCoords] = useState({ x: 0, z: 0 });
  const [connectionStability, setConnectionStability] = useState(99.4);
  const [activeThreats, setActiveThreats] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "DECK STATS: ONLINE",
    "CYBERSPACE PORTAL INSTANTIATED",
    "GRID ENGINE v9.4 LOADED SUCCESS",
    "BREACH PROTOCOL PENDING..."
  ]);

  // Three.js and Gameplay Refs (to run at 60fps without React-overhead state lag)
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const controlsRef = useRef<PointerLockControls | null>(null);
  
  const towers = useRef<Tower[]>([]);
  const enemies = useRef<Enemy[]>([]);
  const projectiles = useRef<Bullet[]>([]);
  const particles = useRef<Particle[]>([]);
  const blinkingLeds = useRef<BlinkingLed[]>([]);

  const keys = useRef<{ [key: string]: boolean }>({});
  const weaponGroupRef = useRef<THREE.Group | null>(null);
  const lastShotTime = useRef<number>(0);
  const shotsFired = useRef<number>(0);
  const shotsHit = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const healthRef = useRef<number>(100);
  
  const isJumping = useRef<boolean>(false);
  const playerVelocityY = useRef<number>(0);
  const defaultPlayerHeight = 1.8;
  const gravity = 32;
  const jumpPower = 11.5;

  const animationFrameId = useRef<number | null>(null);
  const isCleaningUp = useRef<boolean>(false);

  // Utility to push hacker terminal log entries
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [
      `[${timestamp}] ${msg}`,
      ...prev.slice(0, 7)
    ]);
  };

  // Toggle audio mute
  const toggleMute = () => {
    const isMuted = !muted;
    setMuted(isMuted);
    synthRef.current.muted = isMuted;
  };

  // Reset Game Logic
  const resetGame = () => {
    scoreRef.current = 0;
    healthRef.current = 100;
    shotsFired.current = 0;
    shotsHit.current = 0;
    
    setScore(0);
    setHealth(100);
    setAccuracy(100);
    setGameOver(false);
    setTimeElapsed(0);
    setActiveThreats(0);

    // Clear and respawn projectiles & particles
    if (sceneRef.current) {
      projectiles.current.forEach(b => {
        sceneRef.current?.remove(b.mesh);
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.Material).dispose();
      });
      projectiles.current = [];

      particles.current.forEach(p => {
        sceneRef.current?.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
      });
      particles.current = [];
    }

    // Reset camera position & locks
    if (cameraRef.current) {
      cameraRef.current.position.set(0, defaultPlayerHeight, 0);
      cameraRef.current.rotation.set(0, 0, 0);
    }
    
    isJumping.current = false;
    playerVelocityY.current = 0;

    // Reset enemies
    spawnAllEnemies();

    synthRef.current.playAccessGranted();
    addLog("ACCESS GRANTED. HOSTILE CORES DETECTED.");
  };

  // Initialize and spawn standard 7 rogue nodes
  const spawnAllEnemies = () => {
    if (!sceneRef.current) return;

    // Clear old enemies first
    enemies.current.forEach(e => {
      sceneRef.current?.remove(e.group);
      e.core.geometry.dispose();
      (e.core.material as THREE.Material).dispose();
      e.outerRing.geometry.dispose();
      (e.outerRing.material as THREE.Material).dispose();
    });
    enemies.current = [];

    const enemyCount = 7;
    for (let i = 0; i < enemyCount; i++) {
      spawnEnemy(i);
    }
    setActiveThreats(enemyCount);
  };

  const spawnEnemy = (id: number) => {
    if (!sceneRef.current) return;

    const group = new THREE.Group();

    // Core Geometry - Octahedron
    const coreGeom = new THREE.OctahedronGeometry(1.0, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff3300,
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.8,
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    group.add(core);

    // Outer Wireframe Orbital Rings
    const ringGeom = new THREE.TorusGeometry(1.5, 0.05, 8, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0055,
      emissiveIntensity: 1.5,
      wireframe: true
    });
    const outerRing = new THREE.Mesh(ringGeom, ringMat);
    outerRing.rotation.x = Math.random() * Math.PI;
    outerRing.rotation.y = Math.random() * Math.PI;
    group.add(outerRing);

    // Initial random placement far from starting player point (0, 0)
    let rx = 0, rz = 0;
    while (Math.sqrt(rx * rx + rz * rz) < 22) {
      rx = (Math.random() - 0.5) * 150;
      rz = (Math.random() - 0.5) * 150;
    }
    const ry = 2.5 + Math.random() * 5.0; // Float height

    group.position.set(rx, ry, rz);
    
    // Add user data to easily identify via raycasting
    group.userData = { type: "enemy", id };
    core.userData = { type: "enemy", id };
    outerRing.userData = { type: "enemy", id };

    sceneRef.current.add(group);

    enemies.current.push({
      group,
      core,
      outerRing,
      speed: 3.2 + Math.random() * 2.0, // Floating chasing speed
      baseY: ry,
      floatOffset: Math.random() * Math.PI * 2,
      id
    });
  };

  // Trigger hit particle effect
  const createExplosion = (pos: THREE.Vector3, isNodeHit: boolean) => {
    if (!sceneRef.current) return;

    const count = isNodeHit ? 22 : 8;
    const color = isNodeHit ? 0xff3300 : 0x00f0ff;
    const size = isNodeHit ? 0.18 : 0.08;

    const geom = new THREE.BoxGeometry(size, size, size);
    
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 3.0,
        roughness: 0.1,
        metalness: 0.9,
      });
      const pMesh = new THREE.Mesh(geom, mat);
      pMesh.position.copy(pos);

      // Random explosion velocity
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.2) * 10 + 3, // slightly upward burst
        (Math.random() - 0.5) * 10
      );

      sceneRef.current.add(pMesh);

      particles.current.push({
        mesh: pMesh,
        velocity,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.4,
      });
    }
  };

  // Perform shooting raycast and instantiate visual bullet
  const fireWeapon = () => {
    if (!sceneRef.current || !cameraRef.current) return;

    const now = performance.now();
    if (now - lastShotTime.current < 200) return; // Fire rate limit: 200ms
    lastShotTime.current = now;

    shotsFired.current += 1;
    synthRef.current.playLaser();

    // Trigger gun recoil visual kick-back
    if (weaponGroupRef.current) {
      weaponGroupRef.current.position.z = -0.55; // kick back
    }

    // Set up raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), cameraRef.current);

    // Intersect scene objects
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

    let targetPoint = new THREE.Vector3();
    let hitObject: THREE.Object3D | null = null;
    let isEnemyHit = false;

    // Filter out helper objects and particle elements
    const validIntersects = intersects.filter(item => {
      // Don't collide with other bullets, particles or player weapon mesh
      const isBulletOrParticle = item.object.userData.type === "bullet" || particles.current.some(p => p.mesh === item.object);
      const isWeapon = weaponGroupRef.current?.getObjectById(item.object.id) || item.object === weaponGroupRef.current;
      return !isBulletOrParticle && !isWeapon;
    });

    if (validIntersects.length > 0) {
      const closestHit = validIntersects[0];
      targetPoint.copy(closestHit.point);
      hitObject = closestHit.object;

      // Climb up to identify if this is a Rogue Core node
      let temp: THREE.Object3D | null = hitObject;
      while (temp) {
        if (temp.userData && temp.userData.type === "enemy") {
          isEnemyHit = true;
          hitObject = temp;
          break;
        }
        temp = temp.parent;
      }
    } else {
      // If nothing hit, bullet flies into infinity
      const direction = new THREE.Vector3();
      cameraRef.current.getWorldDirection(direction);
      targetPoint.copy(cameraRef.current.position).add(direction.multiplyScalar(120));
    }

    if (isEnemyHit) {
      shotsHit.current += 1;
    }

    // Calculate accuracy stat
    const currentAcc = Math.round((shotsHit.current / shotsFired.current) * 100);
    setAccuracy(currentAcc);

    // Compute visual bullet spawn point from barrel muzzle tip
    const bulletOrigin = new THREE.Vector3(0.32, -0.28, -0.75);
    bulletOrigin.applyMatrix4(cameraRef.current.matrixWorld);

    // Bullet Geometry (glowing capsule/bullet)
    const bulletGeom = new THREE.SphereGeometry(0.12, 6, 6);
    const bulletMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 4.0,
      roughness: 0.1,
      metalness: 0.9,
    });
    
    const bulletMesh = new THREE.Mesh(bulletGeom, bulletMat);
    bulletMesh.position.copy(bulletOrigin);
    bulletMesh.userData = { type: "bullet" };
    sceneRef.current.add(bulletMesh);

    // Flight duration calculation
    const distance = bulletOrigin.distanceTo(targetPoint);
    const bulletSpeed = 160; // Units per second
    const duration = distance / bulletSpeed;

    projectiles.current.push({
      mesh: bulletMesh,
      origin: bulletOrigin,
      target: targetPoint,
      progress: 0,
      duration,
      objectHit: isEnemyHit ? hitObject : null,
    });
  };

  // Damage handling when getting breached by Rogue Nodes
  const handlePlayerDamage = (damageAmount: number) => {
    if (gameOver) return;

    healthRef.current = Math.max(0, healthRef.current - damageAmount);
    setHealth(healthRef.current);
    setDamageFlash(true);
    synthRef.current.playDamage();
    addLog(`ALARM: VIRUS PENETRATED SHIELD! -${damageAmount}%`);

    setTimeout(() => {
      setDamageFlash(false);
    }, 200);

    if (healthRef.current <= 0) {
      setGameOver(true);
      setIsLocked(false);
      controlsRef.current?.unlock();
      synthRef.current.playGameOver();
      addLog("FIREWALL COMPROMISED. CONNECTION TERMINATED.");

      // Store high score
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        localStorage.setItem("cyber_shooter_high_score", scoreRef.current.toString());
        addLog(`NEW RECORD INJECTED: ${scoreRef.current} PURGES`);
      }
    }
  };

  // Main Three.js Game Setup
  useEffect(() => {
    if (!containerRef.current) return;

    // Create Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Deep atmospheric violet fog fading into endless digital sky
    scene.background = new THREE.Color(0x04010a);
    scene.fog = new THREE.FogExp2(0x04010a, 0.016);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    camera.position.set(0, defaultPlayerHeight, 0);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0f0b26, 1.6);
    scene.add(ambientLight);

    // Bi-color Cyberspace Cyberpunk Direct Spot Lights
    const cyanLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    cyanLight.position.set(20, 40, 20);
    scene.add(cyanLight);

    const pinkLight = new THREE.DirectionalLight(0xff0055, 1.5);
    pinkLight.position.set(-20, 30, -20);
    scene.add(pinkLight);

    // Glowing Neon-Cyan Grid helper (glowing via UnrealBloomPass)
    const gridHelper = new THREE.GridHelper(250, 120, 0x00f0ff, 0x085c6b);
    gridHelper.position.y = 0.01; // Slightly offset above ground
    // Customise materials on grid lines for better glowing bloom response
    if (gridHelper.material instanceof THREE.Material) {
      const mat = gridHelper.material as THREE.LineBasicMaterial;
      mat.transparent = true;
      mat.opacity = 0.45;
    }
    scene.add(gridHelper);

    // Ground reflector plane
    const groundGeom = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x010003,
      roughness: 0.25,
      metalness: 0.95,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Procedural Server Architecture (Sleek Data Towers with blinking server LEDs)
    const activeBlinkingLeds: BlinkingLed[] = [];
    const towersList: Tower[] = [];
    const minStartAreaRadius = 15;

    // 7x7 grid layout with random noise placement
    for (let col = -3; col <= 3; col++) {
      for (let row = -3; row <= 3; row++) {
        const x = col * 24 + (Math.random() - 0.5) * 8;
        const z = row * 24 + (Math.random() - 0.5) * 8;
        
        // Ensure starting region is completely empty
        if (Math.sqrt(x*x + z*z) < minStartAreaRadius) continue;

        const w = 4 + Math.random() * 4;
        const d = 4 + Math.random() * 4;
        const h = 18 + Math.random() * 25;

        const towerGeom = new THREE.BoxGeometry(w, h, d);
        const towerMat = new THREE.MeshStandardMaterial({
          color: 0x080614,
          roughness: 0.1,
          metalness: 0.95,
          emissive: 0x010008,
        });
        const towerMesh = new THREE.Mesh(towerGeom, towerMat);
        towerMesh.position.set(x, h / 2, z);
        scene.add(towerMesh);

        // Populate Blinking Server Racks / LED indicators
        const ledCount = 3 + Math.floor(Math.random() * 5);
        const ledGeom = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const ledColors = [0x00ffcc, 0xff0055, 0x00ff33, 0xffcc00]; // Cyber cyan, magenta, green, orange

        for (let l = 0; l < ledCount; l++) {
          const selectedColor = ledColors[Math.floor(Math.random() * ledColors.length)];
          const ledMat = new THREE.MeshStandardMaterial({
            color: selectedColor,
            emissive: selectedColor,
            emissiveIntensity: 2.5,
            roughness: 0.05,
            metalness: 0.9,
          });
          const ledMesh = new THREE.Mesh(ledGeom, ledMat);

          const selectSide = Math.random() > 0.5;
          const ledY = Math.random() * (h - 2) + 1;

          if (selectSide) {
            const xOffset = w / 2 + 0.06;
            const zOffset = (Math.random() - 0.5) * (d - 1);
            ledMesh.position.set(x + (Math.random() > 0.5 ? xOffset : -xOffset), ledY, z + zOffset);
          } else {
            const zOffset = d / 2 + 0.06;
            const xOffset = (Math.random() - 0.5) * (w - 1);
            ledMesh.position.set(x + xOffset, ledY, z + (Math.random() > 0.5 ? zOffset : -zOffset));
          }
          scene.add(ledMesh);

          activeBlinkingLeds.push({
            mesh: ledMesh,
            blinkSpeed: 1.5 + Math.random() * 4.0,
            phase: Math.random() * Math.PI * 2,
          });
        }

        // Store bounding values for wall collision checks
        towersList.push({
          mesh: towerMesh,
          minX: x - w / 2,
          maxX: x + w / 2,
          minZ: z - d / 2,
          maxZ: z + d / 2,
        });
      }
    }

    towers.current = towersList;
    blinkingLeds.current = activeBlinkingLeds;

    // Add subtle elegant neon light pillars
    const neonColors = [0x00f0ff, 0xff0055, 0x00f0ff, 0xff0055];
    const proposedPillars = [
      {x: -44, z: -44}, {x: 44, z: -44},
      {x: -44, z: 44}, {x: 44, z: 44}
    ];

    proposedPillars.forEach((pos, idx) => {
      // Check distance from existing towers to avoid overlapping
      let tooClose = false;
      for (let t of towersList) {
        const tx = t.mesh.position.x;
        const tz = t.mesh.position.z;
        const dist = Math.sqrt((pos.x - tx) ** 2 + (pos.z - tz) ** 2);
        if (dist < 7.0) {
          tooClose = true;
          break;
        }
      }

      // Shift position slightly if it overlaps with a tower
      let finalX = pos.x;
      let finalZ = pos.z;
      if (tooClose) {
        finalX += (Math.random() - 0.5) * 8;
        finalZ += (Math.random() - 0.5) * 8;
      }

      const color = neonColors[idx % neonColors.length];
      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(finalX, 0, finalZ);

      // Dark metallic base
      const baseGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 8);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x0a0a14, roughness: 0.2, metalness: 0.9 });
      const base = new THREE.Mesh(baseGeom, baseMat);
      base.position.y = 0.3;
      pillarGroup.add(base);

      // Top cap
      const capGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.4, 8);
      const cap = new THREE.Mesh(capGeom, baseMat);
      cap.position.y = 6.8;
      pillarGroup.add(cap);

      // Thin dark metal central support rod
      const rodGeom = new THREE.CylinderGeometry(0.06, 0.06, 6.0, 8);
      const rod = new THREE.Mesh(rodGeom, baseMat);
      rod.position.y = 3.5;
      pillarGroup.add(rod);

      // Glowing neon sleeves
      const neonGeom = new THREE.CylinderGeometry(0.14, 0.14, 5.2, 8);
      const neonMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 2.2,
        transparent: true,
        opacity: 0.9,
        roughness: 0.1
      });
      const neonSleeve = new THREE.Mesh(neonGeom, neonMat);
      neonSleeve.position.y = 3.5;
      pillarGroup.add(neonSleeve);

      // Decorative structural rings around the neon sleeve
      for (let r = 0; r < 3; r++) {
        const ringGeom = new THREE.TorusGeometry(0.18, 0.04, 8, 16);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x11111e, roughness: 0.2, metalness: 0.9 });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 1.8 + r * 1.7;
        pillarGroup.add(ring);
      }

      // Localized PointLight to cast a beautiful neon glow on ground and towers
      const pointLight = new THREE.PointLight(color, 1.2, 20);
      pointLight.position.y = 3.5;
      pillarGroup.add(pointLight);

      scene.add(pillarGroup);
    });

    // Attach First-Person Cyber Blaster Weapon to the camera
    const weaponGroup = new THREE.Group();
    
    // Sleek chrome blaster chassis
    const bodyGeom = new THREE.BoxGeometry(0.18, 0.16, 0.7);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x120f26,
      roughness: 0.12,
      metalness: 0.98,
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    weaponGroup.add(body);

    // Blaster glow barrel core (glowing neon-cyan lines)
    const barrelGeom = new THREE.BoxGeometry(0.04, 0.04, 0.65);
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 4.0,
      roughness: 0.05,
      metalness: 0.9
    });
    const barrelGlow = new THREE.Mesh(barrelGeom, barrelMat);
    barrelGlow.position.set(0, 0.05, -0.05);
    weaponGroup.add(barrelGlow);

    // Decorative cyber capacitor coils on blaster sides
    const coilGeom = new THREE.BoxGeometry(0.22, 0.05, 0.28);
    const coilMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0055,
      emissiveIntensity: 2.0,
    });
    const coil = new THREE.Mesh(coilGeom, coilMat);
    coil.position.set(0, -0.04, 0.05);
    weaponGroup.add(coil);

    // Mount weapon in camera coordinate frame
    weaponGroup.position.set(0.32, -0.28, -0.75);
    camera.add(weaponGroup);
    scene.add(camera); // Camera must be explicitly added to scene when attachments exist
    weaponGroupRef.current = weaponGroup;

    // Post-Processing Pipeline Setup (EffectComposer + RenderPass + UnrealBloomPass)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      2.2,  // Bloom strength (extremely bright glow!)
      0.45, // Radius
      0.1   // Threshold (everything bright glows)
    );

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Pointer Lock Controls Setup
    const controls = new PointerLockControls(camera, renderer.domElement);
    controlsRef.current = controls;

    // Track Pointer Lock Status
    const onLock = () => {
      setIsLocked(true);
      if (!gameStarted) {
        setGameStarted(true);
        resetGame();
      }
    };

    const onUnlock = () => {
      setIsLocked(false);
    };

    controls.addEventListener("lock", onLock);
    controls.addEventListener("unlock", onUnlock);

    // Keyboard controls event binding
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      keys.current[e.code] = true;

      // Handle jump
      if (e.code === "Space" && !isJumping.current && isLocked && !gameOver) {
        isJumping.current = true;
        playerVelocityY.current = jumpPower;
        addLog("DECK AUXILIARY THRUSTER ENGAGED (JUMP)");
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
      keys.current[e.code] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Mouse Fire Binding
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && isLocked && !gameOver) {
        fireWeapon();
      }
    };

    window.addEventListener("mousedown", onMouseDown);

    // Arena sliding boundary collision check
    const checkWallCollision = (pos: THREE.Vector3): boolean => {
      const playerRadius = 0.95; // safe margin
      const boundaryLimit = 115; // stay inside grid arena

      // Check arena outer bounds
      if (Math.abs(pos.x) > boundaryLimit || Math.abs(pos.z) > boundaryLimit) {
        return true;
      }

      // Check towers collision boxes
      for (const tower of towers.current) {
        if (
          pos.x + playerRadius > tower.minX &&
          pos.x - playerRadius < tower.maxX &&
          pos.z + playerRadius > tower.minZ &&
          pos.z - playerRadius < tower.maxZ
        ) {
          return true;
        }
      }

      return false;
    };

    // Frame loops
    const clock = new THREE.Clock();
    let frameIndex = 0;

    const animate = () => {
      if (isCleaningUp.current) return;
      animationFrameId.current = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1); // Clamp delta to avoid massive teleports on lag spikes
      const totalTime = clock.getElapsedTime();

      // Trigger stats ticker at throttled frequency to optimize DOM performance
      frameIndex++;
      if (frameIndex % 8 === 0 && isLocked && !gameOver) {
        setPlayerCoords({
          x: Math.round(camera.position.x * 10) / 10,
          z: Math.round(camera.position.z * 10) / 10,
        });
        setConnectionStability(95.0 + Math.random() * 4.9);
      }

      // Blinking Tower Racks logic
      blinkingLeds.current.forEach(led => {
        const value = Math.sin(totalTime * led.blinkSpeed + led.phase);
        // Emissive pulsating
        if (led.mesh.material instanceof THREE.MeshStandardMaterial) {
          led.mesh.material.emissiveIntensity = value > 0.3 ? 3.0 : 0.1;
        }
      });

      // Update Active Projectiles
      for (let b = projectiles.current.length - 1; b >= 0; b--) {
        const proj = projectiles.current[b];
        proj.progress += delta / proj.duration;

        if (proj.progress >= 1.0) {
          // Bullet arrived at destination
          createExplosion(proj.target, proj.objectHit !== null);

          if (proj.objectHit) {
            // Target was indeed a rogue node!
            const hitId = proj.objectHit.userData.id;
            const nodeIndex = enemies.current.findIndex(e => e.id === hitId);

            if (nodeIndex !== -1) {
              const enemy = enemies.current[nodeIndex];
              scene.remove(enemy.group);
              enemy.core.geometry.dispose();
              (enemy.core.material as THREE.Material).dispose();
              enemy.outerRing.geometry.dispose();
              (enemy.outerRing.material as THREE.Material).dispose();

              enemies.current.splice(nodeIndex, 1);
              scoreRef.current += 1;
              setScore(scoreRef.current);

              synthRef.current.playExplosion();
              addLog(`NODE DESTROYED [ID: 0x${hitId.toString(16).toUpperCase()}]`);

              // Respawn a new rogue node in its place
              spawnEnemy(hitId);
            }
          } else {
            // Bullet hit a tower structure or out-of-bounds
            // Gentle thud sound
          }

          scene.remove(proj.mesh);
          proj.mesh.geometry.dispose();
          (proj.mesh.material as THREE.Material).dispose();
          projectiles.current.splice(b, 1);
        } else {
          // Fly interpolation
          proj.mesh.position.lerpVectors(proj.origin, proj.target, proj.progress);
        }
      }

      // Update explosion particles
      for (let p = particles.current.length - 1; p >= 0; p--) {
        const part = particles.current[p];
        part.life += delta;

        if (part.life >= part.maxLife) {
          scene.remove(part.mesh);
          part.mesh.geometry.dispose();
          (part.mesh.material as THREE.Material).dispose();
          particles.current.splice(p, 1);
        } else {
          // Physics mechanics
          part.mesh.position.add(part.velocity.clone().multiplyScalar(delta));
          part.velocity.y -= 25.0 * delta; // particle gravity pull down
          
          // Shrink over lifespan
          const ratio = 1 - part.life / part.maxLife;
          part.mesh.scale.setScalar(ratio);
        }
      }

      // Update Rogue Nodes animations & movement tracking behaviors
      enemies.current.forEach(enemy => {
        // Rotations
        enemy.core.rotation.x += delta * 1.6;
        enemy.core.rotation.y += delta * 1.1;

        enemy.outerRing.rotation.y -= delta * 0.9;
        enemy.outerRing.rotation.z += delta * 1.3;

        // Bobbing floating sine wave
        enemy.group.position.y = enemy.baseY + Math.sin(totalTime * 3.2 + enemy.floatOffset) * 0.75;

        // Movement tracking Vector logic
        const vectorToPlayer = new THREE.Vector3().subVectors(camera.position, enemy.group.position);
        vectorToPlayer.y = 0; // Lock to float-plane
        const distToPlayer = vectorToPlayer.length();

        // If player is in drift aggro radius (45m)
        if (distToPlayer < 45 && isLocked && !gameOver) {
          vectorToPlayer.normalize().multiplyScalar(enemy.speed * delta);
          enemy.group.position.add(vectorToPlayer);

          // If close enough to breach player shields
          if (distToPlayer < 2.0) {
            handlePlayerDamage(18); // System Integrity Breach!

            // Discharge and respawn node far away immediately
            createExplosion(enemy.group.position, true);
            scene.remove(enemy.group);
            enemy.core.geometry.dispose();
            (enemy.core.material as THREE.Material).dispose();
            enemy.outerRing.geometry.dispose();
            (enemy.outerRing.material as THREE.Material).dispose();

            const hitId = enemy.id;
            enemies.current = enemies.current.filter(e => e.id !== hitId);
            spawnEnemy(hitId);
          }
        }
      });

      // Player First-Person Movement Engine with smooth sliding collision physics
      if (isLocked && !gameOver) {
        const moveSpeed = 16.5; // Deck movement speed
        const keyboardDir = new THREE.Vector3();

        // Extract camera viewing orientation vectors
        const forwardVector = new THREE.Vector3();
        camera.getWorldDirection(forwardVector);
        forwardVector.y = 0; // lock to horizontal plane
        forwardVector.normalize();

        const rightVector = new THREE.Vector3();
        rightVector.crossVectors(forwardVector, camera.up).normalize();

        // Accumulate keys direction vector
        if (keys.current["w"] || keys.current["W"] || keys.current["ArrowUp"]) {
          keyboardDir.add(forwardVector);
        }
        if (keys.current["s"] || keys.current["S"] || keys.current["ArrowDown"]) {
          keyboardDir.sub(forwardVector);
        }
        if (keys.current["d"] || keys.current["D"] || keys.current["ArrowRight"]) {
          keyboardDir.add(rightVector);
        }
        if (keys.current["a"] || keys.current["A"] || keys.current["ArrowLeft"]) {
          keyboardDir.sub(rightVector);
        }

        // Apply velocities
        if (keyboardDir.lengthSq() > 0) {
          keyboardDir.normalize().multiplyScalar(moveSpeed * delta);

          // Slide check on X coordinate
          const currentPosX = camera.position.clone();
          camera.position.x += keyboardDir.x;
          if (checkWallCollision(camera.position)) {
            camera.position.x = currentPosX.x; // Block, slide
          }

          // Slide check on Z coordinate
          const currentPosZ = camera.position.clone();
          camera.position.z += keyboardDir.z;
          if (checkWallCollision(camera.position)) {
            camera.position.z = currentPosZ.z; // Block, slide
          }
        }

        // Jump physics update
        if (isJumping.current) {
          camera.position.y += playerVelocityY.current * delta;
          playerVelocityY.current -= gravity * delta;

          // Land check
          if (camera.position.y <= defaultPlayerHeight) {
            camera.position.y = defaultPlayerHeight;
            isJumping.current = false;
            playerVelocityY.current = 0;
            addLog("DECK ANCHORED (LANDED)");
          }
        }

        // Apply procedural weapon sway/bobbing
        if (weaponGroupRef.current) {
          const isMoving = keyboardDir.lengthSq() > 0;
          const bobTime = totalTime * (isMoving ? 11 : 3.5);
          
          const swayX = isMoving ? Math.sin(bobTime) * 0.025 : Math.sin(bobTime) * 0.006;
          const swayY = isMoving ? Math.abs(Math.cos(bobTime)) * 0.018 - 0.01 : Math.sin(bobTime * 0.5) * 0.004;

          // Lerp gun recoil recovery
          const weaponRecoil = weaponGroupRef.current.position.z;
          const targetZ = -0.75;
          const recoilRecover = THREE.MathUtils.lerp(weaponRecoil, targetZ, 8 * delta);

          weaponGroupRef.current.position.set(
            0.32 + swayX, 
            -0.28 + swayY, 
            recoilRecover
          );
        }
      }

      // Render Scene with Neon Bloom pass
      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    // Begin Animation Loop
    animate();

    // Session clock increments
    const timerInterval = setInterval(() => {
      if (isLocked && !gameOver) {
        setTimeElapsed(prev => prev + 1);
      }
    }, 1000);

    // Responsive screen resizing logic
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !composerRef.current) return;
      
      const w = window.innerWidth;
      const h = window.innerHeight;

      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(w, h);
      composerRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup Resources on unmount
    return () => {
      isCleaningUp.current = true;
      clearInterval(timerInterval);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousedown", onMouseDown);

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // Destroy Three objects explicitly to clear VRAM leakages
      controls.removeEventListener("lock", onLock);
      controls.removeEventListener("unlock", onUnlock);
      controls.dispose();

      scene.remove(gridHelper);
      gridHelper.geometry.dispose();
      (gridHelper.material as THREE.Material).dispose();

      scene.remove(ground);
      groundGeom.dispose();
      groundMat.dispose();

      // Clear towers
      towersList.forEach(t => {
        scene.remove(t.mesh);
        t.mesh.geometry.dispose();
        (t.mesh.material as THREE.Material).dispose();
      });

      // Clear LEDs
      activeBlinkingLeds.forEach(led => {
        scene.remove(led.mesh);
        led.mesh.geometry.dispose();
        (led.mesh.material as THREE.Material).dispose();
      });

      // Clear camera weapon
      weaponGroup.remove(body);
      bodyGeom.dispose();
      bodyMat.dispose();

      weaponGroup.remove(barrelGlow);
      barrelGeom.dispose();
      barrelMat.dispose();

      weaponGroup.remove(coil);
      coilGeom.dispose();
      coilMat.dispose();

      camera.remove(weaponGroup);
      scene.remove(camera);

      // Clear remaining active meshes
      enemies.current.forEach(e => {
        scene.remove(e.group);
        e.core.geometry.dispose();
        (e.core.material as THREE.Material).dispose();
        e.outerRing.geometry.dispose();
        (e.outerRing.material as THREE.Material).dispose();
      });

      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Format stopwatch clock display (MM:SS)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Safe activation click for PointerLock
  const initiateBreach = () => {
    if (controlsRef.current) {
      controlsRef.current.lock();
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#04010a] font-orbitron select-none">
      {/* ThreeJS Container Canvas mount */}
      <div id="game-canvas-container" ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Crosshair (Standard in first person shooters, completely styled via CSS) */}
      {isLocked && !gameOver && (
        <div 
          id="hud-crosshair"
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          <div className="relative flex items-center justify-center">
            {/* Center dot */}
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f0ff]" />
            {/* Ticks */}
            <div className="absolute w-5 h-[2px] bg-cyan-400/40" />
            <div className="absolute w-[2px] h-5 bg-cyan-400/40" />
            {/* High-tech scope circular bracket */}
            <div className="absolute w-8 h-8 border border-cyan-400/20 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Screen Red Flash Overlay on Damage breach */}
      <div 
        id="damage-flash-overlay"
        className={`absolute inset-0 pointer-events-none transition-opacity duration-150 bg-red-600/30 backdrop-red-md ${
          damageFlash ? "opacity-100" : "opacity-0"
        }`} 
      />

      {/* Glassmorphic Cyberpunk HUD (Always shown while active) */}
      {gameStarted && (
        <div 
          id="hud-overlay-panels"
          className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6"
        >
          {/* Top HUD Row */}
          <div className="w-full flex justify-between items-start">
            
            {/* Top Left: Score Stats Panel */}
            <section 
              id="hud-stats-left"
              className="backdrop-blur-md bg-slate-950/40 border border-cyan-500/30 rounded-lg p-4 w-64 border-glow-cyan text-cyan-400"
            >
              <div className="flex items-center gap-2 mb-1 text-xs text-cyan-500/70 tracking-widest font-mono">
                <Terminal size={14} />
                <span>CYBER DECK: SECURE</span>
              </div>
              
              <div className="mb-2">
                <p className="text-xs text-slate-400 uppercase font-medium">Nodes Purged</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-wider glow-cyan">{score}</span>
                  <span className="text-xs text-slate-500 font-mono">OCT_CORES</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-500/20 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block">STABILITY</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Wifi size={10} />
                    {connectionStability.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">HIGH PURGES</span>
                  <span className="text-pink-400 flex items-center gap-1">
                    <Award size={10} />
                    {highScore}
                  </span>
                </div>
              </div>
            </section>

            {/* Top Right: System Integrity & Connections */}
            <section 
              id="hud-stats-right"
              className="backdrop-blur-md bg-slate-950/40 border border-pink-500/30 rounded-lg p-4 w-72 border-glow-pink text-pink-400"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2 text-xs text-pink-500/70 tracking-widest font-mono">
                  <Activity size={14} />
                  <span>DECK INTEGRITY</span>
                </div>
                {health < 40 && (
                  <span className="text-[10px] text-red-500 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-500 animate-pulse font-mono">
                    CRITICAL
                  </span>
                )}
              </div>

              {/* Progress Integrity Bar */}
              <div className="mb-3">
                <div className="w-full bg-slate-950/60 rounded-sm h-3 p-[2px] border border-pink-500/20">
                  <div 
                    className={`h-full rounded-xs transition-all duration-150 ${
                      health > 60 
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                        : health > 30 
                        ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                        : "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.7)]"
                    }`}
                    style={{ width: `${health}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1 text-[11px] font-mono">
                  <span className="text-slate-400">SHIELD ENERGY</span>
                  <span className={`font-bold ${health < 40 ? "text-red-500 animate-pulse" : "text-cyan-400"}`}>
                    {health}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-pink-500/20 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block">SYSTEM TIME</span>
                  <span className="text-pink-400 flex items-center gap-1">
                    <Clock size={10} />
                    {formatTime(timeElapsed)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">ACCURACY</span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Zap size={10} />
                    {accuracy}%
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Bottom HUD Row */}
          <div className="w-full flex justify-between items-end">
            
            {/* Bottom Left: Interactive Hacker Terminal Logs */}
            <section 
              id="hud-terminal-left"
              className="backdrop-blur-md bg-slate-950/50 border border-cyan-500/20 rounded-lg p-3 w-80 font-mono text-[11px] text-cyan-400/80"
            >
              <div className="text-[10px] text-slate-500 tracking-wider mb-1.5 flex justify-between items-center border-b border-cyan-500/10 pb-1">
                <span>SYSTEM DIAGNOSTICS LOGS</span>
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              </div>
              <div className="space-y-1 h-32 overflow-hidden flex flex-col justify-end">
                {terminalLogs.slice().reverse().map((log, idx) => (
                  <p key={idx} className="truncate text-cyan-400/70 hover:text-cyan-300 transition-colors">
                    {log}
                  </p>
                ))}
              </div>
            </section>

            {/* Bottom Right: Ammo & Controls HUD Panel */}
            <section 
              id="hud-controls-right"
              className="backdrop-blur-md bg-slate-950/40 border border-cyan-500/20 rounded-lg p-4 w-72 text-cyan-400/80 text-xs font-mono"
            >
              <div className="text-[10px] text-slate-500 tracking-wider mb-2 border-b border-cyan-500/10 pb-1 flex justify-between">
                <span>WEAPON CAPACITOR</span>
                <span>ONLINE</span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-400 font-sans text-xs">CYBER_BLASTER</span>
                <span className="text-lg font-bold text-cyan-400 glow-cyan flex items-center gap-1">
                  <Flame size={14} className="animate-pulse text-cyan-400" />
                  INF_AMMO
                </span>
              </div>

              <div className="space-y-1 text-[10px] text-slate-400 border-t border-cyan-500/10 pt-2 font-mono">
                <p><span className="text-cyan-400">WASD / ↑↓←→</span>: Navigate Datablock</p>
                <p><span className="text-cyan-400">SPACE</span>: Deck Thrusters (Jump)</p>
                <p><span className="text-cyan-400">LEFT-CLICK</span>: Purge Laser Fire</p>
                <p><span className="text-cyan-400">ESC</span>: Release Deck Pointer</p>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Mute toggle button (Top-center Floating, Always Available except start screen) */}
      {gameStarted && (
        <button
          id="hud-mute-btn"
          onClick={toggleMute}
          className="absolute top-6 left-1/2 -translate-x-1/2 backdrop-blur-md bg-slate-950/40 border border-cyan-500/20 text-cyan-400 p-2.5 rounded-full pointer-events-auto hover:bg-slate-900/60 transition-all border-glow-cyan flex items-center justify-center cursor-pointer"
          title={muted ? "Unmute Sound" : "Mute Sound"}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      {/* Floating Coordinate Ticker (Pure Hacker Aesthetic) */}
      {isLocked && !gameOver && (
        <div 
          id="hud-coords-ticker"
          className="absolute top-6 left-1/2 -translate-x-1/2 translate-y-12 backdrop-blur-sm bg-slate-950/30 px-3 py-1 rounded-sm text-[10px] text-slate-500 font-mono pointer-events-none flex gap-3"
        >
          <span>LAT_X: {playerCoords.x}</span>
          <span>LNG_Z: {playerCoords.z}</span>
          <span>ALT_Y: {cameraRef.current ? Math.round(cameraRef.current.position.y * 10) / 10 : 1.8}</span>
        </div>
      )}

      {/* OVERLAY 1: "BREACH PROTOCOL" Start/Introduction Screen */}
      {!gameStarted && (
        <div 
          id="overlay-start"
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl"
        >
          <div className="max-w-md w-full bg-slate-900/40 border border-cyan-500/30 p-8 rounded-lg border-glow-cyan text-center">
            
            {/* Terminal Header */}
            <div className="flex items-center justify-center gap-2 mb-4 text-cyan-400">
              <Terminal size={24} className="animate-pulse" />
              <span className="font-mono text-xs tracking-widest text-cyan-400/80">DECK_PORTAL v1.5</span>
            </div>

            {/* Glowing Cyberspace Logo */}
            <h1 className="text-4xl font-extrabold text-cyan-400 tracking-wider font-orbitron mb-2 glow-cyan">
              CYBER_BREACH
            </h1>
            <p className="text-xs text-slate-400 font-mono mb-6 uppercase tracking-wider">
              3D FPS Rogue Node Purge Protocol
            </p>

            {/* High-Tech Instruction Logs */}
            <div className="text-left font-mono text-[11px] bg-slate-950/80 p-4 rounded border border-cyan-500/10 mb-6 text-cyan-400/80 space-y-2">
              <p className="text-green-400">&gt; COMPILING CYBERDECK GRAPHICS... DONE</p>
              <p className="text-green-400">&gt; LINKING THREE_WEBGL_RENDERER... DONE</p>
              <p className="text-green-400">&gt; BLOOM NEON EFFECT ENGINES ACTIVE... DONE</p>
              <p className="text-rose-400 animate-pulse">&gt; ALERT: Hostile Firewalls & Octahedron cores detected.</p>
              <p className="text-cyan-400">&gt; COMMANDS: WASD (Run) | SPACE (Jump) | LEFT_CLICK (Fire)</p>
            </div>

            {/* Main Interactive Button to request Pointer Lock */}
            <button
              id="start-breach-btn"
              onClick={initiateBreach}
              className="w-full cursor-pointer bg-gradient-to-r from-cyan-500 to-pink-500 text-slate-950 font-bold tracking-widest py-3 px-6 rounded hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(6,182,212,0.6)] uppercase font-orbitron text-sm flex items-center justify-center gap-2"
            >
              <Cpu size={18} />
              BREACH PROTOCOL READY - INITIATE
            </button>
            <p className="text-[10px] text-slate-500 mt-3 font-mono">
              *Requires Pointer Lock. Mouse will lock inside viewport.
            </p>
          </div>
        </div>
      )}

      {/* OVERLAY 2: CONNECTION INTERRUPTED (Pause Screen when unlocked) */}
      {gameStarted && !isLocked && !gameOver && (
        <div 
          id="overlay-paused"
          className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
        >
          <div className="max-w-sm w-full bg-slate-900/50 border border-amber-500/30 p-6 rounded-lg border-glow-amber text-center text-amber-400">
            
            <AlertTriangle className="mx-auto mb-3 animate-bounce text-amber-500" size={32} />

            <h2 className="text-2xl font-bold font-orbitron mb-1 tracking-wide">
              DECK_LINK_HALTED
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-5 uppercase">
              Mouse Pointer lock released
            </p>

            <button
              id="resume-breach-btn"
              onClick={initiateBreach}
              className="w-full cursor-pointer bg-amber-500 text-slate-950 font-bold tracking-wider py-2.5 px-4 rounded hover:bg-amber-400 active:scale-95 transition-all shadow-[0_0_10px_rgba(245,158,11,0.5)] uppercase text-xs"
            >
              RE-ESTABLISH CONNECTION
            </button>
            <p className="text-[9px] text-slate-500 mt-3 font-mono">
              Click anywhere on screen to resume pointer lock.
            </p>
          </div>
        </div>
      )}

      {/* OVERLAY 3: SYSTEM COMPROMISED (Game Over Screen) */}
      {gameOver && (
        <div 
          id="overlay-gameover"
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
        >
          <div className="max-w-md w-full bg-slate-900/40 border border-red-500/30 p-8 rounded-lg border-glow-red text-center">
            
            <AlertTriangle className="mx-auto mb-4 animate-pulse text-red-500" size={42} />

            <h2 className="text-3xl font-extrabold text-red-500 tracking-wider font-orbitron mb-1 glow-red">
              LINK TERMINATED
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-6 uppercase">
              Deck Integrity compromised. Firewall ejection complete.
            </p>

            {/* Performance Audit Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-left text-xs font-mono">
              <div className="bg-slate-950/70 p-3 rounded border border-red-500/10">
                <span className="text-slate-500 block">NODES PURGED</span>
                <span className="text-lg font-bold text-red-400">{score} CORES</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded border border-red-500/10">
                <span className="text-slate-500 block">DECK RECORD</span>
                <span className="text-lg font-bold text-pink-400">{highScore} CORES</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded border border-red-500/10">
                <span className="text-slate-500 block">UPTIME</span>
                <span className="text-lg font-bold text-cyan-400">{formatTime(timeElapsed)}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded border border-red-500/10">
                <span className="text-slate-500 block">FIRE ACCURACY</span>
                <span className="text-lg font-bold text-emerald-400">{accuracy}%</span>
              </div>
            </div>

            <button
              id="restart-breach-btn"
              onClick={initiateBreach}
              className="w-full cursor-pointer bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold tracking-widest py-3 px-6 rounded hover:scale-102 active:scale-98 transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)] uppercase text-xs flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className="animate-spin" />
              RE-INJECT MALWARE (RETRY)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
