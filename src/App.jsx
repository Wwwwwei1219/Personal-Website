import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

const GRID_GAP = 28;
const INFLUENCE_RADIUS = 150;
const beijingTimeFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const WORK_EXPERIENCE = [
  {
    company: "玺承控股集团有限公司",
    role: "UI设计师",
    period: "Apr 2022 – Present",
    color: "#ef4444",
    line: "/assets/work-line-current.svg",
  },
  {
    company: "南京点橙互联网科技有限公司",
    role: "UI设计师",
    period: "Aug 2018 – Dec 2021",
    color: "#fa7315",
    line: "/assets/work-line-middle.svg",
  },
  {
    company: "南京润泽流体控制设备有限公司",
    role: "电商设计师",
    period: "Oct 2017 – Apr 2018",
    color: "#24d3ef",
    line: "/assets/work-line-early.svg",
  },
];

function seededNoise(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function App() {
  const canvasRef = useRef(null);
  const canvasRenderRef = useRef(null);
  const canvasPauseRef = useRef(null);
  const avatarRef = useRef(null);
  const themeTransitionRef = useRef(false);
  const pullStartYRef = useRef(null);
  const pullDistanceRef = useRef(0);
  const suppressClickRef = useRef(false);
  const [now, setNow] = useState(() => new Date());
  const [theme, setTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );
  const themeRef = useRef(theme);
  const [pullCount, setPullCount] = useState(0);
  const [pullOffset, setPullOffset] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const isLightTheme = theme === "light";

  const toggleTheme = () => {
    if (themeTransitionRef.current) return;

    const nextTheme = theme === "light" ? "dark" : "light";
    const applyTheme = () => {
      themeRef.current = nextTheme;
      flushSync(() => setTheme(nextTheme));
      document.documentElement.dataset.theme = nextTheme;
      canvasRenderRef.current?.();
    };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const avatarBounds = avatarRef.current?.getBoundingClientRect();
    const centerX = avatarBounds ? avatarBounds.left + avatarBounds.width / 2 : window.innerWidth / 2;
    const centerY = avatarBounds ? avatarBounds.top + avatarBounds.height / 2 : window.innerHeight / 2;
    const radius = Math.hypot(
      Math.max(centerX, window.innerWidth - centerX),
      Math.max(centerY, window.innerHeight - centerY),
    );
    const transitionScale = window.devicePixelRatio || 1;
    const clipCenterX = centerX * transitionScale;
    const clipCenterY = centerY * transitionScale;
    const clipRadius = radius * transitionScale;

    if (reducedMotion) {
      applyTheme();
      return;
    }

    themeTransitionRef.current = true;
    document.documentElement.classList.add("theme-transitioning");
    canvasPauseRef.current?.(true);

    if (!document.startViewTransition) {
      applyTheme();
      document.documentElement.classList.remove("theme-transitioning");
      themeTransitionRef.current = false;
      canvasPauseRef.current?.(false);
      return;
    }

    const transition = document.startViewTransition(applyTheme);

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${clipCenterX}px ${clipCenterY}px)`,
              `circle(${clipRadius}px at ${clipCenterX}px ${clipCenterY}px)`,
            ],
          },
          {
            duration: 680,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            fill: "both",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {})
      .finally(() => {
        transition.finished.finally(() => {
          document.documentElement.classList.remove("theme-transitioning");
          themeTransitionRef.current = false;
          canvasPauseRef.current?.(false);
        });
      });
  };

  const startPull = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pullStartYRef.current = event.clientY;
    pullDistanceRef.current = 0;
    suppressClickRef.current = false;
    setIsPulling(true);
  };

  const movePull = (event) => {
    if (pullStartYRef.current === null) return;
    const distance = Math.min(28, Math.max(0, event.clientY - pullStartYRef.current));
    pullDistanceRef.current = distance;
    setPullOffset(distance);
  };

  const finishPull = (event) => {
    if (pullStartYRef.current === null) return;
    const didPull = pullDistanceRef.current >= 12;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pullStartYRef.current = null;
    pullDistanceRef.current = 0;
    setIsPulling(false);
    setPullOffset(0);

    if (didPull) {
      suppressClickRef.current = true;
      toggleTheme();
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const cancelPull = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pullStartYRef.current = null;
    pullDistanceRef.current = 0;
    setIsPulling(false);
    setPullOffset(0);
  };

  const activatePull = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setPullCount((count) => count + 1);
    toggleTheme();
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useLayoutEffect(() => {
    themeRef.current = theme;
    document.documentElement.dataset.theme = theme;
    canvasRenderRef.current?.();
  }, [theme]);

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => setTheme(systemTheme.matches ? "dark" : "light");
    syncTheme();
    systemTheme.addEventListener("change", syncTheme);
    return () => systemTheme.removeEventListener("change", syncTheme);
  }, []);

  useEffect(() => {
    document.querySelectorAll("img").forEach((image) => {
      image.decode?.().catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timeoutId = window.setTimeout(() => {
      if (themeTransitionRef.current) return;
      canvasPauseRef.current?.(true);
      document.startViewTransition(() => {}).finished.finally(() => {
        canvasPauseRef.current?.(false);
      });
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId;
    let points = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let presence = 0;
    let isPaused = false;

    const pointer = {
      active: false,
      x: -1000,
      y: -1000,
      easedX: -1000,
      easedY: -1000,
      lastX: -1000,
      lastY: -1000,
      velocityX: 0,
      velocityY: 0,
    };

    const createPoints = () => {
      const nextPoints = [];
      const columns = Math.ceil(width / GRID_GAP) + 2;
      const rows = Math.ceil(height / GRID_GAP) + 2;

      for (let row = -1; row < rows; row += 1) {
        for (let column = -1; column < columns; column += 1) {
          const seed = row * 127 + column * 311 + 941;
          nextPoints.push({
            x: column * GRID_GAP + seededNoise(seed) * 2.4 - 1.2,
            y: row * GRID_GAP + seededNoise(seed + 17) * 2.4 - 1.2,
            offsetX: 0,
            offsetY: 0,
            phase: seededNoise(seed + 43) * Math.PI * 2,
            size: 0.62 + seededNoise(seed + 71) * 0.42,
            alpha: 0.1 + seededNoise(seed + 101) * 0.15,
          });
        }
      }

      points = nextPoints;
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createPoints();
    };

    const updatePointer = (event) => {
      pointer.active = true;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (pointer.easedX < -500) {
        pointer.easedX = pointer.x;
        pointer.easedY = pointer.y;
        pointer.lastX = pointer.x;
        pointer.lastY = pointer.y;
      }
    };

    const deactivatePointer = () => {
      pointer.active = false;
    };

    const render = (time = 0) => {
      context.clearRect(0, 0, width, height);

      pointer.easedX += (pointer.x - pointer.easedX) * 0.16;
      pointer.easedY += (pointer.y - pointer.easedY) * 0.16;
      pointer.velocityX = pointer.easedX - pointer.lastX;
      pointer.velocityY = pointer.easedY - pointer.lastY;
      pointer.lastX = pointer.easedX;
      pointer.lastY = pointer.easedY;
      presence += ((pointer.active ? 1 : 0) - presence) * 0.075;

      const idleMotion = reducedMotion.matches ? 0 : time * 0.00036;
      const dotColor = themeRef.current === "light" ? "88, 96, 108" : "174, 184, 197";

      for (const point of points) {
        const deltaX = point.x - pointer.easedX;
        const deltaY = point.y - pointer.easedY;
        const distance = Math.hypot(deltaX, deltaY) || 1;
        const falloff = Math.max(0, 1 - distance / INFLUENCE_RADIUS);
        const influence = falloff * falloff * presence;
        const push = influence * 31;
        const targetX = (deltaX / distance) * push + pointer.velocityX * influence * 0.72;
        const targetY = (deltaY / distance) * push + pointer.velocityY * influence * 0.72;

        point.offsetX += (targetX - point.offsetX) * 0.105;
        point.offsetY += (targetY - point.offsetY) * 0.105;

        const driftX = Math.cos(idleMotion + point.phase) * 0.42;
        const driftY = Math.sin(idleMotion * 0.82 + point.phase) * 0.42;
        const dotX = point.x + point.offsetX + driftX;
        const dotY = point.y + point.offsetY + driftY;
        const radius = point.size + influence * 0.62;
        const alpha = point.alpha + influence * 0.22;

        context.beginPath();
        context.arc(dotX, dotY, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${dotColor}, ${alpha})`;
        context.fill();
      }
    };

    const draw = (time = 0) => {
      if (isPaused) return;
      render(time);
      frameId = window.requestAnimationFrame(draw);
    };

    const setPaused = (nextPaused) => {
      if (isPaused === nextPaused) return;
      isPaused = nextPaused;
      if (isPaused) {
        window.cancelAnimationFrame(frameId);
      } else {
        frameId = window.requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerdown", updatePointer, { passive: true });
    document.addEventListener("pointerleave", deactivatePointer);
    window.addEventListener("blur", deactivatePointer);
    canvasRenderRef.current = () => render(window.performance.now());
    canvasPauseRef.current = setPaused;
    draw();

    return () => {
      canvasRenderRef.current = null;
      canvasPauseRef.current = null;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", updatePointer);
      document.removeEventListener("pointerleave", deactivatePointer);
      window.removeEventListener("blur", deactivatePointer);
    };
  }, []);

  return (
    <main className="dot-field" data-theme={theme}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <section className="profile-content" aria-labelledby="profile-name">
        <header className="profile-meta">
          <time dateTime={now.toISOString()} title="北京时间（UTC+8）">
            {beijingTimeFormatter.format(now)}
          </time>
          <div className="profile-meta__right" aria-label="顶部右侧占位">
            <span>[Placeholder1]</span>
            <span>[Placeholder2]</span>
            <span>[Placeholder2]</span>
          </div>
        </header>

        <button
          className={`theme-pull${isPulling ? " theme-pull--pulling" : ""}`}
          type="button"
          aria-label="拉动台灯开关切换亮暗模式"
          aria-pressed={isLightTheme}
          title={`拉动开关切换到${isLightTheme ? "暗色" : "亮色"}模式`}
          style={{ "--pull-offset": `${pullOffset}px` }}
          onClick={activatePull}
          onPointerDown={startPull}
          onPointerMove={movePull}
          onPointerUp={finishPull}
          onPointerCancel={cancelPull}
        >
          <img
            key={pullCount}
            className={`theme-pull__image${pullCount ? " theme-pull__image--animated" : ""}`}
            src="/assets/theme-pull-cord-extended.png"
            alt=""
            aria-hidden="true"
            draggable="false"
            onDragStart={(event) => event.preventDefault()}
          />
        </button>

        <div ref={avatarRef} className="avatar-switch" tabIndex="0" aria-label="十一的头像">
          <span className="avatar-switch__portrait">
            <img className="avatar-switch__default" src="/assets/avatar-default.png" alt="十一" />
            <img className="avatar-switch__hover" src="/assets/avatar-hover.png" alt="" aria-hidden="true" />
          </span>
          <span className="avatar-switch__charm" aria-hidden="true">
            <img src="/assets/avatar-cat-charm.png" alt="" />
          </span>
        </div>

        <h1 id="profile-name">十一</h1>

        <div className="profile-body">
          <div className="profile-intro">
            <p>我是一名 UI/UX 设计师，目前主要专注于 B 端产品、企业数字化系统与移动端产品设计。</p>
            <p>工作中，我参与过 CRM、BI、OA、招聘、学习平台、数据看板、小程序等多个产品的设计，比较关注复杂业务场景下的信息架构、交互流程和界面体验，也在持续推进设计规范与组件体系的建设，希望通过更清晰、一致的设计方式，降低用户理解成本和团队协作成本。</p>
            <p>相比单纯追求视觉效果，我更关注设计背后的逻辑：为什么这样设计、用户真正需要什么、业务目标是什么，以及设计方案是否能够真正落地。</p>
            <div>
              <p>除了产品设计，我也长期关注 AI 与设计工具的发展，并尝试将 AI 应用到日常设计、内容创作和工作流程中。</p>
              <p>我希望自己不只是一个“把页面画出来”的设计师，而是能够理解业务、解决问题，并持续推动产品体验变得更好的设计者。</p>
            </div>
          </div>

          <section className="work-experience" aria-label="工作经历">
            <ol className="work-experience__list">
              {WORK_EXPERIENCE.map((item) => (
                <li className="work-experience__item" key={item.company} tabIndex="0">
                  <span className="work-experience__marker" style={{ backgroundColor: item.color }} />
                  <span className="work-experience__details">
                    <span className="work-experience__company">{item.company}</span>
                    <span className="work-experience__separator" />
                    <span className="work-experience__role">{item.role}</span>
                  </span>
                  <span className="work-experience__line" aria-hidden="true">
                    <img src={item.line} alt="" />
                  </span>
                  <time className="work-experience__period">{item.period}</time>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>
    </main>
  );
}
