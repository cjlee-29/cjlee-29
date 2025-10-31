// PIXI app
const app = new PIXI.Application({
  resizeTo: window,
  backgroundAlpha: 1,
  antialias: true,
});
document.getElementById("lake").style.pointerEvents = "none";
document.getElementById("lake").appendChild(app.view);

// Background
const bgPath = "images/bg-pixel-water.png";
PIXI.Assets.add({ alias: "bg", src: bgPath });

(async function init() {
  const bgTex = await PIXI.Assets.load("bg");

  const bg = new PIXI.Sprite(bgTex);
  bg.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  app.stage.addChild(bg);

  function resizeBG() {
    const scale = Math.max(
      window.innerWidth / bgTex.width,
      window.innerHeight / bgTex.height
    );
    bg.scale.set(scale);
    bg.x = (app.renderer.width - bg.width) / 2;
    bg.y = (app.renderer.height - bg.height) / 2;
  }
  resizeBG();
  window.addEventListener("resize", resizeBG);

  // Ripple & glow filters
  const blurFilter = new PIXI.BlurFilter();
  blurFilter.blur = 5;
  const glowFilter = new PIXI.filters.ColorMatrixFilter();

  const rings = [];
  let lastX = 0;
  let lastY = 0;
  let lastTime = performance.now();

  function createRipple(x, y, intensity = 1) {
    const ring = new PIXI.Graphics();
    const color = 0x81d8d0;

    ring.lineStyle(2.2 * intensity, color, 0.75 * intensity);
    ring.drawCircle(0, 0, 1);
    ring.x = x;
    ring.y = y;

    const thisBlur = new PIXI.BlurFilter();
    thisBlur.blur = 4 + intensity * 2; // less glow
    const thisGlow = new PIXI.filters.ColorMatrixFilter();
    thisGlow.brightness(1 + intensity * 0.3); // softer glow

    ring.filters = [thisBlur, thisGlow];
    app.stage.addChild(ring);

    rings.push({
      gfx: ring,
      r: 0,
      life: 1,
      intensity,
    });
  }

  // Mouse movement ripple
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  app.stage.on("pointermove", (e) => {
    const { x, y } = e.global;
    const now = performance.now();

    // Speed calculation
    const dx = x - lastX;
    const dy = y - lastY;
    const dt = (now - lastTime) / 1000;
    const speed = Math.min(Math.sqrt(dx * dx + dy * dy) / (dt * 400), 2); // ↓ less sensitive

    // Trigger ripple only for noticeable movement
    if (speed > 0.4) createRipple(x, y, speed * 0.8); // ↓ smaller intensity

    lastX = x;
    lastY = y;
    lastTime = now;
  });

  // Animate rings
  app.ticker.add(() => {
    rings.forEach((ringObj) => {
      const ring = ringObj.gfx;
      ringObj.r += 3 + ringObj.intensity * 2; // ↓ smaller expansion
      ringObj.life *= 0.95; // slightly slower fade

      ring.clear();
      ring.lineStyle(
        2.2 * ringObj.intensity,
        0x81d8d0,
        ringObj.life * (0.8 + ringObj.intensity * 0.15)
      );
      ring.drawCircle(0, 0, ringObj.r);

      if (ringObj.life < 0.05) app.stage.removeChild(ring);
    });

    for (let i = rings.length - 1; i >= 0; i--) {
      if (rings[i].life < 0.05) rings.splice(i, 1);
    }
  });
})();
