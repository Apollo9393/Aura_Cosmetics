const slides = document.querySelectorAll(".slide");
const slideData = Array.from(slides).map((s) => ({
  slide: s,
  video: s.querySelector(".bg-video"),
  title: s.querySelector(".title"),
  description: s.querySelector(".description"),
  btn: s.querySelector(".btn")
}));

let currentSlideIndex = 0;
let isTransitioning = false;
let isFirstInit = true;

function runSlideSequence(slideIndex) {
  isTransitioning = true;

  const current = slideData[slideIndex];
  if (!current) return;

  slideData.forEach((item, idx) => {
    if (idx !== slideIndex) {
      item.slide.classList.remove("active");
      const v = item.video;
      if (v) {
        v.pause();
        if (v._timeHandler) {
          v.removeEventListener("timeupdate", v._timeHandler);
          v._timeHandler = null;
        }
        v.classList.add("fade-out-left");
      }
      if (item.title) item.title.classList.add("fade-out-left");
      if (item.description) item.description.classList.add("fade-out-left");
      if (item.btn) item.btn.classList.add("fade-out-left");
    }
  });

  current.slide.classList.add("active");
  const video = current.video;
  const title = current.title;
  const description = current.description;
  const btn = current.btn;

  if (video) video.classList.remove("fade-out-left");
  if (title) title.classList.remove("fade-out-left");
  if (description) description.classList.remove("fade-out-left");
  if (btn) btn.classList.remove("fade-out-left");

  if (isFirstInit) {
    isFirstInit = false;
    isTransitioning = false;
    if (video) video.play().catch(() => { });
  } else {
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => { });
    }
    requestAnimationFrame(() => {
      isTransitioning = false;
    });
  }

  let hasTriggeredExit = false;
  let titleExited = false;
  let descExited = false;
  let videoExited = false;
  let btnExited = false;

  const handleTimeUpdate = () => {
    const timeLeft = video.duration - video.currentTime;

    if (timeLeft <= 1.80 && !titleExited) {
      titleExited = true;
      if (title) title.classList.add("fade-out-left");
    }
    if (timeLeft <= 1.62 && !descExited) {
      descExited = true;
      if (description) description.classList.add("fade-out-left");
    }
    if (timeLeft <= 1.44 && !videoExited) {
      videoExited = true;
      if (video) video.classList.add("fade-out-left");
    }
    if (timeLeft <= 1.26 && !btnExited) {
      btnExited = true;
      if (btn) btn.classList.add("fade-out-left");
    }

    if (timeLeft <= 0.65 && !hasTriggeredExit) {
      hasTriggeredExit = true;
      video.pause();
      video.removeEventListener("timeupdate", handleTimeUpdate);

      currentSlideIndex = (currentSlideIndex + 1) % slides.length;
      runSlideSequence(currentSlideIndex);
    }
  };

  if (video) {
    video._timeHandler = handleTimeUpdate;
    video.addEventListener("timeupdate", handleTimeUpdate);
  }
}

const prevBtn = document.querySelector(".prev-arrow");
const nextBtn = document.querySelector(".next-arrow");

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    prevBtn.blur();
    if (isTransitioning) return;
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    runSlideSequence(currentSlideIndex);
  });
  prevBtn.addEventListener("touchend", () => { setTimeout(() => prevBtn.blur(), 80); }, { passive: true });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    nextBtn.blur();
    if (isTransitioning) return;
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    runSlideSequence(currentSlideIndex);
  });
  nextBtn.addEventListener("touchend", () => { setTimeout(() => nextBtn.blur(), 80); }, { passive: true });
}

// Свайпы пальцем
let touchStartX = 0;
let touchStartY = 0;

window.addEventListener("touchstart", (e) => {
  if (e.target && e.target.closest && e.target.closest(".side-nav, .slider-arrow, .btn, .burger-btn, .header, .products-section, .close-menu-btn")) return;
  if (document.body.classList.contains("overlay-open") || document.documentElement.classList.contains("overlay-open")) return;
  if (document.body.classList.contains("nav-menu-open") || document.documentElement.classList.contains("nav-menu-open")) return;
  if (document.querySelector(".products-section.open")) return;
  if (window.scrollY > (window.innerHeight * 0.7)) return;

  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

window.addEventListener("touchend", (e) => {
  if (e.target && e.target.closest && e.target.closest(".side-nav, .slider-arrow, .btn, .burger-btn, .header, .products-section, .close-menu-btn")) return;
  if (document.body.classList.contains("overlay-open") || document.documentElement.classList.contains("overlay-open")) return;
  if (document.body.classList.contains("nav-menu-open") || document.documentElement.classList.contains("nav-menu-open")) return;
  if (document.querySelector(".products-section.open")) return;
  if (window.scrollY > (window.innerHeight * 0.7)) return;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  if (Math.abs(diffX) > 55 && Math.abs(diffX) > Math.abs(diffY) * 2.0) {
    if (isTransitioning) return;
    if (diffX < 0) {
      currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    } else {
      currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    }
    runSlideSequence(currentSlideIndex);
  }
}, { passive: true });

runSlideSequence(0);

// ==========================================
// БОТАНИЧЕСКИЙ ДВИЖОК (РАСТЕНИЯ)
// ==========================================
class NeonBotanicalEngine {
  constructor(canvas, container) {
    this.canvas = canvas;
    this.container = container;
    this.ctx = canvas.getContext("2d", { alpha: true });

    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.animFrameId = null;

    // Параметры частицы и шлейфа
    this.particle = { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 };
    this.trail = [];
    this.maxTrail = 55;

    // Состояние анимации
    this.isActive = false;
    this.isDrawingFlower = false;
    this.flowerProgress = 0;
    this.flowerType = 0;
    this.drawnPoints = [];
    this.flowerCompletedTime = 0;
    this.isDissolving = false;
    this.flowerCenter = { x: 0, y: 0 };
    this.baseCenter = { x: 0, y: 0 };

    this.themes = [
      { name: "Emerald Tree", glowColor: "rgba(142, 245, 40, 0.8)", coreColor: "rgba(235, 255, 210, 0.95)", shadowColor: "#8ef528" },
      { name: "Botanical Leaf Branch", glowColor: "rgba(110, 255, 60, 0.8)", coreColor: "rgba(225, 255, 200, 0.95)", shadowColor: "#6eff3c" },
      { name: "Sacred Lotus", glowColor: "rgba(162, 255, 66, 0.8)", coreColor: "rgba(240, 255, 220, 0.95)", shadowColor: "#a2ff42" },
      { name: "Royal Rose", glowColor: "rgba(142, 245, 40, 0.85)", coreColor: "rgba(245, 255, 230, 0.95)", shadowColor: "#8ef528" },
      { name: "Exotic Orchid", glowColor: "rgba(120, 255, 50, 0.8)", coreColor: "rgba(230, 255, 210, 0.95)", shadowColor: "#78ff32" },
      { name: "Neon Sakura", glowColor: "rgba(175, 255, 80, 0.8)", coreColor: "rgba(245, 255, 225, 0.95)", shadowColor: "#afff50" },
      { name: "Cyber Fern", glowColor: "rgba(130, 255, 70, 0.8)", coreColor: "rgba(230, 255, 215, 0.95)", shadowColor: "#82ff46" },
      { name: "Weeping Willow", glowColor: "rgba(150, 250, 55, 0.8)", coreColor: "rgba(240, 255, 225, 0.95)", shadowColor: "#96fa37" }
    ];

    this.initSize();
    this.bindEvents();
  }

  isMobile() {
    return window.innerWidth <= 600 || (window.innerWidth <= 768 && window.innerHeight <= 600) || window.innerHeight <= 500;
  }

  isPortraitTablet() {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches || (window.innerHeight > window.innerWidth);
    const isTabletWidth = (window.innerWidth >= 601 && window.innerWidth <= 1200);
    return isPortrait && isTabletWidth;
  }

  initSize(force = false) {
    if (!this.container || !this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    const newWidth = Math.round(this.container.scrollWidth || rect.width || window.innerWidth);
    const newHeight = Math.round(Math.max(this.container.scrollHeight || 0, rect.height || 0, window.innerHeight));

    if (!force && this.width > 0 && this.height > 0) {
      const widthDiff = Math.abs(newWidth - this.width);
      const heightDiff = Math.abs(newHeight - this.height);
      if (widthDiff < 8 && heightDiff < 140) {
        return;
      }
    }

    this.width = newWidth;
    this.height = newHeight;
    const isMob = this.isMobile();
    const isTabletPort = this.isPortraitTablet();
    this.dpr = isMob ? 1.0 : (isTabletPort ? 1.25 : Math.min(window.devicePixelRatio || 1, 1.5));
    this.maxTrail = isMob ? 32 : 55;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
    }
  }

  bindEvents() {
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;

    window.addEventListener("resize", () => {
      const curW = window.innerWidth;
      const curH = window.innerHeight;
      if (Math.abs(curW - lastW) > 20 || Math.abs(curH - lastH) > 150) {
        lastW = curW;
        lastH = curH;
        this.initSize(true);
      }
    }, { passive: true });

    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        lastW = window.innerWidth;
        lastH = window.innerHeight;
        this.initSize(true);
      }, 100);
    });
  }

  // 8 параметрических формул растений (Деревья, Кусты, Цветы)
  getBotanicalPoint(t, cx, cy, radius, type) {
    switch (type % 8) {
      case 0: { // Emerald Tree (Дерево)
        const theta = t * Math.PI * 10;
        const branchWave = Math.sin(3 * theta) * Math.cos(2 * theta);
        const r = radius * (0.35 + 0.65 * Math.abs(branchWave)) * (0.3 + 0.7 * t);
        return { x: cx + r * Math.sin(theta) * 1.1 + Math.sin(7 * theta) * 16, y: cy - r * Math.cos(theta) * 0.95 - (1 - t) * 35 };
      }
      case 1: { // Botanical Leaf Branch / Bush (Куст / Ветка)
        const theta = t * Math.PI * 8;
        const stemY = (t - 0.5) * radius * 1.6;
        const leafWave = Math.pow(Math.abs(Math.sin(2.5 * theta)), 1.5) * (1 - Math.abs(t - 0.5) * 0.5);
        const side = Math.cos(theta) >= 0 ? 1 : -1;
        return { x: cx + side * leafWave * radius * 0.85 + Math.sin(theta * 0.5) * 16, y: cy + stemY };
      }
      case 2: { // Sacred Lotus (Цветок Лотос)
        const theta = t * Math.PI * 8;
        const petal = Math.pow(Math.abs(Math.cos(4 * theta)), 0.8);
        const r = radius * (0.28 + 0.72 * petal) * (0.35 + 0.65 * t);
        return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) * 0.85 };
      }
      case 3: { // Royal Rose (Цветок Роза)
        const theta = t * Math.PI * 10;
        const spiral = 0.22 + 0.78 * Math.sqrt(t);
        const petal = 0.82 + 0.18 * Math.sin(6 * theta);
        const r = radius * spiral * petal;
        return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) * 0.85 };
      }
      case 4: { // Exotic Orchid (Орхидея)
        const theta = t * Math.PI * 6;
        const wing = Math.sin(2.5 * theta) + 0.45 * Math.cos(5 * theta);
        const r = radius * (0.3 + 0.7 * Math.abs(wing)) * (0.3 + 0.7 * t);
        return { x: cx + r * Math.cos(theta) + Math.sin(7 * theta) * 12, y: cy + r * Math.sin(theta) * 0.75 + Math.cos(3 * theta) * 14 };
      }
      case 5: { // Neon Sakura (Сакура)
        const theta = t * Math.PI * 10;
        const petal = Math.cos(2.5 * theta);
        const r = radius * (0.35 + 0.65 * Math.abs(petal)) * (0.3 + 0.7 * t);
        return { x: cx + r * Math.cos(theta) + Math.sin(theta * 0.5) * 20, y: cy + r * Math.sin(theta) * 0.85 - Math.cos(theta * 0.5) * 15 };
      }
      case 6: { // Cyber Fern / Bush (Папоротник / Густой куст)
        const theta = t * Math.PI * 9;
        const curveX = Math.sin(theta * 0.4) * radius * 0.4;
        const frond = Math.sin(4 * theta) * (1 - t * 0.5) * radius * 0.6;
        const frondY = (t - 0.5) * radius * 1.5;
        return { x: cx + curveX + frond, y: cy + frondY + Math.cos(2 * theta) * 10 };
      }
      case 7:
      default: { // Weeping Willow (Плакучее дерево)
        const theta = t * Math.PI * 10;
        const arch = Math.sin(theta * 0.5);
        const cascade = Math.cos(3 * theta) * radius * 0.5;
        const r = radius * (0.3 + 0.7 * t);
        return { x: cx + arch * r * 0.9 + Math.sin(5 * theta) * 15, y: cy - (1 - t) * 40 + Math.abs(cascade) * 1.1 };
      }
    }
  }

  pickRandomTheme(excludeType = null) {
    let nextType;
    let attempts = 0;
    do {
      nextType = Math.floor(Math.random() * this.themes.length);
      attempts++;
    } while (this.themes.length > 1 && nextType === excludeType && attempts < 10);
    return nextType;
  }

  spawnAt(x, y, themeIndex = null) {
    const clampedX = Math.max(60, Math.min(this.width - 60, x));
    if (this.isDrawingFlower && !this.isDissolving && this.flowerCenter && (this.flowerCenter.x !== 0 || this.flowerCenter.y !== 0)) {
      const dist = Math.hypot(clampedX - this.flowerCenter.x, y - this.flowerCenter.y);
      if (dist < 45 && themeIndex === null) {
        this.recenter(clampedX, y);
        return;
      }
    }

    this.isActive = true;
    this.baseCenter = { x, y };
    this.flowerCenter = { x: clampedX, y };
    this.flowerType = (themeIndex !== null && themeIndex !== undefined) ? themeIndex : this.pickRandomTheme(this.flowerType);
    this.isDrawingFlower = true;
    this.isDissolving = false;
    this.flowerProgress = 0;
    this.drawnPoints = [];
    this.flowerCompletedTime = 0;

    this.particle.x = this.flowerCenter.x;
    this.particle.y = this.flowerCenter.y;
    this.particle.targetX = this.flowerCenter.x;
    this.particle.targetY = this.flowerCenter.y;
  }

  recenter(newX, newY) {
    const clampedX = Math.max(60, Math.min(this.width - 60, newX));
    if (!this.flowerCenter || (this.flowerCenter.x === 0 && this.flowerCenter.y === 0)) {
      this.flowerCenter = { x: clampedX, y: newY };
      this.baseCenter = { x: clampedX, y: newY };
      this.particle.x = clampedX;
      this.particle.y = newY;
      this.particle.targetX = clampedX;
      this.particle.targetY = newY;
      return;
    }
    const dx = clampedX - this.flowerCenter.x;
    const dy = newY - this.flowerCenter.y;
    this.flowerCenter = { x: clampedX, y: newY };
    this.baseCenter = { x: clampedX, y: newY };
    this.particle.x += dx;
    this.particle.y += dy;
    this.particle.targetX += dx;
    this.particle.targetY += dy;
    if (this.drawnPoints && this.drawnPoints.length > 0) {
      for (let i = 0; i < this.drawnPoints.length; i++) {
        this.drawnPoints[i].x += dx;
        this.drawnPoints[i].y += dy;
      }
    }
    if (this.trail && this.trail.length > 0) {
      for (let i = 0; i < this.trail.length; i++) {
        this.trail[i].x += dx;
        this.trail[i].y += dy;
      }
    }
  }

  dissolve() {
    this.isActive = false;
    if (this.isDrawingFlower && !this.isDissolving) {
      this.isDissolving = true;
    }
  }

  stopDrawing() {
    this.isActive = false;
    this.isDrawingFlower = false;
    this.isDissolving = false;
    this.drawnPoints = [];
  }

  start() {
    if (this.animFrameId) return;

    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      if (!this.ctx) return;

      // Очистка с учетом DPR
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();

      const now = Date.now();
      const isMob = this.isMobile();
      const isTabletPort = this.isPortraitTablet();
      const currentTheme = this.themes[this.flowerType % this.themes.length];

      const wideGlowVal = isTabletPort ? 32 : (isMob ? 8 : 26);
      const coreGlowVal = isTabletPort ? 12 : (isMob ? 2 : 10);
      const botanicalRadius = isTabletPort
        ? Math.min(this.width * 0.58, 480)
        : (isMob ? Math.min(this.width * 0.44, 230) : Math.min(this.width * 0.28, 300));
      const outerLineWidth = isTabletPort ? 4.5 : 3.6;
      const coreLineWidth = isTabletPort ? 1.8 : 1.4;
      const particleRadius = isTabletPort ? 5.5 : 4.5;

      if (this.isDrawingFlower) {
        // Фаза роста
        if (this.flowerProgress < 1.0) {
          this.flowerProgress += 0.012;
          const pt = this.getBotanicalPoint(this.flowerProgress, this.flowerCenter.x, this.flowerCenter.y, botanicalRadius, this.flowerType);
          this.drawnPoints.push(pt);
          this.particle.x += (pt.x - this.particle.x) * 0.45;
          this.particle.y += (pt.y - this.particle.y) * 0.45;
          if (this.flowerProgress >= 1.0) {
            this.flowerProgress = 1.0;
            this.flowerCompletedTime = now;
          }
        }
        // Фаза дыхания (Breathe) после раскрытия — длится 3 секунды
        else if (!this.isDissolving) {
          const breatheTheta = now * 0.0025;
          const pt = this.getBotanicalPoint(0.96, this.flowerCenter.x, this.flowerCenter.y, botanicalRadius * (1 + 0.04 * Math.sin(breatheTheta)), this.flowerType);
          this.particle.x += (pt.x - this.particle.x) * 0.1;
          this.particle.y += (pt.y - this.particle.y) * 0.1;
          if (now - this.flowerCompletedTime >= 3000) {
            this.isDissolving = true;
          }
        }

        // Фаза растворения
        if (this.isDissolving) {
          if (this.drawnPoints.length > 0) {
            this.drawnPoints.splice(0, 4);
          }
          this.particle.targetX = this.baseCenter.x;
          this.particle.targetY = this.baseCenter.y;
          this.particle.vx = (this.particle.targetX - this.particle.x) * 0.12;
          this.particle.vy = (this.particle.targetY - this.particle.y) * 0.12;
          this.particle.x += this.particle.vx;
          this.particle.y += this.particle.vy;

          // Когда растворение завершено:
          if (this.drawnPoints.length === 0) {
            if (this.isActive) {
              // Если плашка все еще активна — сразу запускаем новое случайное растение!
              this.flowerType = this.pickRandomTheme(this.flowerType);
              this.isDissolving = false;
              this.flowerProgress = 0;
              this.drawnPoints = [];
              this.flowerCompletedTime = 0;
              this.isDrawingFlower = true;
            } else {
              // Если плашка закрыта/свернута — останавливаем отрисовку
              this.isDissolving = false;
              this.isDrawingFlower = false;
              this.flowerProgress = 0;
            }
          }
        }

        // Рендер двойного неонового свечения
        if (this.drawnPoints.length > 2) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.drawnPoints[0].x, this.drawnPoints[0].y);
          for (let i = 1; i < this.drawnPoints.length; i++) {
            this.ctx.lineTo(this.drawnPoints[i].x, this.drawnPoints[i].y);
          }
          // Внешний контур (Широкий Glow)
          this.ctx.strokeStyle = currentTheme.glowColor;
          this.ctx.lineWidth = outerLineWidth;
          this.ctx.shadowColor = currentTheme.shadowColor;
          this.ctx.shadowBlur = wideGlowVal;
          this.ctx.lineCap = "round";
          this.ctx.lineJoin = "round";
          this.ctx.stroke();

          // Внутренний яркий сердечник (Core)
          this.ctx.strokeStyle = currentTheme.coreColor;
          this.ctx.lineWidth = coreLineWidth;
          this.ctx.shadowBlur = coreGlowVal;
          this.ctx.stroke();
        }
      }

      // Траектория шлейфа (Particle Trail)
      this.trail.unshift({ x: this.particle.x, y: this.particle.y, time: now });
      if (this.trail.length > this.maxTrail) this.trail.pop();

      if (this.trail.length > 2 && this.isDrawingFlower) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
          this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        this.ctx.strokeStyle = "rgba(142, 245, 40, 0.75)";
        this.ctx.lineWidth = isTabletPort ? 4.5 : 3.2;
        this.ctx.shadowColor = "#8ef528";
        this.ctx.shadowBlur = wideGlowVal;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.stroke();
      }

      // Головная светящаяся частица
      if (this.isDrawingFlower) {
        this.ctx.beginPath();
        this.ctx.arc(this.particle.x, this.particle.y, particleRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.shadowColor = "#ffffff";
        this.ctx.shadowBlur = wideGlowVal;
        this.ctx.fill();
      }
    };

    animate();
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}

// ==========================================
// ОСНОВНОЕ ПРИЛОЖЕНИЕ И ОВЕРЛЕИ
// ==========================================
const initApp = () => {
  const productsSection = document.querySelector(".products-section");
  const botanicalCanvas = document.getElementById("botanicalCanvas");
  const botanicalEngine = (botanicalCanvas && productsSection) ? new NeonBotanicalEngine(botanicalCanvas, productsSection) : null;
  if (botanicalEngine) botanicalEngine.start();

  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const productButtons = document.querySelectorAll(".product-link");

  const aboutPanel = document.getElementById("aboutPanel");
  const contactPanel = document.getElementById("contactPanel");
  const navLinks = document.querySelectorAll(".side-nav a");

  let activeOverlay = null;
  let closeTimeout = null;
  let menuPlaceholder = null;

  let activeProductRow = null;
  let userTapLockUntil = 0;

  const checkIsLandscape = () => {
    return window.matchMedia("(orientation: landscape) and (max-height: 600px)").matches ||
      (window.innerHeight <= 600 && window.innerWidth > window.innerHeight) ||
      (window.innerWidth <= 768 && window.innerWidth > window.innerHeight);
  };
  const checkIsMobileOrPortraitTablet = () => {
    return ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (window.matchMedia("(pointer: coarse)").matches) ||
      (window.innerWidth <= 1024) ||
      (window.innerHeight <= 600);
  };

  const warmSlide2 = () => {
    const slide2 = document.querySelector(".slide:nth-child(2)");
    if (!slide2) return;
    const v = slide2.querySelector(".bg-video");
    if (v && v.preload !== "auto") {
      v.preload = "auto";
      v.muted = true;
      v.playsInline = true;
      v.load();
    }
  };
  setTimeout(warmSlide2, 1200);

  let isCatalogWarmed = false;
  const preloadCatalogVideos = () => {
    if (isCatalogWarmed) return;
    isCatalogWarmed = true;

    const vids = Array.from(document.querySelectorAll(".products-section .preview-video"));
    if (!vids.length) return;

    if (vids[0]) {
      vids[0].preload = "auto";
      vids[0].muted = true;
      vids[0].playsInline = true;
      vids[0].load();
    }
    setTimeout(() => {
      if (vids[1]) {
        vids[1].preload = "auto";
        vids[1].muted = true;
        vids[1].playsInline = true;
        vids[1].load();
      }
    }, 350);
  };

  if ("IntersectionObserver" in window && productsSection) {
    const catalogObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          preloadCatalogVideos();
          catalogObserver.disconnect();
        }
      });
    }, { rootMargin: "1200px" });
    catalogObserver.observe(productsSection);
  }
  setTimeout(() => preloadCatalogVideos(), 1500);

  const playRowPreviewVideo = (row, delay = 0) => {
    const video = row.querySelector(".preview-video");
    if (!video) return;

    video.muted = true;
    video.playsInline = true;
    if (video.readyState === 0) {
      video.preload = "auto";
      video.load();
    }

    const targetFreezeTime = 6.4;
    video.playbackRate = 2.5;

    // Сбрасываем на начало только если видео уже проиграно, чтобы исключить задержку видеодекодера
    if (video.currentTime > 0.08) {
      try { video.currentTime = 0; } catch (e) { }
    }

    const startPlay = () => {
      if (!row.classList.contains("auto-active") && !row.matches(":hover")) return;
      const playPromise = video.play();
      if (playPromise !== undefined) playPromise.catch(() => { });

      if (video._rafAnim) cancelAnimationFrame(video._rafAnim);
      const checkTime = () => {
        if (!row.classList.contains("auto-active") && !row.matches(":hover")) {
          video.pause();
          video._rafAnim = null;
          return;
        }
        if (video.currentTime >= targetFreezeTime) {
          video.pause();
          video._rafAnim = null;
        } else if (!video.paused) {
          video._rafAnim = requestAnimationFrame(checkTime);
        }
      };
      video._rafAnim = requestAnimationFrame(checkTime);
    };

    if (delay > 0) setTimeout(startPlay, delay);
    else startPlay();
  };

  const stopRowPreviewVideo = (row) => {
    const video = row.querySelector(".preview-video");
    if (video) {
      if (video._rafAnim) {
        cancelAnimationFrame(video._rafAnim);
        video._rafAnim = null;
      }
      video.pause();
      try { video.currentTime = 0; } catch (e) { }
    }
  };

  const calculateCenterScroll = (container, row, isLandscape) => {
    if (!container || !row) return 0;
    const containerHeight = container.clientHeight || window.innerHeight;
    const isMobilePortrait = !isLandscape && checkIsMobileOrPortraitTablet();
    const effectiveRowHeight = isMobilePortrait ? (row.offsetHeight + 245) : row.offsetHeight;
    const rowCenter = row.offsetTop + (effectiveRowHeight / 2);
    const viewportCenter = containerHeight / 2;
    return Math.max(0, Math.round(rowCenter - viewportCenter));
  };

  const getJarCenter = (row, container) => {
    if (!row || !container) return { x: window.innerWidth * 0.7, y: 300 };
    const preview = row.querySelector(".product-preview");
    const containerRect = container.getBoundingClientRect();
    const isMobile = checkIsMobileOrPortraitTablet();

    if (preview) {
      const pRect = preview.getBoundingClientRect();
      if (pRect.width > 0 && pRect.height > 0) {
        return {
          x: pRect.left - containerRect.left + (pRect.width / 2),
          y: pRect.top - containerRect.top + (container.scrollTop || 0) + (pRect.height / 2)
        };
      }
    }

    const rowY = row.offsetTop + (row.offsetHeight / 2);
    if (isMobile) {
      return {
        x: container.clientWidth / 2,
        y: rowY + 120
      };
    } else {
      return {
        x: Math.max(container.clientWidth * 0.75, container.clientWidth - 350),
        y: rowY
      };
    }
  };

  const toggleProductRow = (container, row, { shouldScroll = false, isUserClick = false } = {}) => {
    if (!container || !row) return;
    if (row.classList.contains("auto-active") && isUserClick) return;
    activateProductRow(container, row, { shouldScroll, isUserClick });
  };

  const activateProductRow = (container, row, { shouldScroll = false, isUserClick = false } = {}) => {
    if (!container || !row) return;
    if (isUserClick) userTapLockUntil = Date.now() + 800;
    if (activeProductRow === row && row.classList.contains("auto-active")) return;

    activeProductRow = row;
    const rows = container.querySelectorAll(".product-row");
    rows.forEach((r) => {
      if (r === row) {
        if (!r.classList.contains("auto-active")) {
          // Мгновенно гасим остальные плашки
          rows.forEach((other) => {
            if (other !== r) {
              other.classList.remove("auto-active", "highlighted");
              stopRowPreviewVideo(other);
            }
          });
          r.classList.add("auto-active");
          playRowPreviewVideo(r, 0);

          if (botanicalEngine) {
            botanicalEngine.initSize();
            const center = getJarCenter(r, container);
            botanicalEngine.spawnAt(center.x, center.y);
          }
        }
      } else {
        r.classList.remove("auto-active", "highlighted");
        stopRowPreviewVideo(r);
      }
    });

    if (shouldScroll && container.classList.contains("overlay-mode") && !isUserClick) {
      const isLandscape = checkIsLandscape();
      const isMobile = checkIsMobileOrPortraitTablet();
      if (isMobile) {
        const targetScroll = calculateCenterScroll(container, row, isLandscape);
        container.scrollTop = targetScroll;
      }
    }
  };

  const deactivateAllProductRows = (container) => {
    if (!container) return;
    activeProductRow = null;
    if (botanicalEngine) {
      botanicalEngine.dissolve();
    }
    const rows = container.querySelectorAll(".product-row");
    rows.forEach((r) => {
      r.classList.remove("auto-active", "highlighted");
      stopRowPreviewVideo(r);
    });
  };

  const initProductRowsHover = (container) => {
    const rows = container.querySelectorAll(".product-row");

    rows.forEach((row) => {
      // Единый обработчик наведения для мыши
      row.addEventListener("mouseenter", () => {
        // Принудительно гасим ВСЕ остальные плашки перед открытием этой
        rows.forEach((r) => {
          if (r !== row) {
            r.classList.remove("auto-active", "highlighted");
            stopRowPreviewVideo(r);
          }
        });
        activateProductRow(container, row, { shouldScroll: false, isUserClick: false });
      });

      row.addEventListener("mouseleave", () => {
        row.classList.remove("auto-active", "highlighted");
        stopRowPreviewVideo(row);
        if (activeProductRow === row) activeProductRow = null;
        if (checkIsMobileOrPortraitTablet() && typeof updateCenterRowGlobal === "function") {
          setTimeout(updateCenterRowGlobal, 40);
        }
      });

      let touchStartX = 0, touchStartY = 0, touchStartTime = 0, touchMoved = false;
      let lastTouchTapTime = 0;

      row.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
          touchMoved = false;
        }
      }, { passive: true });

      row.addEventListener("touchmove", (e) => {
        if (e.touches && e.touches[0]) {
          const dx = Math.abs(e.touches[0].clientX - touchStartX);
          const dy = Math.abs(e.touches[0].clientY - touchStartY);
          if (dx > 8 || dy > 8) {
            touchMoved = true;
            userTapLockUntil = 0;
          }
        }
      }, { passive: true });

      row.addEventListener("touchend", () => {
        if (!touchMoved && (Date.now() - touchStartTime < 350)) {
          lastTouchTapTime = Date.now();
          toggleProductRow(container, row, { shouldScroll: false, isUserClick: true });
        }
      }, { passive: true });

      row.addEventListener("click", () => {
        if (Date.now() - lastTouchTapTime < 450) return;
        toggleProductRow(container, row, { shouldScroll: false, isUserClick: true });
      });
    });
  };
  let updateCenterRowGlobal = null;

  const initScrollDrivenCatalog = (container) => {
    if (!container) return;
    const rows = container.querySelectorAll(".product-row");
    if (!rows.length) return;

    let lastScrollPos = window.scrollY || 0;
    let scrollDirection = "down";

    const updateCenterRow = () => {
      if (!checkIsMobileOrPortraitTablet()) return;
      if (Date.now() < userTapLockUntil) return;

      const isOverlay = container.classList.contains("overlay-mode");
      const scrollY = isOverlay
        ? container.scrollTop
        : (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0);

      // Полный сброс только если мы в самом верху сайта на Hero
      const heroEl = document.getElementById("hero") || document.querySelector(".hero");
      const heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;
      if (!isOverlay && scrollY < (heroHeight * 0.15)) {
        if (activeProductRow) deactivateAllProductRows(container);
        return;
      }

      if (Math.abs(scrollY - lastScrollPos) >= 1) {
        scrollDirection = scrollY >= lastScrollPos ? "down" : "up";
        lastScrollPos = scrollY;
      }

      const vHeight = isOverlay ? container.clientHeight : window.innerHeight;
      let targetRow = null;

      if (scrollDirection === "down") {
        const triggerPoint = vHeight * 0.42;
        // При скролле вниз берем самую нижнюю строку, дошедшую до триггера
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rRect = row.getBoundingClientRect();
          const effectiveBottom = rRect.bottom + 260;
          if (rRect.top <= triggerPoint && effectiveBottom >= 80) {
            targetRow = row;
          }
        }
      } else {
        // При скролле снизу вверх:
        // Активируем верхнюю строку, когда она возвращается в верхнюю зону
        const triggerPoint = vHeight * 0.30;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rRect = row.getBoundingClientRect();
          const effectiveBottom = rRect.bottom + 260;
          if (rRect.top <= triggerPoint && effectiveBottom >= 80) {
            targetRow = row;
          }
        }

        // КЛЮЧЕВОЙ МОМЕНТ: если верхняя строка еще не достигла триггера,
        // удерживаем текущую активную плашку, чтобы она НЕ гасла на середине экрана!
        if (!targetRow && activeProductRow) {
          const curRect = activeProductRow.getBoundingClientRect();
          const curEffectiveBottom = curRect.bottom + 260;
          if (curRect.top < vHeight && curEffectiveBottom > 40) {
            targetRow = activeProductRow;
          }
        }
      }

      // Если вообще ни одна строка не определилась, но мы внутри каталога
      if (!targetRow && rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          const rRect = rows[i].getBoundingClientRect();
          if (rRect.top <= (vHeight * 0.5) && (rRect.bottom + 260) > 80) {
            targetRow = rows[i];
            break;
          }
        }
      }

      if (targetRow && targetRow !== activeProductRow) {
        activateProductRow(container, targetRow, { shouldScroll: false, isUserClick: false });
      } else if (!targetRow && activeProductRow) {
        let anyVisible = false;
        for (let i = 0; i < rows.length; i++) {
          const rRect = rows[i].getBoundingClientRect();
          if (rRect.top < vHeight && (rRect.bottom + 260) > 0) {
            anyVisible = true;
            break;
          }
        }
        if (!anyVisible) {
          deactivateAllProductRows(container);
        }
      }
    };

    updateCenterRowGlobal = updateCenterRow;

    let isCheckingScroll = false;
    const handleScroll = () => {
      if (isCheckingScroll) return;
      isCheckingScroll = true;
      requestAnimationFrame(() => {
        updateCenterRow();
        isCheckingScroll = false;
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });

    window.addEventListener("resize", handleScroll, { passive: true });
    window.addEventListener("orientationchange", () => {
      handleScroll();
      setTimeout(handleScroll, 120);
      setTimeout(handleScroll, 320);
    }, { passive: true });

    updateCenterRow();
  };

  if (productsSection) {
    initProductRowsHover(productsSection);
    initScrollDrivenCatalog(productsSection);
  }

  const updateActiveNav = () => {
    const navItems = document.querySelectorAll(".side-nav a");
    if (!navItems.length) return;

    let currentSection = "HOME";

    if (activeOverlay) {
      const overlayId = activeOverlay.id || "";
      if (activeOverlay === aboutPanel || overlayId === "aboutPanel") currentSection = "ABOUT";
      else if (activeOverlay === contactPanel || overlayId === "contactPanel") currentSection = "CONTACT";
      else if (activeOverlay === productsSection || overlayId === "products") currentSection = "PRODUCTS";
    } else {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const heroEl = document.getElementById("hero");
      const productsEl = document.getElementById("products") || document.querySelector(".products-section");
      const heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;

      if (productsEl) {
        const pRect = productsEl.getBoundingClientRect();
        if (pRect.top <= (window.innerHeight * 0.55) || scrollY >= (heroHeight * 0.35)) {
          currentSection = "PRODUCTS";
        }
      }
    }

    navItems.forEach((link) => {
      const href = (link.getAttribute("href") || "").toLowerCase();
      const text = link.textContent.trim().toUpperCase();
      let isActive = false;

      if (currentSection === "HOME") isActive = (text === "HOME" || href === "#hero");
      else if (currentSection === "PRODUCTS") isActive = (text === "PRODUCTS" || text === "CATALOG" || text === "MENU" || href === "#products");
      else if (currentSection === "ABOUT") isActive = (text === "ABOUT" || href === "#aboutpanel");
      else if (currentSection === "CONTACT") isActive = (text === "CONTACT" || href === "#contactpanel");

      if (isActive) link.classList.add("active");
      else link.classList.remove("active");
    });
  };

  const forceCloseActiveOverlay = () => {
    if (closeTimeout) { clearTimeout(closeTimeout); closeTimeout = null; }
    document.body.classList.remove("overlay-open");
    document.documentElement.classList.remove("overlay-open");
    if (activeOverlay) {
      activeOverlay.classList.remove("open", "overlay-mode", "is-animating");
      activeOverlay.style.pointerEvents = "";
      activeOverlay.scrollTop = 0;
      deactivateAllProductRows(activeOverlay);
      activeOverlay = null;
    }
    if (menuPlaceholder) { menuPlaceholder.remove(); menuPlaceholder = null; }
    if (closeMenuBtn) closeMenuBtn.classList.remove("show");

    const activeSlide = document.querySelector(".slide.active");
    if (activeSlide) {
      const v = activeSlide.querySelector(".bg-video"), t = activeSlide.querySelector(".title"), d = activeSlide.querySelector(".description"), b = activeSlide.querySelector(".btn");
      if (t) t.classList.remove("fade-out-left");
      if (d) d.classList.remove("fade-out-left");
      if (b) b.classList.remove("fade-out-left");
      if (v) {
        v.style.opacity = "1";
        v.style.visibility = "visible";
        v.classList.remove("fade-out-left");
        if (v.paused) v.play().catch(() => { });
      }
    }
    updateActiveNav();
  };

  const openOverlayPanel = (panelElement, targetId = null) => {
    if (activeOverlay === panelElement) return;
    forceCloseActiveOverlay();
    activeOverlay = panelElement;
    if (!activeOverlay) return;

    document.querySelectorAll(".hero .bg-video").forEach((v) => v.pause());

    if (activeOverlay === productsSection && !menuPlaceholder) {
      menuPlaceholder = document.createElement("div");
      menuPlaceholder.className = "products-section-placeholder";
      menuPlaceholder.style.height = `${productsSection.offsetHeight}px`;
      menuPlaceholder.style.width = "100%";
      menuPlaceholder.style.pointerEvents = "none";
      productsSection.parentNode.insertBefore(menuPlaceholder, productsSection);
    }

    activeOverlay.classList.add("overlay-mode", "is-animating");
    activeOverlay.style.pointerEvents = "auto";
    deactivateAllProductRows(activeOverlay);

    if (targetId) {
      const targetRow = activeOverlay.querySelector(targetId);
      if (targetRow) {
        activateProductRow(activeOverlay, targetRow);
        targetRow.classList.add("highlighted");
        setTimeout(() => { targetRow.classList.remove("highlighted"); }, 2000);

        const isLandscape = checkIsLandscape();
        const targetScroll = calculateCenterScroll(activeOverlay, targetRow, isLandscape);
        activeOverlay.scrollTop = targetScroll;

        requestAnimationFrame(() => {
          activeOverlay.scrollTop = targetScroll;
          if (botanicalEngine) {
            botanicalEngine.initSize();
            const center = getJarCenter(targetRow, activeOverlay);
            botanicalEngine.spawnAt(center.x, center.y);
          }
        });
      }
    }

    void activeOverlay.offsetWidth;
    requestAnimationFrame(() => {
      if (activeOverlay) {
        activeOverlay.classList.add("open");
        document.body.classList.add("overlay-open");
        document.documentElement.classList.add("overlay-open");

        if (targetId) {
          const targetRow = activeOverlay.querySelector(targetId);
          if (targetRow) {
            const isLandscape = checkIsLandscape();
            const targetScroll = calculateCenterScroll(activeOverlay, targetRow, isLandscape);
            activeOverlay.scrollTop = targetScroll;
          }
        }
        updateActiveNav();
      }
    });

    if (closeMenuBtn) closeMenuBtn.classList.add("show");
    updateActiveNav();
  };

  const closeOverlayPanel = () => {
    if (!activeOverlay) return;
    document.body.classList.remove("overlay-open");
    document.documentElement.classList.remove("overlay-open");
    const currentPanel = activeOverlay;
    currentPanel.classList.remove("open");
    currentPanel.style.pointerEvents = "none";
    if (closeMenuBtn) closeMenuBtn.classList.remove("show");

    const activeSlide = document.querySelector(".slide.active");
    if (activeSlide) {
      const v = activeSlide.querySelector(".bg-video");
      if (v && v.paused) v.play().catch(() => { });
    }

    deactivateAllProductRows(currentPanel);
    const animDuration = window.innerWidth <= 768 ? 460 : 800;
    updateActiveNav();

    closeTimeout = setTimeout(() => {
      currentPanel.classList.remove("overlay-mode", "is-animating");
      currentPanel.style.pointerEvents = "";
      currentPanel.scrollTop = 0;
      if (menuPlaceholder) { menuPlaceholder.remove(); menuPlaceholder = null; }
      if (activeOverlay === currentPanel) activeOverlay = null;
      updateActiveNav();
    }, animDuration);
  };

  productButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      preloadCatalogVideos();
      e.preventDefault();
      const targetId = btn.getAttribute("href");
      openOverlayPanel(productsSection, targetId);
    });
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href"), text = link.textContent.trim().toUpperCase();
      let targetPanel = null;

      const burger = document.getElementById("burgerBtn") || document.querySelector(".burger-btn");
      const sideNavEl = document.querySelector(".side-nav");
      if (burger && sideNavEl) {
        burger.classList.remove("active");
        sideNavEl.classList.remove("menu-open");
        document.body.classList.remove("nav-menu-open");
        document.documentElement.classList.remove("nav-menu-open");
      }

      if (href === "#aboutPanel" || text === "ABOUT") targetPanel = aboutPanel;
      else if (href === "#contactPanel" || text === "CONTACT") targetPanel = contactPanel;

      if (targetPanel) {
        if (activeOverlay === targetPanel) closeOverlayPanel();
        else openOverlayPanel(targetPanel);
      } else if (text === "HOME" || href === "#hero") {
        if (activeOverlay) closeOverlayPanel();
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (currentSlideIndex !== 0) runSlideSequence(0);
        link.blur();
        setTimeout(updateActiveNav, 300);
      } else if (text === "PRODUCTS" || text === "CATALOG" || text === "MENU" || href === "#products") {
        if (activeOverlay) closeOverlayPanel();
        const productsEl = document.getElementById("products");
        if (productsEl) productsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        link.blur();
        setTimeout(updateActiveNav, 300);
      }
    });
  });

  if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); closeOverlayPanel(); });
  }

  document.addEventListener("click", (e) => {
    if (!activeOverlay) return;
    if (e.target.closest(".side-nav, .product-link, .close-menu-btn, .burger-btn, .logo")) return;
    if (activeOverlay.classList.contains("side-panel-half") && !e.target.closest(".side-panel-half")) closeOverlayPanel();
  });

  const logoBtn = document.querySelector(".logo");
  if (logoBtn) {
    const handleLogoClick = (e) => {
      e.preventDefault();
      const burger = document.getElementById("burgerBtn") || document.querySelector(".burger-btn");
      const sideNavEl = document.querySelector(".side-nav");
      if (burger && sideNavEl) {
        burger.classList.remove("active");
        sideNavEl.classList.remove("menu-open");
        document.body.classList.remove("nav-menu-open");
        document.documentElement.classList.remove("nav-menu-open");
      }
      if (activeOverlay) closeOverlayPanel();

      const scrollY = window.scrollY || window.pageYOffset || 0;
      if (scrollY <= 15 && currentSlideIndex === 0 && !activeOverlay) {
        window.location.href = window.location.pathname;
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (typeof runSlideSequence === "function") runSlideSequence(0);
        logoBtn.blur();
        setTimeout(updateActiveNav, 300);
      }
    };
    logoBtn.addEventListener("click", handleLogoClick);
    logoBtn.addEventListener("touchend", (e) => { e.preventDefault(); handleLogoClick(e); });
  }

  // Мгновенная адаптация и фиксация рисунка при смене ориентации (без перелетов и дерганий)
  let resizeDebounceTimer = null;
  const handleOrientationOrResize = () => {
    document.body.classList.add("no-transitions");
    if (botanicalEngine) {
      botanicalEngine.initSize();
      if (activeProductRow && productsSection) {
        const center = getJarCenter(activeProductRow, productsSection);
        botanicalEngine.recenter(center.x, center.y);
      }
    }
    if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
      if (botanicalEngine && activeProductRow && productsSection) {
        const center = getJarCenter(activeProductRow, productsSection);
        botanicalEngine.recenter(center.x, center.y);
      }
      document.body.classList.remove("no-transitions");
    }, 180);
  };

  window.addEventListener("orientationchange", () => {
    handleOrientationOrResize();
    setTimeout(handleOrientationOrResize, 80);
    setTimeout(handleOrientationOrResize, 250);
  });

  let lastAppResizeW = window.innerWidth;
  let lastAppResizeH = window.innerHeight;
  window.addEventListener("resize", () => {
    const curW = window.innerWidth;
    const curH = window.innerHeight;
    if (Math.abs(curW - lastAppResizeW) > 25 || Math.abs(curH - lastAppResizeH) > 160) {
      lastAppResizeW = curW;
      lastAppResizeH = curH;
      if (checkIsMobileOrPortraitTablet()) {
        handleOrientationOrResize();
      }
    }
  }, { passive: true });

  const burgerBtn = document.getElementById("burgerBtn") || document.querySelector(".burger-btn");
  const sideNav = document.querySelector(".side-nav");
  const allNavLinks = document.querySelectorAll(".side-nav a");

  if (burgerBtn && sideNav) {
    const toggleBurger = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      const isActive = burgerBtn.classList.toggle("active");
      sideNav.classList.toggle("menu-open", isActive);
      document.body.classList.toggle("nav-menu-open", isActive);
      document.documentElement.classList.toggle("nav-menu-open", isActive);
    };

    burgerBtn.addEventListener("click", toggleBurger);
    allNavLinks.forEach((link) => {
      link.addEventListener("click", () => {
        burgerBtn.classList.remove("active");
        sideNav.classList.remove("menu-open");
        document.body.classList.remove("nav-menu-open");
        document.documentElement.classList.remove("nav-menu-open");
      });
    });
  }

  const updateScrollState = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    // Останавливаем видео Hero ТОЛЬКО когда он практически полностью ушел за экран (85% высоты)
    const isPastHero = scrollY > (window.innerHeight * 0.85);
    document.body.classList.toggle("scrolled-past-hero", isPastHero);

    const heroVideos = document.querySelectorAll(".hero .bg-video");
    if (isPastHero) {
      heroVideos.forEach(v => { if (!v.paused) v.pause(); });
    } else {
      const activeSlide = document.querySelector(".slide.active .bg-video");
      // Возобновляем воспроизведение, пока Hero находится в поле зрения
      if (activeSlide && activeSlide.paused && !document.body.classList.contains("overlay-open")) {
        activeSlide.play().catch(() => { });
      }
    }

    if (checkIsMobileOrPortraitTablet()) {
      const heroEl = document.getElementById("hero") || document.querySelector(".hero");
      const heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;

      // Сбрасываем каталог только в самом верху экрана
      if (scrollY < (heroHeight * 0.08) && !document.body.classList.contains("overlay-open") && productsSection) {
        deactivateAllProductRows(productsSection);
      }
    }
    updateActiveNav();
  };

  window.addEventListener("scroll", updateScrollState, { passive: true });
  updateScrollState();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}