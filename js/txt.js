window.MatrixRenderer = {
  canvases: [],
  tick: 0,
  cols: window.cols || 16,
  rows: window.rows || 22,
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

    const groupSize = 8;
    const groups = [];
    for (let i = 0; i < this.ledTexts.length; i += groupSize) {
      groups.push(this.ledTexts.slice(i, i + groupSize));
    }

    const totalGroups = groups.length;
    groups.forEach((chars, i) => {
      const canvas = document.createElement("canvas");
      canvas.id = `matrixCanvas${i}`;
      container.appendChild(canvas);
      this.canvases.push({ canvas, chars });
      this.setupCanvas(canvas, chars.length, totalGroups);
    });

    this.initialized = true;
    this.render();
  },

  setupCanvas(canvas, charCount, totalGroups) {
    const cols = this.cols * charCount;
    const rows = this.rows;

    const maxWidth = window.innerWidth * 0.95;
    const maxHeight = window.innerHeight / totalGroups;
    const cellSize = Math.min(maxWidth / cols, maxHeight / rows);

    canvas.width = cellSize * cols;
    canvas.height = cellSize * rows;
    canvas.cellSize = cellSize;

    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
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
    this.tick += 0.05;
    const flickerAmount = window.flickerSpeed || 0;

    this.canvases.forEach((obj, groupIndex) => {
      const canvas = obj.canvas;
      const ctx = canvas.getContext("2d");
      const chars = obj.chars;
      const cols = this.cols;
      const rows = this.rows;
      const cellSize = canvas.cellSize;
      const gapSize = cellSize * 0.1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      chars.forEach((char, charIndex) => {
        const textCanvas = document.createElement("canvas");
        textCanvas.width = cellSize * cols;
        textCanvas.height = cellSize * rows;
        const textCtx = textCanvas.getContext("2d");
        textCtx.font = `bold ${textCanvas.height * 0.65}px 'Microsoft YaHei','SegoeEmojiOld','Noto Sans SC',  'SimHei', sans-serif`;
        textCtx.textAlign = "center";
        textCtx.textBaseline = "middle";
        textCtx.fillStyle = "white";
        textCtx.fillText(char, textCanvas.width / 2, textCanvas.height / 2);

        const textImageData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height);

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = charIndex * cols * cellSize + col * cellSize + cellSize / 2;
            const y = row * cellSize + cellSize / 2;
            const px = Math.floor(col * cellSize + cellSize / 2);
            const py = Math.floor(row * cellSize + cellSize / 2);
            const pixelIndex = (py * textCanvas.width + px) * 4 + 3;
            const glow = textImageData.data[pixelIndex] > 0;
            const flicker = glow
              ? 0.73 + Math.sin(this.tick + row + col + charIndex) * flickerAmount
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
    const totalGroups = window.MatrixRenderer.canvases.length;
    window.MatrixRenderer.canvases.forEach((obj) => {
      window.MatrixRenderer.setupCanvas(obj.canvas, obj.chars.length, totalGroups);
    });
  }
});
