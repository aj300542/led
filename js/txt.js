window.MatrixRenderer = {
  canvases: [],
  tick: 0,
  cols: window.cols,
  rows: window.rows,
  ledTexts: [],
  ledColor: window.ledColor || "#00FFFF",
  initialized: false,
  animationFrameId: null,

  init(container) {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.canvases = [];
    container.innerHTML = "";

    this.ledTexts.forEach((char, i) => {
      const canvas = document.createElement("canvas");
      canvas.id = `matrixCanvas${i}`;
      container.appendChild(canvas);
      this.canvases.push({ canvas, char });
    });

    this.canvases.forEach((obj, i) => {
      this.setupCanvas(obj, i);
    });

    this.initialized = true;
    this.render();
  },

  setupCanvas(obj, index) {
    const canvas = obj.canvas;
    const cols = this.cols;
    const rows = this.rows;
    const maxWidth = window.innerWidth / (this.ledTexts.length + 1);
    const maxHeight = window.innerHeight * 0.8;
    const cellSize = Math.min(maxWidth / cols, maxHeight / rows);

    canvas.width = cellSize * cols;
    canvas.height = cellSize * rows;
    obj.cellSize = cellSize;
  },

  updateTexts(texts) {
    this.ledTexts = texts;

    const container = document.getElementById("matrixContainer");
    container.innerHTML = "";
    this.initialized = false;
    this.init(container);
  },

  updateColor(color) {
    this.ledColor = color;
  },

  render() {
    this.tick += 0.15; // 始终递增，驱动动画

    const flickerAmount = window.flickerSpeed || 0;

    this.canvases.forEach((obj, index) => {
      const canvas = obj.canvas;
      const ctx = canvas.getContext("2d");
      const cols = this.cols;
      const rows = this.rows;
      const cellSize = obj.cellSize;
      const gapSize = window.innerHeight * 0.002;

      const textCanvas = document.createElement("canvas");
      textCanvas.width = canvas.width;
      textCanvas.height = canvas.height;
      const textCtx = textCanvas.getContext("2d");

      textCtx.clearRect(0, 0, canvas.width, canvas.height);
      textCtx.font = `bold ${canvas.height * 0.73}px 'Microsoft YaHei', 'Noto Sans SC', 'PingFang SC', 'SimHei', sans-serif`;
      textCtx.textAlign = "center";
      textCtx.textBaseline = "middle";
      textCtx.fillStyle = "white";
      textCtx.fillText(obj.char, canvas.width / 2, canvas.height / 2);

      const textImageData = textCtx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cellSize + cellSize / 2;
          const y = row * cellSize + cellSize / 2;
          const px = Math.floor(x);
          const py = Math.floor(y);
          const pixelIndex = (py * canvas.width + px) * 4 + 3;
          const glow = textImageData.data[pixelIndex] > 0;
          const flicker = glow
            ? 0.73 + Math.sin(this.tick + row + col + index) * flickerAmount
            : 0.2;
          const size = cellSize - gapSize;

          ctx.beginPath();
          ctx.rect(x - size / 2, y - size / 2, size, size);
          ctx.fillStyle = glow
            ? hexToRgba(this.ledColor, flicker.toFixed(2))
            : "rgba(50, 50, 50, 0.2)";
          ctx.fill();
        }
      }
    });

    this.animationFrameId = requestAnimationFrame(() => this.render());
  }
};

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

window.addEventListener("resize", () => {
  if (window.MatrixRenderer.initialized) {
    window.MatrixRenderer.canvases.forEach((obj, i) => {
      window.MatrixRenderer.setupCanvas(obj, i);
    });
  }
});
