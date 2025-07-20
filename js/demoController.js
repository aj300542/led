// 自动演示控制器 demoController.js

// ---------- 元素交互 ----------
document.querySelectorAll(".symbol-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const char = btn.textContent;
        const input = document.getElementById("textInput");

        input.value += char;
        clockMode = false;
        clearInterval(clockInterval);
        window.MatrixRenderer.updateTexts(input.value.split(""));
    });
});

// ---------- 全局变量 ----------
let sentenceList = [];
let loopInterval = null;
let typingTimer = null;
let countdownTimer = null;
let demoRunning = false;
let userInterrupted = false;
let demoTypingSpeed = 300;

// ---------- 倒计时逻辑 ----------
function updateCountdown(seconds) {
    const countdownElement = document.getElementById("countdownDisplay");
    if (!countdownElement) return;

    countdownElement.textContent =
        typeof seconds === "number"
            ? `下一句倒计时：${seconds} 秒`
            : `下一句倒计时：--`;
}

function startCountdown(delayInSeconds, callback) {
    let remaining = delayInSeconds;
    updateCountdown(remaining);

    countdownTimer = setInterval(() => {
        remaining--;
        updateCountdown(remaining);
        if (remaining <= 0) {
            clearInterval(countdownTimer);
            countdownTimer = null;
            updateCountdown("--");
            callback();
        }
    }, 1000);
}

// ---------- 文本加载 ----------
function fetchTxtFile(filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(text => {
            sentenceList = text.split(/\r?\n/).filter(line => line.trim());
            console.log("句子加载完成，共", sentenceList.length, "句");
        });
}

// ---------- 打字逻辑 ----------
function typeIntoInput(sentence, onComplete) {
    const input = document.getElementById("textInput");
    input.value = "";
    window.MatrixRenderer.updateTexts([]);

    const chars = sentence.split("");
    let index = 0;

    typingTimer = setInterval(() => {
        if (index < chars.length) {
            input.value += chars[index];
            window.MatrixRenderer.updateTexts(input.value.split(""));
            index++;
        } else {
            clearInterval(typingTimer);
            if (typeof onComplete === "function") onComplete();
        }
    }, demoTypingSpeed);
}

// ---------- 主循环控制 ----------
function typeAndLoopSentences() {
    if (!sentenceList.length || userInterrupted) {
        demoRunning = false;
        return;
    }

    const sentence = sentenceList[Math.floor(Math.random() * sentenceList.length)];
    typeIntoInput(sentence, () => {
        startCountdown(12, () => {
            if (!userInterrupted) {
                typeAndLoopSentences(); // 下一句
            } else {
                demoRunning = false;
            }
        });
    });
}

// ---------- 恢复时钟模式 ----------
function restoreClockMode() {
    clockMode = true;
    updateClockText();
    clockInterval = setInterval(() => {
        if (clockMode) updateClockText();
    }, 1000);
}

// ---------- 自动演示启动 ----------
document.getElementById("autoDemoBtn").addEventListener("click", () => {
    if (demoRunning) return;
    demoRunning = true;
    userInterrupted = false;
    document.getElementById("textInput").value = "";
    clockMode = false;
    clearInterval(clockInterval);
    typeAndLoopSentences();
});

// ---------- 用户中断按钮 ----------
window.addEventListener("load", () => {
    const interruptBtn = document.getElementById("interruptDemoBtn");
    if (interruptBtn) {
        interruptBtn.addEventListener("click", () => {
            clearInterval(loopInterval);
            clearInterval(typingTimer);
            clearInterval(countdownTimer);
            updateCountdown("--");

            demoRunning = false;
            userInterrupted = true;

            const currentText = document.getElementById("textInput").value;
            window.MatrixRenderer.updateTexts(currentText.split(""));
            restoreClockMode();

            console.log("✅ 演示已中断，已恢复时钟");
        });
    } else {
        console.warn("❌ 未找到 interruptDemoBtn 按钮");
    }
});
