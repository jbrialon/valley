import Stats from "stats-gl";
import Experience from "../Experience.js";

// 6512000 becomes "6.51M", easier to read at a glance
const formatCount = (value) => {
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
  return `${Math.round(value)}`;
};

const formatBytes = (value) => `${(value / 1024 ** 2).toFixed(1)} MB`;

export default class Performance {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.active = window.location.hash === "#debug";

    if (this.active) {
      this.stats = new Stats({
        trackGPU: true,
        trackHz: true,
        trackCPT: false,
        minimal: false,
        mode: 2,
        horizontal: false,
      });
      document.body.appendChild(this.stats.dom);

      this.visible = false;
      this.stats.dom.style.display = "none";
      this.setDebug();
    }
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder({
      title: "Stats",
      expanded: false,
    });
    this.debugFolder.addButton({ title: "Toggle Stats" }).on("click", () => {
      this.visible = !this.visible;
      this.stats.dom.style.display = this.visible ? "" : "none";
    });
  }

  init(renderer) {
    if (!this.active) return;

    this.renderer = renderer;
    this.stats.init(renderer);

    // Three resets the counts on its own frame timing, so we reset them right before our render instead
    renderer.info.autoReset = false;
    this.setRendererInfo();
  }

  setRendererInfo() {
    const { render, memory } = this.renderer.info;
    const monitor = (object, key, label, format = formatCount) =>
      this.debugFolder.addBinding(object, key, {
        label,
        readonly: true,
        format,
      });

    monitor(render, "drawCalls", "Draw calls");
    monitor(render, "triangles", "Triangles");
    monitor(memory, "geometries", "Geometries");
    monitor(memory, "textures", "Textures");
    monitor(memory, "texturesSize", "Textures size", formatBytes);
    monitor(memory, "programs", "Shaders");
    monitor(memory, "total", "GPU memory", formatBytes);
  }

  begin() {
    if (!this.active) return;

    this.renderer.info.reset();
    this.stats.begin();
  }

  update() {
    if (this.active) this.stats.update();
  }

  end() {
    if (this.active) this.stats.end();
  }
}
