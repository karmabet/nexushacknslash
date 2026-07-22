    // Initialize Lucide Icons
    lucide.createIcons();

    // Procedural Audio Synthesizer Class
    class SoundSynth {
      constructor() {
        this.ctx = null;
        this.muted = false;
      }

      init() {
        if (!this.ctx) {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === "suspended") {
          this.ctx.resume();
        }
      }

      playLaser() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
      }

      playExplosion() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Bass Thump
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Cyber Glitch Crash Noise
        const glitchOsc = this.ctx.createOscillator();
        const glitchGain = this.ctx.createGain();
        glitchOsc.type = "sawtooth";
        glitchOsc.frequency.setValueAtTime(1800, this.ctx.currentTime);
        glitchOsc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.18);

        glitchGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        glitchGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

        glitchOsc.connect(glitchGain);
        glitchGain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);

        glitchOsc.start();
        glitchOsc.stop(this.ctx.currentTime + 0.18);
      }

      playDamage() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(45, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
      }

      playAccessGranted() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [329.63, 392.00, 523.25, 659.25]; // E4, G4, C5, E5 rising cyber chord

        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.25);
        });
      }

      playGameOver() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [440.00, 392.00, 349.23, 261.63]; // descending sequence

        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);

          gain.gain.setValueAtTime(0, now + idx * 0.15);
          gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.15 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.45);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.45);
        });
      }
    }

    // GAME STATE VARIABLES
    const synth = new SoundSynth();
    let score = 0;
    let highScore = parseInt(localStorage.getItem("cyber_shooter_high_score") || "0", 10);
    let health = 100;
    let timeElapsed = 0;
    let shotsFired = 0;
    let shotsHit = 0;
    let gameStarted = false;
    let gameOver = false;
    let isLocked = false;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    let controlMode = isTouchDevice ? 'touch' : 'lock';
    let usePointerLock = controlMode === 'lock';
    
    // Joystick and touch state variables
    let joystickActive = false;
    let joystickPointerId = null;
    let joystickStartPos = { x: 0, y: 0 };
    let moveVector = { x: 0, y: 0 };
    let lookPointerId = null;
    let previousLookPosition = { x: 0, y: 0 };

    let timerInterval = null;

    const terminalLogs = [
      "DECK STATUS: ONLINE",
      "CYBERSPACE PORTAL INSTANTIATED",
      "GRID ENGINE v1.42 LOADED SUCCESS",
      "BREACH PROTOCOL PENDING..."
    ];

    // ThreeJS Core Variables
    let scene, camera, renderer, composer, controls;
    let matrixTexture = null;
    let wallTexture = null;
    let gridTexture = null;
    let weaponTexture = null;
    let themeDirectionalLightPrimary = null;
    let themeDirectionalLightSecondary = null;
    let towers = [];
    let neonPillars = [];
    let enemies = [];
    let rollingShapes = [];
    let projectiles = [];
    let particles = [];
    let blinkingLeds = [];
    let keys = {};
    let weaponGroup = null;
    let lastShotTime = 0;
    let defaultPlayerHeight = 1.8;
    let isJumping = false;
    let playerVelocityY = 0;
    const gravity = 32;
    const jumpPower = 11.5;

    // Organic uneven cyber-terrain generator
    function getGroundHeight(x, z) {
      const distFromCenter = Math.sqrt(x * x + z * z);
      // Damp the height changes near the center area so spawning/UI works smoothly
      const scale = Math.min(1.0, distFromCenter / 25.0);
      
      // Dynamic organic wave patterns using sine/cosine combinations
      const wave1 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4.2;
      const wave2 = Math.cos(x * 0.12) * Math.sin(z * 0.12) * 1.8;
      const wave3 = Math.sin(x * 0.02 + z * 0.025) * 2.5;
      
      return (wave1 + wave2 + wave3) * scale;
    }

    // Helper to perturb a flat PlaneGeometry into our dynamic terrain
    function applyTerrainHeights(geometry) {
      const positionAttribute = geometry.attributes.position;
      for (let i = 0; i < positionAttribute.count; i++) {
        const vx = positionAttribute.getX(i);
        const vy = positionAttribute.getY(i);
        const worldX = vx;
        const worldZ = -vy; // corresponding rotated world coordinates
        const height = getGroundHeight(worldX, worldZ);
        positionAttribute.setZ(i, height);
      }
      geometry.computeVertexNormals();
      positionAttribute.needsUpdate = true;
    }

    // COLOR THEMES SYSTEM
    const COLOR_THEMES = [
      {
        id: "cyan",
        name: "CYBER_CYAN",
        color: "#00f0ff",
        colorRgb: "6, 182, 212",
        colorDarkRgb: "8, 47, 73",
        colorHex: 0x00f0ff,
        colorHexSecondary: 0x00a8ff,
        colorHexBright: 0xa5f3fc,
        colorSecondary: "#00a8ff",
        colorBright: "#a5f3fc",
        bgClass: "bg-cyan-500/20 border-cyan-400 text-cyan-300"
      },
      {
        id: "green",
        name: "MATRIX_GREEN",
        color: "#00ff66",
        colorRgb: "16, 185, 129",
        colorDarkRgb: "6, 78, 59",
        colorHex: 0x00ff66,
        colorHexSecondary: 0x059669,
        colorHexBright: 0xa7f3d0,
        colorSecondary: "#059669",
        colorBright: "#a7f3d0",
        bgClass: "bg-emerald-500/20 border-emerald-400 text-emerald-300"
      },
      {
        id: "pink",
        name: "NEON_PINK",
        color: "#ff0055",
        colorRgb: "244, 63, 94",
        colorDarkRgb: "76, 5, 25",
        colorHex: 0xff0055,
        colorHexSecondary: 0xff00aa,
        colorHexBright: 0xfecdd3,
        colorSecondary: "#ff00aa",
        colorBright: "#fecdd3",
        bgClass: "bg-pink-500/20 border-pink-400 text-pink-300"
      },
      {
        id: "purple",
        name: "VOLTAGE_PURPLE",
        color: "#d946ef",
        colorRgb: "217, 70, 239",
        colorDarkRgb: "74, 4, 78",
        colorHex: 0xd946ef,
        colorHexSecondary: 0x8b5cf6,
        colorHexBright: 0xf5d0fe,
        colorSecondary: "#8b5cf6",
        colorBright: "#f5d0fe",
        bgClass: "bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300"
      },
      {
        id: "orange",
        name: "SYNTH_ORANGE",
        color: "#ff9900",
        colorRgb: "245, 158, 11",
        colorDarkRgb: "120, 53, 4",
        colorHex: 0xff9900,
        colorHexSecondary: 0xf97316,
        colorHexBright: 0xffedd5,
        colorSecondary: "#f97316",
        colorBright: "#ffedd5",
        bgClass: "bg-amber-500/20 border-amber-400 text-amber-300"
      },
      {
        id: "red",
        name: "HELLFIRE_RED",
        color: "#ef4444",
        colorRgb: "239, 68, 68",
        colorDarkRgb: "69, 10, 10",
        colorHex: 0xef4444,
        colorHexSecondary: 0x991b1b,
        colorHexBright: 0xfecaca,
        colorSecondary: "#991b1b",
        colorBright: "#fecaca",
        bgClass: "bg-red-500/20 border-red-400 text-red-300"
      },
      {
        id: "yellow",
        name: "AMBER_GOLD",
        color: "#eab308",
        colorRgb: "234, 179, 8",
        colorDarkRgb: "66, 32, 6",
        colorHex: 0xeab308,
        colorHexSecondary: 0xb45309,
        colorHexBright: 0xfef08a,
        colorSecondary: "#b45309",
        colorBright: "#fef08a",
        bgClass: "bg-yellow-500/20 border-yellow-400 text-yellow-300"
      },
      {
        id: "blue",
        name: "COBALT_BLUE",
        color: "#3b82f6",
        colorRgb: "59, 130, 246",
        colorDarkRgb: "30, 58, 138",
        colorHex: 0x3b82f6,
        colorHexSecondary: 0x1d4ed8,
        colorHexBright: 0xbfdbfe,
        colorSecondary: "#1d4ed8",
        colorBright: "#bfdbfe",
        bgClass: "bg-blue-500/20 border-blue-400 text-blue-300"
      },
      {
        id: "white",
        name: "CHROME_WHITE",
        color: "#ffffff",
        colorRgb: "255, 255, 255",
        colorDarkRgb: "30, 41, 59",
        colorHex: 0xffffff,
        colorHexSecondary: 0x94a3b8,
        colorHexBright: 0xf8fafc,
        colorSecondary: "#94a3b8",
        colorBright: "#f8fafc",
        bgClass: "bg-slate-300/20 border-slate-300 text-slate-100"
      },
      {
        id: "lime",
        name: "TOXIC_LIME",
        color: "#a3e635",
        colorRgb: "163, 230, 53",
        colorDarkRgb: "40, 87, 6",
        colorHex: 0xa3e635,
        colorHexSecondary: 0x4d7c0f,
        colorHexBright: 0xecfccb,
        colorSecondary: "#4d7c0f",
        colorBright: "#ecfccb",
        bgClass: "bg-lime-500/20 border-lime-400 text-lime-300"
      }
    ];

    // First access check: choose a random theme on initial access or first visit
    const isFirstAccess = !localStorage.getItem("cyber_shooter_visited") || !sessionStorage.getItem("cyber_shooter_session");
    let currentTheme;

    if (isFirstAccess) {
      const randomIndex = Math.floor(Math.random() * COLOR_THEMES.length);
      currentTheme = COLOR_THEMES[randomIndex];
      localStorage.setItem("cyber_shooter_theme", currentTheme.id);
      localStorage.setItem("cyber_shooter_visited", "true");
      sessionStorage.setItem("cyber_shooter_session", "true");
    } else {
      const savedThemeId = localStorage.getItem("cyber_shooter_theme");
      const foundTheme = COLOR_THEMES.find(t => t.id === savedThemeId);
      currentTheme = foundTheme || COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)];
    }

    // Material references for real-time dynamic recoloring
    let wallMaterial = null;
    let weaponBodyMat = null;
    let weaponBarrelMat = null;
    let weaponSideMat = null;

    function applyCSSThemeVariables(theme) {
      document.documentElement.style.setProperty('--theme-color', theme.color);
      document.documentElement.style.setProperty('--theme-color-rgb', theme.colorRgb);
      document.documentElement.style.setProperty('--theme-color-dark-rgb', theme.colorDarkRgb);
    }
    // Run immediately to avoid flashing on load
    applyCSSThemeVariables(currentTheme);

    // Helper to send frame communication
    function sendIframeMessage(type, payload) {
      try {
        window.parent.postMessage({ type, ...payload }, "*");
      } catch (err) {
        console.error("Iframe communication failed:", err);
      }
    }

    // Diagnostics Logs terminal output
    function addLog(msg) {
      const timestamp = new Date().toLocaleTimeString();
      terminalLogs.push(`[${timestamp}] ${msg}`);
      if (terminalLogs.length > 8) {
        terminalLogs.shift();
      }
      
      const feed = document.getElementById("terminal-feed");
      if (feed) {
        feed.innerHTML = terminalLogs.map(log => `
          <p class="truncate text-cyan-400/80 hover:text-cyan-300 transition-colors">
            ${log}
          </p>
        `).join("");
      }
    }

    // Initialize terminal feed visually at start
    addLog("BREACH PROTOCOL READY - INITIATE CONNECTION");

    // Connect Audio Sound Button Toggle
    const soundBtn = document.getElementById("sound-toggle-btn");
    soundBtn.addEventListener("click", () => {
      synth.muted = !synth.muted;
      const label = soundBtn.querySelector("span");
      const icon = soundBtn.querySelector("i");
      
      if (synth.muted) {
        label.innerText = "AUDIO: MUTED";
        soundBtn.classList.remove("text-cyan-400", "border-cyan-500/30", "border-glow-cyan");
        soundBtn.classList.add("text-slate-500", "border-slate-800");
        icon.setAttribute("data-lucide", "volume-x");
      } else {
        label.innerText = "AUDIO: ON";
        soundBtn.classList.add("text-cyan-400", "border-cyan-500/30", "border-glow-cyan");
        soundBtn.classList.remove("text-slate-500", "border-slate-800");
        icon.setAttribute("data-lucide", "volume-2");
      }
      lucide.createIcons();
    });

    // START GAME / REBOOT ACTION
    const startOverlay = document.getElementById("start-overlay");
    const gameOverOverlay = document.getElementById("gameover-overlay");
    const initBtn = document.getElementById("initialize-btn");
    const rebootBtn = document.getElementById("reboot-btn");
    const hudOverlay = document.getElementById("hud-overlay");
    const crosshair = document.getElementById("crosshair");

    // Control Selector Buttons UI handling
    const freeBtn = document.getElementById("control-free-btn");
    const lockBtn = document.getElementById("control-lock-btn");
    const touchBtn = document.getElementById("control-touch-btn");

    function updateControlUI() {
      if (!freeBtn || !lockBtn || !touchBtn) return;
      
      // Reset all buttons to unselected
      freeBtn.className = "py-2.5 px-1.5 rounded-lg border text-[10px] font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-slate-950/20 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700";
      lockBtn.className = "py-2.5 px-1.5 rounded-lg border text-[10px] font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-slate-950/20 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700";
      touchBtn.className = "py-2.5 px-1.5 rounded-lg border text-[10px] font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-slate-950/20 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700";

      if (controlMode === 'lock') {
        lockBtn.className = "py-2.5 px-1.5 rounded-lg border text-[10px] font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-cyan-500/20 text-cyan-300 border-cyan-400 border-glow-cyan";
        usePointerLock = true;
      } else if (controlMode === 'touch') {
        touchBtn.className = "py-2.5 px-1.5 rounded-lg border text-[10px] font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-cyan-500/20 text-cyan-300 border-cyan-400 border-glow-cyan";
        usePointerLock = false;
      } else {
        freeBtn.className = "py-2.5 px-1.5 rounded-lg border text-[10px] font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-cyan-500/20 text-cyan-300 border-cyan-400 border-glow-cyan";
        usePointerLock = false;
      }
    }

    if (freeBtn && lockBtn && touchBtn) {
      freeBtn.addEventListener("click", () => {
        controlMode = 'free';
        updateControlUI();
      });
      lockBtn.addEventListener("click", () => {
        controlMode = 'lock';
        updateControlUI();
      });
      touchBtn.addEventListener("click", () => {
        controlMode = 'touch';
        updateControlUI();
      });
    }

    // Call once initially to style according to touch auto-detection
    updateControlUI();

    // COLORWAY SETTINGS & REAL-TIME RECOLORING ENGINE
    const themeButtonsContainer = document.getElementById("theme-buttons-container");
    const settingsPanel = document.getElementById("settings-panel");
    const settingsToggleBtn = document.getElementById("settings-toggle-btn");

    function redrawGridTexture() {
      if (!gridTexture || !gridTexture.image) return;
      const canvas = gridTexture.image;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, 64, 64);
      ctx.strokeStyle = currentTheme.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, 64, 64);
      gridTexture.needsUpdate = true;
    }

    function changeColorTheme(themeId) {
      const theme = COLOR_THEMES.find(t => t.id === themeId);
      if (!theme) return;
      
      currentTheme = theme;
      localStorage.setItem("cyber_shooter_theme", themeId);
      
      // 1. Update CSS Custom variables
      applyCSSThemeVariables(theme);

      // Update global scene lights
      if (themeDirectionalLightPrimary) {
        themeDirectionalLightPrimary.color.setHex(theme.colorHex);
      }
      if (themeDirectionalLightSecondary) {
        themeDirectionalLightSecondary.color.setHex(theme.colorHexSecondary);
      }
      
      // 2. Refresh Ground grid
      redrawGridTexture();
      
      // 3. Update active 3D Materials in scene
      if (wallMaterial) {
        wallMaterial.emissive.setHex(theme.colorHex);
      }
      if (weaponBodyMat) {
        weaponBodyMat.emissive.setHex(theme.colorHex);
      }
      if (weaponBarrelMat) {
        weaponBarrelMat.emissive.setHex(theme.colorHexBright);
      }
      if (weaponSideMat) {
        weaponSideMat.emissive.setHex(theme.colorHexSecondary);
      }
      
      // Update data towers
      towers.forEach(t => {
        if (t.mesh && t.mesh.material) {
          t.mesh.material.emissive.setHex(theme.colorHex);
        }
      });

      // Update neon pillars
      neonPillars.forEach(p => {
        const pColor = p.isSecondary ? theme.colorHexSecondary : theme.colorHex;
        if (p.mesh && p.mesh.material) {
          p.mesh.material.color.setHex(pColor);
          p.mesh.material.emissive.setHex(pColor);
        }
        if (p.light) {
          p.light.color.setHex(pColor);
        }
      });
      
      // Update active projectiles (bullets)
      projectiles.forEach(p => {
        if (p.mesh && p.mesh.material) {
          p.mesh.material.color.setHex(theme.colorHex);
          p.mesh.material.emissive.setHex(theme.colorHex);
        }
      });
      
      // Update existing spawned enemies
      enemies.forEach(e => {
        if (e.isRare) {
          if (e.core && e.core.material) {
            e.core.material.color.setHex(theme.colorHexSecondary);
            e.core.material.emissive.setHex(theme.colorHex);
          }
          if (e.outerRing && e.outerRing.material) {
            e.outerRing.material.color.setHex(theme.colorHex);
            e.outerRing.material.emissive.setHex(theme.colorHexSecondary);
          }
        } else {
          if (e.core && e.core.material) {
            e.core.material.emissive.setHex(theme.colorHexSecondary);
          }
          if (e.outerRing && e.outerRing.material) {
            e.outerRing.material.emissive.setHex(theme.colorHexSecondary);
          }
          // Redraw standard enemy canvas in real-time
          if (e.canvas && e.char && e.texture) {
            const ctx = e.canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, 128, 128);
              ctx.shadowColor = theme.color;
              ctx.shadowBlur = 12;
              ctx.fillStyle = "#ffffff";
              ctx.font = "bold 92px monospace";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(e.char, 64, 64);
              e.texture.needsUpdate = true;
            }
          }
        }
      });

      // Update rolling geometric shapes
      rollingShapes.forEach(rs => {
        const rsColor = rs.isSecondary ? theme.colorHexSecondary : theme.colorHex;
        if (rs.mesh && rs.mesh.material) {
          rs.mesh.material.emissive.setHex(rsColor);
        }
        // children: wireframe (LineSegments) and PointLight
        rs.mesh.children.forEach(child => {
          if (child instanceof THREE.LineSegments && child.material) {
            child.material.color.setHex(rsColor);
          } else if (child instanceof THREE.PointLight) {
            child.color.setHex(rsColor);
          }
        });
      });

      // Update control buttons selection class
      updateControlUI();
      
      // Rerender buttons to update selected class styling
      renderThemeButtons();

      addLog(`SYSTEM_COLORWAY_UPDATED: ${theme.name}`);
    }

    function renderThemeButtons() {
      if (!themeButtonsContainer) return;
      themeButtonsContainer.innerHTML = "";
      COLOR_THEMES.forEach(t => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.title = t.name;
        
        const isActive = t.id === currentTheme.id;
        const colorClasses = isActive 
          ? `${t.bgClass} border-2 border-glow-theme scale-105 shadow-[0_0_12px_rgba(var(--theme-color-rgb),0.3)]` 
          : "bg-slate-950/40 border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200";
        
        btn.className = `py-2 rounded-lg font-bold text-[8px] sm:text-[9px] transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${colorClasses}`;
        
        const dot = document.createElement("span");
        dot.className = "w-3 h-3 rounded-full";
        dot.style.backgroundColor = t.color;
        dot.style.boxShadow = `0 0 8px ${t.color}`;
        
        const label = document.createElement("span");
        label.innerText = t.name.split("_")[1] || t.name;
        
        btn.appendChild(dot);
        btn.appendChild(label);
        
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          changeColorTheme(t.id);
        });
        
        themeButtonsContainer.appendChild(btn);
      });
    }

    if (settingsToggleBtn && settingsPanel) {
      settingsToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (settingsPanel.classList.contains("hidden")) {
          settingsPanel.classList.remove("hidden");
          renderThemeButtons();
          addLog("SETTINGS_PANEL: ACTIVE");
        } else {
          settingsPanel.classList.add("hidden");
          addLog("SETTINGS_PANEL: DEACTIVATED");
        }
      });
    }

    renderThemeButtons();

    initBtn.addEventListener("click", () => {
      if (usePointerLock) {
        if (controls) {
          controls.lock();
        }
      } else {
        isLocked = true;
        if (!gameStarted) {
          startMainGameplay();
        } else {
          startOverlay.classList.add("hidden");
        }
      }
    });

    rebootBtn.addEventListener("click", () => {
      if (usePointerLock) {
        if (controls) {
          controls.lock();
        }
      } else {
        isLocked = true;
        startMainGameplay();
      }
    });

    const copyCodeBtn = document.getElementById("copy-code-btn");
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener("click", () => {
        const codeValueEl = document.getElementById("gameover-code-value");
        if (codeValueEl) {
          const textToCopy = codeValueEl.innerText;
          navigator.clipboard.writeText(textToCopy).then(() => {
            copyCodeBtn.innerText = "COPIED";
            setTimeout(() => { copyCodeBtn.innerText = "COPY"; }, 2000);
          }).catch(() => {
            copyCodeBtn.innerText = "COPIED";
            setTimeout(() => { copyCodeBtn.innerText = "COPY"; }, 2000);
          });
        }
      });
    }

    function startMainGameplay() {
      // Setup Initial State
      score = 0;
      health = 100;
      timeElapsed = 0;
      shotsFired = 0;
      shotsHit = 0;
      gameOver = false;
      isJumping = false;
      playerVelocityY = 0;

      // Reset HUD Values
      document.getElementById("hud-score").innerText = "0";
      document.getElementById("hud-health-text").innerText = "100%";
      document.getElementById("hud-health-bar").style.width = "100%";
      document.getElementById("hud-health-bar").className = "h-full rounded-sm bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-150";
      document.getElementById("hud-time").innerText = "00:00";
      document.getElementById("hud-highscore").innerText = highScore;
      document.getElementById("hud-integrity-warning").classList.add("hidden");

      if (document.getElementById("hud-accuracy")) {
        document.getElementById("hud-accuracy").innerHTML = `<i data-lucide="zap" class="w-3 h-3"></i> 100%`;
      }

      const controlsHint = document.getElementById("hud-controls-hint");
      if (controlsHint) {
        controlsHint.classList.remove("hidden");
        if (controlMode === 'touch') {
          controlsHint.innerHTML = "<span>JOYSTICK: MOVE | SWIPE RIGHT SIDE: LOOK | BUTTONS</span>";
        } else {
          controlsHint.innerHTML = "<span>WASD: Move | Mouse: Look & Shoot | SPACE: Jump</span>";
        }
      }

      const touchControls = document.getElementById("touch-controls");
      if (touchControls) {
        if (controlMode === 'touch') {
          touchControls.classList.remove("hidden");
        } else {
          touchControls.classList.add("hidden");
        }
      }

      lucide.createIcons();

      // Reset Camera
      if (camera) {
        camera.position.set(0, defaultPlayerHeight, 0);
        camera.rotation.set(0, 0, 0);
      }

      // Clean old entities
      projectiles.forEach(p => {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
      });
      projectiles = [];

      particles.forEach(part => {
        scene.remove(part.mesh);
        part.mesh.geometry.dispose();
        part.mesh.material.dispose();
      });
      particles = [];

      // Spawn fresh enemies
      spawnAllEnemies();
      spawnAllRollingShapes();

      // Clear Overlays
      startOverlay.classList.add("hidden");
      gameOverOverlay.classList.add("hidden");
      hudOverlay.classList.remove("hidden");
      crosshair.classList.remove("hidden");
      soundBtn.classList.remove("hidden");

      // Set flags
      gameStarted = true;

      // Sound
      synth.playAccessGranted();
      addLog("ACCESS GRANTED. HOSTILE RED CORES INJECTED.");

      // Timer Interval Setup
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (isLocked && !gameOver) {
          timeElapsed++;
          const mins = Math.floor(timeElapsed / 60).toString().padStart(2, "0");
          const secs = (timeElapsed % 60).toString().padStart(2, "0");
          document.getElementById("hud-time").innerText = `${mins}:${secs}`;
          
          // Throttled coordinate stats update
          if (camera && document.getElementById("hud-coords")) {
            const px = Math.round(camera.position.x * 10) / 10;
            const pz = Math.round(camera.position.z * 10) / 10;
            const py = Math.round(camera.position.y * 10) / 10;
            document.getElementById("hud-coords").innerHTML = `
              <span>GRID_X: ${px}</span>
              <span>GRID_Z: ${pz}</span>
              <span>GRID_Y: ${py}</span>
            `;
          }

          // Fluctuate signal value
          if (document.getElementById("hud-signal")) {
            const signal = (95 + Math.random() * 4.9).toFixed(1);
            document.getElementById("hud-signal").innerHTML = `
              <i data-lucide="wifi" class="w-3 h-3"></i>
              ${signal}%
            `;
          }
          lucide.createIcons();
        }
      }, 1000);
    }

    // HIGH-PERFORMANCE PROCEDURAL GROUND GRID TEXTURE
    function createGridTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      
      // Clear with transparent/dark background
      ctx.clearRect(0, 0, 64, 64);
      
      // Draw grid lines
      ctx.strokeStyle = currentTheme.color;
      ctx.lineWidth = 1.5;
      
      // Draw outer boundary lines
      ctx.strokeRect(0, 0, 64, 64);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(130, 130); // 130 cells across 260 width/length
      return texture;
    }

    // HIGH-PERFORMANCE OFFSCREEN MATRIX CODE RAIN TEXTURE
    function initMatrixRain() {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const fontSize = 16;
      const columns = Math.floor(canvas.width / fontSize);
      const drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -40; // staggered start offsets
      }

      // Cyber/hacker Katakana + alphanumeric character set
      const chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEF";

      function draw() {
        // Draw trailing dark transparent layer to fade previous frames
        ctx.fillStyle = "rgba(4, 1, 10, 0.08)"; // Match theme background (#04010a)
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "bold " + fontSize + "px monospace";

        for (let i = 0; i < columns; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = Math.floor(drops[i]) * fontSize;

          // If the drop is on screen, render it
          if (y >= 0) {
            // Head of stream: brighter neon/white. Tail: current theme color.
            if (Math.random() > 0.96) {
              ctx.fillStyle = "#ffffff";
            } else if (Math.random() > 0.85) {
              ctx.fillStyle = currentTheme.colorBright || "#ffffff"; // Extremely light dynamic theme color
            } else {
              ctx.fillStyle = currentTheme.color; // Dynamic theme color
            }
            ctx.fillText(char, x, y);
          }

          // Move the drop down slowly
          drops[i] += 0.35;

          // Reset drop if it goes off screen with random delay
          if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
        }
      }

      // Create reusable textures sharing the same offscreen canvas source
      matrixTexture = new THREE.CanvasTexture(canvas);
      matrixTexture.wrapS = THREE.RepeatWrapping;
      matrixTexture.wrapT = THREE.RepeatWrapping;

      wallTexture = matrixTexture.clone();
      wallTexture.wrapS = THREE.RepeatWrapping;
      wallTexture.wrapT = THREE.RepeatWrapping;
      wallTexture.repeat.set(8, 4); // Repeat more across giant perimeter walls

      weaponTexture = matrixTexture.clone();
      weaponTexture.wrapS = THREE.RepeatWrapping;
      weaponTexture.wrapT = THREE.RepeatWrapping;
      weaponTexture.repeat.set(4, 2); // Highly concentrated repeat for the gun parts

      // Frame throttle loop (approx 24 FPS is ideal for digital rain)
      let lastTime = 0;
      const fpsInterval = 1000 / 24;

      function update(time) {
        requestAnimationFrame(update);
        const elapsed = time - lastTime;
        if (elapsed > fpsInterval) {
          lastTime = time - (elapsed % fpsInterval);
          draw();
          
          // Force Three.js to upload updated canvas texture to GPU
          if (matrixTexture) matrixTexture.needsUpdate = true;
          if (wallTexture) wallTexture.needsUpdate = true;
          if (weaponTexture) weaponTexture.needsUpdate = true;
        }
      }
      requestAnimationFrame(update);
    }

    // THREE.JS INITIALIZATION
    function initEngine() {
      // Initialize matrix offscreen textures before building scene objects
      initMatrixRain();

      const container = document.getElementById("canvas-container");

      // Scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x04010a);
      scene.fog = new THREE.FogExp2(0x04010a, 0.016);

      // Camera
      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
      camera.position.set(0, defaultPlayerHeight, 0);

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0x0e0a25, 1.8);
      scene.add(ambientLight);

      themeDirectionalLightPrimary = new THREE.DirectionalLight(currentTheme.colorHex, 2.2);
      themeDirectionalLightPrimary.position.set(20, 40, 20);
      scene.add(themeDirectionalLightPrimary);

      themeDirectionalLightSecondary = new THREE.DirectionalLight(currentTheme.colorHexSecondary, 1.5);
      themeDirectionalLightSecondary.position.set(-20, 30, -20);
      scene.add(themeDirectionalLightSecondary);

      // Cyber Grid helper (Dynamic scrollable grid texture)
      gridTexture = createGridTexture();
      const gridGeom = new THREE.PlaneGeometry(260, 260, 100, 100);
      applyTerrainHeights(gridGeom);
      const gridMat = new THREE.MeshBasicMaterial({
        map: gridTexture,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const gridMesh = new THREE.Mesh(gridGeom, gridMat);
      gridMesh.rotation.x = -Math.PI / 2;
      gridMesh.position.y = 0.015; // slightly above ground to prevent z-fighting
      scene.add(gridMesh);

      // Ground plane
      const groundGeom = new THREE.PlaneGeometry(300, 300, 120, 120);
      applyTerrainHeights(groundGeom);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x010004,
        roughness: 1.0,
        metalness: 0.0
      });
      const ground = new THREE.Mesh(groundGeom, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      scene.add(ground);

      // Outer Arena Boundary Walls (Matrix Code Background Backdrop)
      const wallDist = 125;
      const wallH = 120;
      const wallW = 250; // 2 * wallDist

      const wallGeom = new THREE.PlaneGeometry(wallW, wallH);
      wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x020108,
        emissive: currentTheme.colorHex,
        emissiveMap: wallTexture,
        emissiveIntensity: 0.8,
        roughness: 0.8,
        metalness: 0.5,
        side: THREE.DoubleSide
      });

      // North Wall
      const wallN = new THREE.Mesh(wallGeom, wallMaterial);
      wallN.position.set(0, wallH / 2, -wallDist);
      scene.add(wallN);

      // South Wall
      const wallS = new THREE.Mesh(wallGeom, wallMaterial);
      wallS.position.set(0, wallH / 2, wallDist);
      wallS.rotation.y = Math.PI;
      scene.add(wallS);

      // East Wall
      const wallE = new THREE.Mesh(wallGeom, wallMaterial);
      wallE.position.set(wallDist, wallH / 2, 0);
      wallE.rotation.y = -Math.PI / 2;
      scene.add(wallE);

      // West Wall
      const wallW_mesh = new THREE.Mesh(wallGeom, wallMaterial);
      wallW_mesh.position.set(-wallDist, wallH / 2, 0);
      wallW_mesh.rotation.y = Math.PI / 2;
      scene.add(wallW_mesh);

      // Generate Data Towers with Blinking server indicator lights
      const colorsList = [0x00ffcc, 0xff0055, 0x00ff33, 0xffcc00];
      const minDistance = 15;

      for (let col = -3; col <= 3; col++) {
        for (let row = -3; row <= 3; row++) {
          const x = col * 24 + (Math.random() - 0.5) * 8;
          const z = row * 24 + (Math.random() - 0.5) * 8;

          // Stay away from central player spawning point
          if (Math.sqrt(x * x + z * z) < minDistance) continue;

          const w = 4 + Math.random() * 4;
          const d = 4 + Math.random() * 4;
          const h = 20 + Math.random() * 26;

          // Tower Mesh Standard Material (Mapped with Matrix Rain)
          const towerGeom = new THREE.BoxGeometry(w, h, d);
          const towerMat = new THREE.MeshStandardMaterial({
            color: 0x05030e,
            roughness: 0.15,
            metalness: 0.9,
            emissive: currentTheme.colorHex, // Dynamic theme color
            emissiveMap: matrixTexture,
            emissiveIntensity: 1.5
          });
          const groundY = getGroundHeight(x, z);
          const towerMesh = new THREE.Mesh(towerGeom, towerMat);
          towerMesh.position.set(x, groundY + h / 2, z);
          scene.add(towerMesh);

          // Save coordinates for boundary sliding checks
          towers.push({
            mesh: towerMesh,
            minX: x - w / 2,
            maxX: x + w / 2,
            minZ: z - d / 2,
            maxZ: z + d / 2
          });

          // Add Blinking Server LEDs
          const ledCount = 3 + Math.floor(Math.random() * 6);
          const ledGeom = new THREE.BoxGeometry(0.12, 0.12, 0.12);

          for (let l = 0; l < ledCount; l++) {
            const ledColor = colorsList[Math.floor(Math.random() * colorsList.length)];
            const ledMat = new THREE.MeshStandardMaterial({
              color: ledColor,
              emissive: ledColor,
              emissiveIntensity: 2.5,
              roughness: 0.05,
              metalness: 0.9
            });
            const ledMesh = new THREE.Mesh(ledGeom, ledMat);

            const checkSide = Math.random() > 0.5;
            const ledY = Math.random() * (h - 2) + 1;

            if (checkSide) {
              const xSide = w / 2 + 0.06;
              const zNoise = (Math.random() - 0.5) * (d - 1);
              ledMesh.position.set(x + (Math.random() > 0.5 ? xSide : -xSide), groundY + ledY, z + zNoise);
            } else {
              const zSide = d / 2 + 0.06;
              const xNoise = (Math.random() - 0.5) * (w - 1);
              ledMesh.position.set(x + xNoise, groundY + ledY, z + (Math.random() > 0.5 ? zSide : -zSide));
            }
            scene.add(ledMesh);

            blinkingLeds.push({
              mesh: ledMesh,
              blinkSpeed: 1.5 + Math.random() * 4,
              phase: Math.random() * Math.PI * 2
            });
          }
        }
      }

      // Add subtle elegant neon light pillars
      const proposedPillars = [
        {x: -44, z: -44}, {x: 44, z: -44},
        {x: -44, z: 44}, {x: 44, z: 44}
      ];

      proposedPillars.forEach((pos, idx) => {
        // Check distance from existing towers to avoid overlapping
        let tooClose = false;
        for (let t of towers) {
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

        const isSecondary = (idx % 2 !== 0);
        const color = isSecondary ? currentTheme.colorHexSecondary : currentTheme.colorHex;
        const pillarGroup = new THREE.Group();
        const pillarY = getGroundHeight(finalX, finalZ);
        pillarGroup.position.set(finalX, pillarY, finalZ);

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

        neonPillars.push({
          mesh: neonSleeve,
          light: pointLight,
          isSecondary: isSecondary
        });
      });

      // Cyber Blaster (Attached to camera, made of concentrated matrix code)
      weaponGroup = new THREE.Group();

      // Sleek barrel chassis (concentrated glowing cyan matrix code)
      const bodyGeom = new THREE.BoxGeometry(0.18, 0.16, 0.7);
      weaponBodyMat = new THREE.MeshStandardMaterial({
        color: 0x05030e,
        map: weaponTexture,
        emissiveMap: weaponTexture,
        emissive: currentTheme.colorHex, // Dynamic theme color
        emissiveIntensity: 3.5,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.9
      });
      const body = new THREE.Mesh(bodyGeom, weaponBodyMat);
      weaponGroup.add(body);

      // Glowing Cyan Barrel muzzle Core (super concentrated white/cyan code core)
      const barrelGeom = new THREE.BoxGeometry(0.04, 0.04, 0.65);
      weaponBarrelMat = new THREE.MeshStandardMaterial({
        color: 0x0a101f,
        map: weaponTexture,
        emissiveMap: weaponTexture,
        emissive: currentTheme.colorHexBright, // Dynamic theme bright color
        emissiveIntensity: 6.0,
        roughness: 0.05,
        metalness: 0.9,
        transparent: true,
        opacity: 0.95
      });
      const barrelGlow = new THREE.Mesh(barrelGeom, weaponBarrelMat);
      barrelGlow.position.set(0, 0.05, -0.05);
      weaponGroup.add(barrelGlow);

      // Glowing pink capacitors on the side (concentrated pink matrix code coils)
      const sideGeom = new THREE.BoxGeometry(0.22, 0.05, 0.28);
      weaponSideMat = new THREE.MeshStandardMaterial({
        color: 0x110208,
        map: weaponTexture,
        emissiveMap: weaponTexture,
        emissive: currentTheme.colorHexSecondary, // Dynamic theme secondary color
        emissiveIntensity: 4.5,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.9
      });
      const sideCoil = new THREE.Mesh(sideGeom, weaponSideMat);
      sideCoil.position.set(0, -0.04, 0.05);
      weaponGroup.add(sideCoil);

      // Align gun to camera viewport space
      weaponGroup.position.set(0.32, -0.28, -0.75);
      camera.add(weaponGroup);
      scene.add(camera);

      // POST-PROCESSING PIPELINE FOR NEON GLOW BLOOM
      const renderPass = new THREE.RenderPass(scene, camera);
      const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        2.2,  // neon glow strength
        0.42, // glow radius
        0.08  // threshold limit (low makes almost everything neon)
      );

      composer = new THREE.EffectComposer(renderer);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);

      // POINTER LOCK CONTROLS
      controls = new THREE.PointerLockControls(camera, renderer.domElement);

      controls.addEventListener("lock", () => {
        isLocked = true;
        startOverlay.classList.add("hidden");
        if (!gameStarted || gameOver) {
          startMainGameplay();
        }
      });

      controls.addEventListener("unlock", () => {
        isLocked = false;
        // Pause view or show resumption prompt if game is active
        if (usePointerLock && gameStarted && !gameOver) {
          startOverlay.classList.remove("hidden");
          const title = startOverlay.querySelector("h1");
          const btn = startOverlay.querySelector("button");
          if (title) title.innerText = "UPLINK_PAUSED";
          if (btn) btn.innerText = "RESUME PROTOCOL";
        }
      });

      // Canvas / Overlay click handler to easily re-acquire Mouse Lock during active game
      window.addEventListener("click", (e) => {
        if (usePointerLock && gameStarted && !gameOver && !isLocked) {
          if (settingsPanel && settingsPanel.contains(e.target)) return;
          if (settingsToggleBtn && settingsToggleBtn.contains(e.target)) return;
          if (controls) {
            try { controls.lock(); } catch (err) {}
          }
        }
      });

      // DRAG-TO-LOOK & TOUCH CONTROLS SETUP
      const joystickZone = document.getElementById("joystick-zone");
      const joystickKnob = document.getElementById("joystick-knob");
      const touchShootBtn = document.getElementById("touch-shoot-btn");
      const touchJumpBtn = document.getElementById("touch-jump-btn");

      // 1. Joystick movement tracking
      if (joystickZone && joystickKnob) {
        joystickZone.addEventListener("pointerdown", (e) => {
          if (controlMode !== 'touch') return;
          joystickActive = true;
          joystickPointerId = e.pointerId;
          const rect = joystickZone.getBoundingClientRect();
          joystickStartPos = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
          joystickZone.setPointerCapture(e.pointerId);
          e.stopPropagation();
        });

        joystickZone.addEventListener("pointermove", (e) => {
          if (!joystickActive || e.pointerId !== joystickPointerId) return;
          
          const deltaX = e.clientX - joystickStartPos.x;
          const deltaY = e.clientY - joystickStartPos.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const maxRadius = 40; // comfortable pull range

          let clampedX = deltaX;
          let clampedY = deltaY;

          if (distance > maxRadius) {
            clampedX = (deltaX / distance) * maxRadius;
            clampedY = (deltaY / distance) * maxRadius;
          }

          joystickKnob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;

          // Normalize values to -1 ... 1
          moveVector.x = clampedX / maxRadius;
          moveVector.y = clampedY / maxRadius; // positive = backward, negative = forward
          e.stopPropagation();
        });

        const resetJoystick = (e) => {
          if (!joystickActive) return;
          joystickActive = false;
          joystickPointerId = null;
          joystickKnob.style.transform = `translate(0px, 0px)`;
          moveVector = { x: 0, y: 0 };
          if (e && e.pointerId !== undefined) {
            try { joystickZone.releasePointerCapture(e.pointerId); } catch(err) {}
          }
        };

        joystickZone.addEventListener("pointerup", resetJoystick);
        joystickZone.addEventListener("pointercancel", resetJoystick);
      }

      // 2. Touch Shoot & Jump buttons
      if (touchShootBtn) {
        touchShootBtn.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isLocked && !gameOver) {
            fireLaserBlaster();
          }
        });
      }

      if (touchJumpBtn) {
        touchJumpBtn.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isJumping && isLocked && !gameOver) {
            isJumping = true;
            playerVelocityY = jumpPower;
            addLog("AUXILIARY JET THRUST: JUMPED");
          }
        });
      }

      // 3. Look dragging for both Free Mouse and Touch Mode
      let isDragging = false;
      let previousPointerPosition = { x: 0, y: 0 };

      window.addEventListener("pointerdown", (e) => {
        if (!gameStarted || gameOver || !isLocked) return;
        if (usePointerLock) return;

        if (controlMode === 'touch') {
          // Ignore left 45% screen to let joystick work
          if (e.clientX < window.innerWidth * 0.45) return;
          // Ignore action buttons and joystick clicks
          if (joystickZone && joystickZone.contains(e.target)) return;
          if (touchShootBtn && touchShootBtn.contains(e.target)) return;
          if (touchJumpBtn && touchJumpBtn.contains(e.target)) return;
        } else {
          // Standard FREE MOUSE mode: must click on the canvas to begin drag
          if (e.target !== renderer.domElement) return;
        }

        lookPointerId = e.pointerId;
        previousLookPosition = { x: e.clientX, y: e.clientY };
        isDragging = true;
        previousPointerPosition = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener("pointermove", (e) => {
        if (!gameStarted || gameOver || !isLocked) return;
        if (usePointerLock) return;

        if (controlMode === 'touch') {
          if (lookPointerId === null || e.pointerId !== lookPointerId) return;
          const deltaX = e.clientX - previousLookPosition.x;
          const deltaY = e.clientY - previousLookPosition.y;

          camera.rotation.y -= deltaX * 0.005; // mobile looking sensitivity
          camera.rotation.x -= deltaY * 0.005;
          camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, camera.rotation.x));

          previousLookPosition = { x: e.clientX, y: e.clientY };
        } else {
          if (!isDragging) return;
          const deltaX = e.clientX - previousPointerPosition.x;
          const deltaY = e.clientY - previousPointerPosition.y;

          camera.rotation.y -= deltaX * 0.003;
          camera.rotation.x -= deltaY * 0.003;
          camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, camera.rotation.x));

          previousPointerPosition = { x: e.clientX, y: e.clientY };
        }
      });

      const stopLooking = (e) => {
        if (lookPointerId !== null && e.pointerId === lookPointerId) {
          lookPointerId = null;
        }
        isDragging = false;
      };

      window.addEventListener("pointerup", stopLooking);
      window.addEventListener("pointercancel", stopLooking);

      // KEYBOARD TRACKING
      window.addEventListener("keydown", (e) => {
        keys[e.key.toLowerCase()] = true;
        keys[e.code.toLowerCase()] = true;

        if (e.code === "Space" && !isJumping && isLocked && !gameOver) {
          isJumping = true;
          playerVelocityY = jumpPower;
          addLog("AUXILIARY JET THRUST: JUMPED");
        }

        // ESC key pausing in Free Mouse mode
        if (e.key === "Escape" && gameStarted && !gameOver && !usePointerLock) {
          if (isLocked) {
            isLocked = false;
            startOverlay.classList.remove("hidden");
            const title = startOverlay.querySelector("h1");
            const btn = startOverlay.querySelector("button");
            if (title) title.innerText = "UPLINK_PAUSED";
            if (btn) btn.innerText = "RESUME PROTOCOL";
          } else {
            isLocked = true;
            startOverlay.classList.add("hidden");
          }
        }
      });

      window.addEventListener("keyup", (e) => {
        keys[e.key.toLowerCase()] = false;
        keys[e.code.toLowerCase()] = false;
      });

      // MOUSE CLICKS
      window.addEventListener("mousedown", (e) => {
        if (e.button === 0 && isLocked && !gameOver) {
          fireLaserBlaster();
        }
      });

      // WINDOW RESIZING
      window.addEventListener("resize", () => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        renderer.setSize(w, h);
        composer.setSize(w, h);
      });

      // START FRAME LOOP
      animate();
    }

    // SPY CORES (ENEMIES) GENERATOR
    function spawnAllEnemies() {
      // Clear old meshes and dispose resources
      enemies.forEach(e => {
        scene.remove(e.group);
        if (e.core.geometry) e.core.geometry.dispose();
        if (e.core.material) {
          if (e.core.material.map) e.core.material.map.dispose();
          e.core.material.dispose();
        }
        if (e.outerRing.geometry) e.outerRing.geometry.dispose();
        if (e.outerRing.material) {
          if (e.outerRing.material.map) e.outerRing.material.map.dispose();
          e.outerRing.material.dispose();
        }
      });
      enemies = [];

      // Spawning standard count
      for (let i = 0; i < 7; i++) {
        spawnEnemyNode(i);
      }
    }

    function spawnEnemyNode(id) {
      const group = new THREE.Group();
      const isRare = Math.random() < 0.20; // 20% chance of being the rare geometric enemy

      let core, outerRing;
      let enemyChar = null;
      let enemyCanvas = null;
      let enemyTexture = null;

      if (!isRare) {
        // Standard Enemy: Large blue cyber code symbol
        const symbolChars = ["ｦ", "ｧ", "ｨ", "ｩ", "ｪ", "ｫ", "ｬ", "ｭ", "ｮ", "ｱ", "ｲ", "ｳ", "ｴ", "ｵ", "Ψ", "Ω", "Ξ", "★", "∑", "Ø", "Æ", "𝝵", "𝝺", "𝝿"];
        const char = symbolChars[Math.floor(Math.random() * symbolChars.length)];
        enemyChar = char;

        // Generate dynamic offscreen glowing blue canvas texture
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 128, 128);
        enemyCanvas = canvas;

        // Cyber neon-blue glow
        ctx.shadowColor = currentTheme.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 92px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(char, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        enemyTexture = texture;

        // Standard perpendicular cross-plane geometry to give beautiful 3D volume
        const planeGeom = new THREE.PlaneGeometry(3.2, 3.2);
        const planeMat = new THREE.MeshStandardMaterial({
          color: 0x051b30,
          map: texture,
          emissiveMap: texture,
          emissive: currentTheme.colorHexSecondary,
          emissiveIntensity: 3.5,
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });

        core = new THREE.Mesh(planeGeom, planeMat);
        group.add(core);

        outerRing = new THREE.Mesh(planeGeom.clone(), planeMat.clone());
        outerRing.rotation.y = Math.PI / 2;
        group.add(outerRing);
      } else {
        // Rare Enemy: Original animated octahedron and cage, but colored deep cyber-blue
        const coreGeom = new THREE.OctahedronGeometry(1.2, 0); // slightly larger high-value target
        const coreMat = new THREE.MeshStandardMaterial({
          color: currentTheme.colorHexSecondary,
          emissive: currentTheme.colorHex,
          emissiveIntensity: 2.8,
          roughness: 0.1,
          metalness: 0.8
        });
        core = new THREE.Mesh(coreGeom, coreMat);
        group.add(core);

        const ringGeom = new THREE.TorusGeometry(1.8, 0.06, 8, 24);
        const ringMat = new THREE.MeshStandardMaterial({
          color: currentTheme.colorHex,
          emissive: currentTheme.colorHexSecondary,
          emissiveIntensity: 2.0,
          wireframe: true
        });
        outerRing = new THREE.Mesh(ringGeom, ringMat);
        outerRing.rotation.x = Math.random() * Math.PI;
        outerRing.rotation.y = Math.random() * Math.PI;
        group.add(outerRing);
      }

      // Calculate safe spawning position far from origin coordinates (0, 0)
      let rx = 0, rz = 0;
      while (Math.sqrt(rx * rx + rz * rz) < 22) {
        rx = (Math.random() - 0.5) * 150;
        rz = (Math.random() - 0.5) * 150;
      }
      const ry = 2.5 + Math.random() * 5.0; // floating height

      group.position.set(rx, ry, rz);
      
      // Save identifying parameters for collision/raycast hits
      group.userData = { type: "enemy", id };
      core.userData = { type: "enemy", id };
      outerRing.userData = { type: "enemy", id };

      scene.add(group);

      enemies.push({
        group,
        core,
        outerRing,
        isRare,
        char: enemyChar,
        canvas: enemyCanvas,
        texture: enemyTexture,
        speed: isRare ? 4.5 + Math.random() * 3.0 : 3.5 + Math.random() * 2.5, // Rare ones are slightly faster
        baseY: ry,
        floatOffset: Math.random() * Math.PI * 2,
        id
      });
    }

    // ROLLING GEOMETRIC OBSTACLES SYSTEM
    function spawnAllRollingShapes() {
      // Clear old rolling shapes
      rollingShapes.forEach(rs => {
        scene.remove(rs.mesh);
        if (rs.mesh.geometry) rs.mesh.geometry.dispose();
        rs.mesh.children.forEach(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        if (rs.mesh.material) rs.mesh.material.dispose();
      });
      rollingShapes = [];

      // Spawn 6 fresh shapes (exactly 3 cubes and 3 triangles)
      for (let i = 0; i < 6; i++) {
        const shapeType = (i % 2 === 0) ? "cube" : "triangle";
        spawnSingleRollingShape(1000 + i, shapeType);
      }
    }

    function spawnSingleRollingShape(id = null, forcedType = null) {
      if (id === null) {
        id = Math.floor(Math.random() * 100000);
      }
      
      const type = forcedType || (Math.random() > 0.5 ? "cube" : "triangle");
      const isCube = (type === "cube");
      const radius = isCube ? 1.5 : 1.8;
      
      // Spawn at a safe distance from player (which is around x=0, z=0)
      let rx = 0, rz = 0;
      let safe = false;
      while (!safe) {
        rx = (Math.random() - 0.5) * 200; // arena is 250 wide (-125 to 125)
        rz = (Math.random() - 0.5) * 200;
        const dist = Math.sqrt(rx * rx + rz * rz);
        if (dist > 35) { // Safe from center player spawn
          safe = true;
        }
      }
      
      const geometry = isCube 
        ? new THREE.BoxGeometry(3, 3, 3) 
        : new THREE.CylinderGeometry(1.8, 1.8, 3.2, 3);
        
      const isSecondary = Math.random() > 0.5;
      const color = isSecondary ? currentTheme.colorHexSecondary : currentTheme.colorHex;
      
      // Custom solid cyber-material
      const material = new THREE.MeshStandardMaterial({
        color: 0x05040a,
        emissive: color,
        emissiveIntensity: 1.8,
        roughness: 0.1,
        metalness: 0.9,
        flatShading: true
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      const groundY = getGroundHeight(rx, rz);
      mesh.position.set(rx, groundY + radius, rz);
      
      // If it's a triangle prism, orient it to look like a rolling cylinder-wheel
      if (!isCube) {
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.z = Math.PI / 2;
      }
      
      // Attach metadata for raycast targeting
      mesh.userData = {
        type: "rollingShape",
        id: id
      };
      
      // Wireframe overlay to emphasize geometry and show physical rotation clearly
      const wireframeGeom = new THREE.EdgesGeometry(geometry);
      const wireframeMat = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
      const wireframe = new THREE.LineSegments(wireframeGeom, wireframeMat);
      mesh.add(wireframe);
      
      // Subtle point light to cast neon glow on terrain
      const pointLight = new THREE.PointLight(color, 1.2, 10);
      pointLight.position.set(0, 0, 0);
      mesh.add(pointLight);
      
      scene.add(mesh);
      
      // Random speed and direction
      const speed = 6 + Math.random() * 8; // decent speed
      const angleDir = Math.random() * Math.PI * 2;
      const vx = Math.cos(angleDir) * speed;
      const vz = Math.sin(angleDir) * speed;
      
      rollingShapes.push({
        id: id,
        mesh: mesh,
        shapeType: type,
        radius: radius,
        vx: vx,
        vz: vz,
        isSecondary: isSecondary,
        lastDamageTime: 0
      });
    }

    // DISCHARGE SHIELDS OVERLAY RED ALERT
    function damagePlayer(amount) {
      if (gameOver) return;

      health = Math.max(0, health - amount);
      
      // HUD updates
      document.getElementById("hud-health-text").innerText = `${health}%`;
      const bar = document.getElementById("hud-health-bar");
      bar.style.width = `${health}%`;

      if (health > 60) {
        bar.className = "h-full rounded-sm bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-150";
      } else if (health > 30) {
        bar.className = "h-full rounded-sm bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-150";
      } else {
        bar.className = "h-full rounded-sm bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_8px_rgba(220,38,38,0.7)] transition-all duration-150";
        document.getElementById("hud-integrity-warning").classList.remove("hidden");
      }

      // Red overlay flash
      const flash = document.getElementById("damage-overlay");
      flash.className = "absolute inset-0 pointer-events-none z-20 bg-red-600/35 transition-none";
      setTimeout(() => {
        flash.className = "absolute inset-0 pointer-events-none z-20 bg-red-600/0 transition-all duration-150";
      }, 150);

      // Sound
      synth.playDamage();
      addLog(`ALARM: VIRUS PENETRATION IDENTIFIED! -${amount}%`);

      if (health <= 0) {
        triggerGameOver();
      }
    }

    // ACCESS CRASH TRIGGER
    function triggerGameOver() {
      gameOver = true;
      isLocked = false;
      controls.unlock();

      // UI Displays
      gameOverOverlay.classList.remove("hidden");
      hudOverlay.classList.add("hidden");
      crosshair.classList.add("hidden");
      soundBtn.classList.add("hidden");

      const touchControls = document.getElementById("touch-controls");
      if (touchControls) {
        touchControls.classList.add("hidden");
      }

      document.getElementById("final-score").innerText = score;
      const mins = Math.floor(timeElapsed / 60).toString().padStart(2, "0");
      const secs = (timeElapsed % 60).toString().padStart(2, "0");
      document.getElementById("final-time").innerText = `${mins}:${secs}`;
      document.getElementById("final-accuracy").innerText = `${shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 100}%`;

      if (score > highScore) {
        highScore = score;
        localStorage.setItem("cyber_shooter_high_score", score.toString());
        addLog(`NEW RECORD INJECTED: ${highScore} CORES!`);
      }
      document.getElementById("final-highscore").innerText = highScore;

      // Check score thresholds for terminal codes
      const codeContainer = document.getElementById("gameover-code-container");
      const codeValue = document.getElementById("gameover-code-value");
      if (codeContainer && codeValue) {
        if (score >= 250) {
          codeValue.innerText = "hacknslash-93652";
          codeContainer.classList.remove("hidden");
        } else if (score >= 100) {
          codeValue.innerText = "hacknslash-48201";
          codeContainer.classList.remove("hidden");
        } else if (score >= 25) {
          codeValue.innerText = "hacknslash-71935";
          codeContainer.classList.remove("hidden");
        } else {
          codeContainer.classList.add("hidden");
        }
        lucide.createIcons();
      }

      synth.playGameOver();
      addLog("FIREWALL COLLAPSED. SIGNAL BROKEN.");

      // Sende Game Over Event an das Parent Window
      sendIframeMessage('SHOOTER_GAME_OVER', { finalScore: score });
    }

    // SPARK / EXPLOSION VISUAL FX
    function createExplosionEffect(pos, isHostileKill) {
      const count = isHostileKill ? 20 : 7;
      const color = isHostileKill ? currentTheme.colorHex : currentTheme.colorHexSecondary;
      const size = isHostileKill ? 0.18 : 0.08;

      const geom = new THREE.BoxGeometry(size, size, size);

      for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 3.0,
          roughness: 0.1,
          metalness: 0.9
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.copy(pos);

        // Compute outward velocity vector
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.2) * 9 + 2, // burst slightly upwards
          (Math.random() - 0.5) * 9
        );

        scene.add(mesh);

        particles.push({
          mesh,
          velocity,
          life: 0,
          maxLife: 0.4 + Math.random() * 0.4
        });
      }
    }

    // LASER PROJECTILE EMITTER
    function fireLaserBlaster() {
      const now = performance.now();
      if (now - lastShotTime < 180) return; // rate limit: 180ms
      lastShotTime = now;

      shotsFired++;
      synth.playLaser();

      // Gun recoil visual animation
      if (weaponGroup) {
        weaponGroup.position.z = -0.52; // slide back
      }

      // Raycast pointing center screen
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

      const intersects = raycaster.intersectObjects(scene.children, true);

      let targetPoint = new THREE.Vector3();
      let hitObject = null;
      let isEnemyHit = false;

      // Filter out bullets and helper lines
      const validIntersects = intersects.filter(item => {
        const isBulletOrParticle = item.object.userData.type === "bullet" || particles.some(p => p.mesh === item.object);
        const isWeaponPart = weaponGroup.getObjectById(item.object.id) || item.object === weaponGroup;
        return !isBulletOrParticle && !isWeaponPart;
      });

      if (validIntersects.length > 0) {
        const close = validIntersects[0];
        targetPoint.copy(close.point);
        hitObject = close.object;

        // Traverse upwards to verify node identity
        let temp = hitObject;
        while (temp) {
          if (temp.userData && (temp.userData.type === "enemy" || temp.userData.type === "rollingShape")) {
            isEnemyHit = true;
            hitObject = temp;
            break;
          }
          temp = temp.parent;
        }
      } else {
        // Bullet goes into infinity space
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        targetPoint.copy(camera.position).add(dir.multiplyScalar(120));
      }

      if (isEnemyHit) {
        shotsHit++;
      }

      // Update accuracy
      const acc = Math.round((shotsHit / shotsFired) * 100);
      const accEl = document.getElementById("hud-accuracy");
      if (accEl) {
        accEl.innerHTML = `<i data-lucide="zap" class="w-3 h-3"></i> ${acc}%`;
        lucide.createIcons();
      }

      // Spawn flying bullet mesh
      const bulletOrigin = new THREE.Vector3(0.32, -0.28, -0.75);
      bulletOrigin.applyMatrix4(camera.matrixWorld);

      const bulletGeom = new THREE.SphereGeometry(0.12, 6, 6);
      const bulletMat = new THREE.MeshStandardMaterial({
        color: currentTheme.colorHex,
        emissive: currentTheme.colorHex,
        emissiveIntensity: 4.0,
        roughness: 0.1,
        metalness: 0.9
      });
      const bulletMesh = new THREE.Mesh(bulletGeom, bulletMat);
      bulletMesh.position.copy(bulletOrigin);
      bulletMesh.userData = { type: "bullet" };
      scene.add(bulletMesh);

      const dist = bulletOrigin.distanceTo(targetPoint);
      const speed = 165; // units per sec
      const duration = dist / speed;

      projectiles.push({
        mesh: bulletMesh,
        origin: bulletOrigin,
        target: targetPoint,
        progress: 0,
        duration,
        objectHit: isEnemyHit ? hitObject : null
      });
    }

    // SLIDING ARENA COLLISION CALCULATIONS
    function verifyMovementCollision(pos) {
      const margin = 0.95;
      const border = 115;

      // Outer arena boundary check
      if (Math.abs(pos.x) > border || Math.abs(pos.z) > border) {
        return true;
      }

      // Interactive Server Tower blocks check
      for (const t of towers) {
        if (
          pos.x + margin > t.minX &&
          pos.x - margin < t.maxX &&
          pos.z + margin > t.minZ &&
          pos.z - margin < t.maxZ
        ) {
          return true;
        }
      }
      return false;
    }

    // MAIN ANIMATE TICK LOOP (60FPS)
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1); // Prevent teleport glitches on background sleep
      const totalTime = clock.getElapsedTime();

      // Scroll the cyber grid pattern on the ground
      if (gridTexture) {
        gridTexture.offset.x += delta * 0.08;
        gridTexture.offset.y += delta * 0.08;
      }

      // Flow the matrix code on the weapon rapidly
      if (weaponTexture) {
        weaponTexture.offset.y -= delta * 0.6;
      }

      // Blinking Indicator LEDs
      blinkingLeds.forEach(led => {
        const val = Math.sin(totalTime * led.blinkSpeed + led.phase);
        if (led.mesh.material) {
          led.mesh.material.emissiveIntensity = val > 0.35 ? 3.2 : 0.1;
        }
      });

      // Flying laser bullets update
      for (let b = projectiles.length - 1; b >= 0; b--) {
        const proj = projectiles[b];
        proj.progress += delta / proj.duration;

        if (proj.progress >= 1.0) {
          // Arrived at target vector
          createExplosionEffect(proj.target, proj.objectHit !== null);

          if (proj.objectHit) {
            const hitType = proj.objectHit.userData ? proj.objectHit.userData.type : null;
            const hitId = proj.objectHit.userData ? proj.objectHit.userData.id : null;

            if (hitType === "rollingShape") {
              const idx = rollingShapes.findIndex(rs => rs.id === hitId);
              if (idx !== -1) {
                const shape = rollingShapes[idx];
                scene.remove(shape.mesh);
                if (shape.mesh.geometry) shape.mesh.geometry.dispose();
                shape.mesh.children.forEach(child => {
                  if (child.geometry) child.geometry.dispose();
                  if (child.material) child.material.dispose();
                });
                if (shape.mesh.material) shape.mesh.material.dispose();

                rollingShapes.splice(idx, 1);

                score += 2;
                document.getElementById("hud-score").innerText = score;

                synth.playExplosion();
                addLog(`GEOMETRIC CORE DESTRUCTED [${shape.shapeType.toUpperCase()}] +2 PTS`);
                sendIframeMessage('SHOOTER_SCORE_UPDATE', { score: score });

                // Respawn!
                spawnSingleRollingShape(hitId, shape.shapeType);
              }
            } else {
              const idx = enemies.findIndex(e => e.id === hitId);

              if (idx !== -1) {
                const enemy = enemies[idx];
                scene.remove(enemy.group);
                if (enemy.core.geometry) enemy.core.geometry.dispose();
                if (enemy.core.material) {
                  if (enemy.core.material.map) enemy.core.material.map.dispose();
                  enemy.core.material.dispose();
                }
                if (enemy.outerRing.geometry) enemy.outerRing.geometry.dispose();
                if (enemy.outerRing.material) {
                  if (enemy.outerRing.material.map) enemy.outerRing.material.map.dispose();
                  enemy.outerRing.material.dispose();
                }

                enemies.splice(idx, 1);
                
                // Increment scores (+3 for rare enemies, +1 for standard)
                const points = enemy.isRare ? 3 : 1;
                score += points;
                document.getElementById("hud-score").innerText = score;

                synth.playExplosion();
                if (enemy.isRare) {
                  addLog(`RARE NODE DELETED [0x${hitId.toString(16).toUpperCase()}] +3 PTS`);
                } else {
                  addLog(`NODE REMOVED [0x${hitId.toString(16).toUpperCase()}] +1 PT`);
                }

                // Sende Score Update Event an das Parent Window
                sendIframeMessage('SHOOTER_SCORE_UPDATE', { score: score });

                // Respawn new rogue octahedron core
                spawnEnemyNode(hitId);
              }
            }
          }

          scene.remove(proj.mesh);
          proj.mesh.geometry.dispose();
          proj.mesh.material.dispose();
          projectiles.splice(b, 1);
        } else {
          // Slide trajectory
          proj.mesh.position.lerpVectors(proj.origin, proj.target, proj.progress);
        }
      }

      // Explosion sparks decay update
      for (let p = particles.length - 1; p >= 0; p--) {
        const part = particles[p];
        part.life += delta;

        if (part.life >= part.maxLife) {
          scene.remove(part.mesh);
          part.mesh.geometry.dispose();
          part.mesh.material.dispose();
          particles.splice(p, 1);
        } else {
          part.mesh.position.add(part.velocity.clone().multiplyScalar(delta));
          part.velocity.y -= 25 * delta; // Gravity pull

          const scale = 1.0 - (part.life / part.maxLife);
          part.mesh.scale.setScalar(scale);
        }
      }

      // Enemies movement tracking and chasing calculations
      enemies.forEach(enemy => {
        // rotation spin
        enemy.core.rotation.x += delta * 1.5;
        enemy.core.rotation.y += delta * 1.1;

        enemy.outerRing.rotation.y -= delta * 0.8;
        enemy.outerRing.rotation.z += delta * 1.2;

        // Bobbing floating motion above terrain
        const enemyGroundY = getGroundHeight(enemy.group.position.x, enemy.group.position.z);
        enemy.group.position.y = enemyGroundY + enemy.baseY + Math.sin(totalTime * 3.4 + enemy.floatOffset) * 0.7;

        // Tracking Vector direction towards player
        const toPlayer = new THREE.Vector3().subVectors(camera.position, enemy.group.position);
        toPlayer.y = 0; // Lock to flight horizontal plane
        const dist = toPlayer.length();

        if (dist < 45 && isLocked && !gameOver) {
          toPlayer.normalize().multiplyScalar(enemy.speed * delta);
          enemy.group.position.add(toPlayer);

          // Close proximity damage trigger
          if (dist < 1.95) {
            damagePlayer(15);

            // Explosive discharge reset enemy far away
            createExplosionEffect(enemy.group.position, true);
            scene.remove(enemy.group);
            if (enemy.core.geometry) enemy.core.geometry.dispose();
            if (enemy.core.material) {
              if (enemy.core.material.map) enemy.core.material.map.dispose();
              enemy.core.material.dispose();
            }
            if (enemy.outerRing.geometry) enemy.outerRing.geometry.dispose();
            if (enemy.outerRing.material) {
              if (enemy.outerRing.material.map) enemy.outerRing.material.map.dispose();
              enemy.outerRing.material.dispose();
            }

            const hitId = enemy.id;
            enemies = enemies.filter(e => e.id !== hitId);
            spawnEnemyNode(hitId);
          }
        }
      });

      // Update rolling geometric shapes
      rollingShapes.forEach(shape => {
        // Only move if game is active
        if (isLocked && !gameOver) {
          shape.mesh.position.x += shape.vx * delta;
          shape.mesh.position.z += shape.vz * delta;

          // Bounce off boundary walls (wallDist = 125, let's keep margin at 120)
          const limit = 120;
          if (shape.mesh.position.x > limit) {
            shape.mesh.position.x = limit;
            shape.vx = -Math.abs(shape.vx);
          } else if (shape.mesh.position.x < -limit) {
            shape.mesh.position.x = -limit;
            shape.vx = Math.abs(shape.vx);
          }

          if (shape.mesh.position.z > limit) {
            shape.mesh.position.z = limit;
            shape.vz = -Math.abs(shape.vz);
          } else if (shape.mesh.position.z < -limit) {
            shape.mesh.position.z = -limit;
            shape.vz = Math.abs(shape.vz);
          }

          // Check collision with Server Towers to bounce off!
          const margin = shape.radius + 1.0;
          for (const t of towers) {
            if (
              shape.mesh.position.x + margin > t.minX &&
              shape.mesh.position.x - margin < t.maxX &&
              shape.mesh.position.z + margin > t.minZ &&
              shape.mesh.position.z - margin < t.maxZ
            ) {
              // Simple bounce: reverse movement vector
              shape.vx = -shape.vx;
              shape.vz = -shape.vz;
              // Push it out slightly to prevent getting stuck
              shape.mesh.position.x += shape.vx * delta * 1.5;
              shape.mesh.position.z += shape.vz * delta * 1.5;
              break;
            }
          }
        }

        // Apply dynamic terrain height
        const groundY = getGroundHeight(shape.mesh.position.x, shape.mesh.position.z);
        shape.mesh.position.y = groundY + shape.radius;

        // Apply physical rolling rotation
        const speedVal = Math.sqrt(shape.vx * shape.vx + shape.vz * shape.vz);
        if (speedVal > 0.001) {
          const dx = shape.vx / speedVal;
          const dz = shape.vz / speedVal;
          
          // Rotation axis perpendicular to movement: (-dz, 0, dx)
          const rotAxis = new THREE.Vector3(-dz, 0, dx).normalize();
          const angle = (speedVal * delta) / shape.radius;
          shape.mesh.rotateOnWorldAxis(rotAxis, angle);
        }

        // Proximity check for player damage
        if (isLocked && !gameOver) {
          const distToPlayer = camera.position.distanceTo(shape.mesh.position);
          if (distToPlayer < (shape.radius + 1.2)) {
            const now = performance.now();
            if (now - shape.lastDamageTime > 1500) {
              shape.lastDamageTime = now;
              damagePlayer(15);
              
              // Spark particles at impact point
              const hitPos = new THREE.Vector3().copy(camera.position).add(shape.mesh.position).multiplyScalar(0.5);
              createExplosionEffect(hitPos, false);
            }
          }
        }
      });

      // Player First Person controls WASD Sliding
      if (isLocked && !gameOver) {
        const speed = 16.0;
        const moveVec = new THREE.Vector3();

        // Direction looking vectors
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, camera.up).normalize();

        if (keys["w"] || keys["arrowup"]) moveVec.add(forward);
        if (keys["s"] || keys["arrowdown"]) moveVec.sub(forward);
        if (keys["d"] || keys["arrowright"]) moveVec.add(right);
        if (keys["a"] || keys["arrowleft"]) moveVec.sub(right);

        // Touch control movement joystick input
        if (controlMode === 'touch') {
          if (moveVector.y !== 0) {
            moveVec.addScaledVector(forward, -moveVector.y);
          }
          if (moveVector.x !== 0) {
            moveVec.addScaledVector(right, moveVector.x);
          }
        }

        if (moveVec.lengthSq() > 0) {
          moveVec.normalize().multiplyScalar(speed * delta);

          // Test sliding collision on X coordinate separately
          const oldX = camera.position.x;
          camera.position.x += moveVec.x;
          if (verifyMovementCollision(camera.position)) {
            camera.position.x = oldX;
          }

          // Test sliding collision on Z coordinate separately
          const oldZ = camera.position.z;
          camera.position.z += moveVec.z;
          if (verifyMovementCollision(camera.position)) {
            camera.position.z = oldZ;
          }
        }

        // Jump mechanics
        const currentGroundHeight = getGroundHeight(camera.position.x, camera.position.z);
        if (isJumping) {
          camera.position.y += playerVelocityY * delta;
          playerVelocityY -= gravity * delta;

          if (camera.position.y <= defaultPlayerHeight + currentGroundHeight) {
            camera.position.y = defaultPlayerHeight + currentGroundHeight;
            isJumping = false;
            playerVelocityY = 0;
            addLog("DECK ANCHOR ATTACHED (LANDED)");
          }
        } else {
          // Smoothly lerp camera height to ground height
          const targetY = defaultPlayerHeight + currentGroundHeight;
          camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 15 * delta);
        }

        // Cyber Blaster weapon swaying
        if (weaponGroup) {
          const isMoving = moveVec.lengthSq() > 0;
          const swayTime = totalTime * (isMoving ? 11 : 3.5);

          const swayX = isMoving ? Math.sin(swayTime) * 0.024 : Math.sin(swayTime) * 0.005;
          const swayY = isMoving ? Math.abs(Math.cos(swayTime)) * 0.016 - 0.01 : Math.sin(swayTime * 0.5) * 0.004;

          // slide recovery
          const targetZ = -0.75;
          const recRecover = THREE.MathUtils.lerp(weaponGroup.position.z, targetZ, 8 * delta);

          weaponGroup.position.set(0.32 + swayX, -0.28 + swayY, recRecover);
        }
      }

      // Render Viewport Scene
      if (composer) {
        composer.render();
      } else if (renderer) {
        renderer.render(scene, camera);
      }
    }

    // RUN THE HACKER GRID ENGINE
    initEngine();
