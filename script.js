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
// ЖИВОЙ НЕОНОВЫЙ СВЕТЛЯЧОК (LIVING NEON FIREFLY)
// ==========================================
class NeonFireflyEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Позиция мыши / цели
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;

    // Физика светлячка (spring + chaotic organic wandering)
    this.x = this.mouseX;
    this.y = this.mouseY;
    this.vx = 0;
    this.vy = 0;

    // Шлейф (хвост)
    this.trail = [];
    this.maxTrail = 40;

    this.animFrameId = null;

    this.initSize();
    this.bindEvents();
  }

  initSize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

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
    window.addEventListener("resize", () => this.initSize(), { passive: true });

    window.addEventListener("mousemove", (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches[0]) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches[0]) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
      }
    }, { passive: true });
  }

  start() {
    if (this.animFrameId || !this.ctx) return;

    let time = 0;

    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      time += 0.032;

      // Хаотичное парение вокруг мышки (даже когда курсор неподвижен)
      const t1 = time * 0.95;
      const t2 = time * 1.8;
      const t3 = time * 2.7;
      const t4 = time * 0.45;

      // 3D-подобные нелинейные петли и виражи
      const flutterX = Math.sin(t1) * 36 + Math.cos(t2) * 20 + Math.sin(t4) * 26;
      const flutterY = Math.cos(t1 * 1.1) * 36 + Math.sin(t3) * 18 + Math.cos(t4) * 24;

      const targetX = this.mouseX + flutterX;
      const targetY = this.mouseY + flutterY;

      // Плавная физика преследования
      const dx = targetX - this.x;
      const dy = targetY - this.y;

      this.vx += dx * 0.045;
      this.vy += dy * 0.045;

      // Мягкое демпфирование
      this.vx *= 0.88;
      this.vy *= 0.88;

      this.x += this.vx;
      this.y += this.vy;

      // Запись шлейфа
      this.trail.unshift({ x: this.x, y: this.y });
      if (this.trail.length > this.maxTrail) {
        this.trail.pop();
      }

      // Очистка Canvas
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();

      // Отрисовка светящегося тёпло-яркого неонового хвоста
      if (this.trail.length > 2) {
        for (let i = 1; i < this.trail.length; i++) {
          const ratio = 1 - (i / this.trail.length);
          const p1 = this.trail[i - 1];
          const p2 = this.trail[i];

          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);

          // Внешнее неоновое сияние шлейфа (тёплый золотисто-зелёный неон)
          this.ctx.strokeStyle = `rgba(255, 235, 90, ${ratio * 0.85})`;
          this.ctx.lineWidth = Math.max(1, ratio * 4.5);
          this.ctx.shadowColor = "#8ef528";
          this.ctx.shadowBlur = Math.round(ratio * 16);
          this.ctx.lineCap = "round";
          this.ctx.stroke();
        }

        // Внутренняя яркая сердцевина шлейфа
        this.ctx.beginPath();
        this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < Math.min(this.trail.length, 18); i++) {
          this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        this.ctx.lineWidth = 1.8;
        this.ctx.shadowColor = "#ffe259";
        this.ctx.shadowBlur = 8;
        this.ctx.stroke();
      }

      // Головной яркий тёплый неоновый светлячок
      const headRadius = 4.2 + Math.sin(time * 3) * 0.8;

      // Внешнее тепло-неоновое свечение
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, headRadius + 4, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(142, 245, 40, 0.4)";
      this.ctx.shadowColor = "#8ef528";
      this.ctx.shadowBlur = 25;
      this.ctx.fill();

      // Тёплая золотисто-неоновая аура
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, headRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = "#ffe259";
      this.ctx.shadowColor = "#ffe259";
      this.ctx.shadowBlur = 15;
      this.ctx.fill();

      // Белое сияющее ядро
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, headRadius * 0.55, 0, Math.PI * 2);
      this.ctx.fillStyle = "#ffffff";
      this.ctx.shadowColor = "#ffffff";
      this.ctx.shadowBlur = 6;
      this.ctx.fill();
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
  const fireflyCanvas = document.getElementById("fireflyCanvas");
  const fireflyEngine = fireflyCanvas ? new NeonFireflyEngine(fireflyCanvas) : null;
  if (fireflyEngine) fireflyEngine.start();

  const productsSection = document.querySelector(".products-section");

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

    if (video._fadeStopTimer) {
      clearTimeout(video._fadeStopTimer);
      video._fadeStopTimer = null;
    }

    video.muted = true;
    video.playsInline = true;
    if (video.readyState === 0) {
      video.preload = "auto";
      video.load();
    }

    const targetFreezeTime = 6.4;
    video.playbackRate = 2.5;

    // Всегда начинаем воспроизведение с 0 кадра при новом открытии плашки
    try { video.currentTime = 0; } catch (e) { }

    const startPlay = () => {
      if (!row.classList.contains("auto-active") && !row.classList.contains("highlighted")) return;
      const playPromise = video.play();
      if (playPromise !== undefined) playPromise.catch(() => { });

      if (video._rafAnim) cancelAnimationFrame(video._rafAnim);
      const checkTime = () => {
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

  const stopRowPreviewVideo = (row, immediate = false) => {
    const video = row.querySelector(".preview-video");
    if (!video) return;

    if (video._fadeStopTimer) {
      clearTimeout(video._fadeStopTimer);
      video._fadeStopTimer = null;
    }

    // При уходе мыши видео плавно доигрывает текущий кадр во время CSS fade-out (450ms),
    // не дергаясь и не сбрасываясь на 0 кадр в момент исчезновения.
    // Сброс и пауза происходят ТОЛЬКО когда плашка уже полностью прозрачна (opacity: 0).
    video._fadeStopTimer = setTimeout(() => {
      if (!row.classList.contains("auto-active") && !row.classList.contains("highlighted")) {
        if (video._rafAnim) {
          cancelAnimationFrame(video._rafAnim);
          video._rafAnim = null;
        }
        video.pause();
        try { video.currentTime = 0; } catch (e) { }
      }
    }, 450);
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
              stopRowPreviewVideo(other, true);
            }
          });
          r.classList.add("auto-active");
          playRowPreviewVideo(r, 0);
        }
      } else {
        r.classList.remove("auto-active", "highlighted");
        stopRowPreviewVideo(r, true);
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
        if (activeProductRow === row) {
          activeProductRow = null;
        }
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

    container.addEventListener("mouseleave", () => {
      if (!checkIsMobileOrPortraitTablet()) {
        deactivateAllProductRows(container);
      }
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
    if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
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