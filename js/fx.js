"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const rainCanvas = document.getElementById("rain");
const rainCtx = rainCanvas.getContext("2d");

let isBreaking = false;
let lastBreakFx = 0;
let audioCtx = null;
let corePulse = 0;
const floatTexts = [];
const sparks = [];
const ripples = [];
const visualAngles = new Array(CIRCLES.length).fill(0);
const BREAKABLE_SELECTOR = "#topbar, #multRow, #statsMini, #terminal, #panel, #footer, #challengeBanner";

function randomBetween(min, max) { return min + Math.random() * (max - min); }

/* ---------- Son ---------- */

function beep(freq, dur, type, vol) {
    if (!state.settings.sound) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = type || "square";
        o.frequency.value = freq;
        g.gain.value = vol || 0.025;
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.06));
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start();
        o.stop(audioCtx.currentTime + (dur || 0.06));
    } catch (e) { /* audio indisponible */ }
}

/* ---------- Messages ---------- */

function toast(text, cls) {
    const el = document.createElement("div");
    el.className = "toast" + (cls ? " " + cls : "");
    el.textContent = text;
    el.addEventListener("animationend", () => el.remove());
    document.getElementById("toasts").appendChild(el);
}

function logLine(text, cls) {
    const log = document.getElementById("termLog");
    const el = document.createElement("div");
    el.className = cls || "dim";
    el.textContent = text;
    log.appendChild(el);
    while (log.children.length > 14) log.removeChild(log.firstChild);
}

function triggerShake() {
    const app = document.getElementById("app");
    app.classList.remove("shake");
    void app.offsetWidth;
    app.classList.add("shake");
}

/* ---------- Pluie de code ---------- */

let rainDrops = [];
const RAIN_CHARS = "アイウエオカキクケコサシスセソ01{}<>/\\$#%&*+=";

function resizeRain() {
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
    rainDrops = new Array(Math.ceil(rainCanvas.width / 16)).fill(0).map(() => Math.random() * -50);
}

function drawRain() {
    rainCtx.fillStyle = "rgba(3, 6, 10, 0.12)";
    rainCtx.fillRect(0, 0, rainCanvas.width, rainCanvas.height);
    rainCtx.fillStyle = "#00ff9c";
    rainCtx.font = "14px monospace";
    for (let i = 0; i < rainDrops.length; i++) {
        const ch = RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];
        rainCtx.fillText(ch, i * 16, rainDrops[i] * 16);
        if (rainDrops[i] * 16 > rainCanvas.height && Math.random() > 0.975) rainDrops[i] = 0;
        rainDrops[i]++;
    }
}

/* ---------- Mode "le système plante" (>= 8 CPS) ---------- */

function randomPointOutsideCanvas() {
    const r = canvas.getBoundingClientRect();
    let x, y;
    for (let i = 0; i < 20; i++) {
        x = randomBetween(140, Math.max(141, window.innerWidth - 140));
        y = randomBetween(40, Math.max(41, window.innerHeight - 40));
        if (x < r.left - 40 || x > r.right + 40 || y < r.top - 40 || y > r.bottom + 40) break;
    }
    return { x, y };
}

function spawnBreakMessage(text, ok) {
    const layer = document.documentElement;
    if (layer.querySelectorAll(".break-msg").length >= 4) return;
    const p = randomPointOutsideCanvas();
    const el = document.createElement("div");
    el.className = "break-msg" + (ok ? " ok" : "");
    el.textContent = text || BREAK_MESSAGES[rnd(BREAK_MESSAGES.length)];
    el.style.left = p.x + "px";
    el.style.top = p.y + "px";
    el.style.setProperty("--mr", randomBetween(-8, 8).toFixed(1) + "deg");
    el.addEventListener("animationend", () => el.remove());
    layer.appendChild(el);
}

function spawnCrack() {
    const p = randomPointOutsideCanvas();
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "crack");
    svg.setAttribute("viewBox", "-130 -130 260 260");
    svg.style.left = p.x + "px";
    svg.style.top = p.y + "px";
    const arms = 5 + rnd(4);
    for (let k = 0; k < arms; k++) {
        let angle = (k / arms) * Math.PI * 2 + randomBetween(-0.3, 0.3);
        let x = 0, y = 0;
        let points = "0,0";
        const segments = 4 + rnd(4);
        for (let s = 0; s < segments; s++) {
            const len = randomBetween(10, 28);
            angle += randomBetween(-0.5, 0.5);
            x += Math.cos(angle) * len;
            y += Math.sin(angle) * len;
            points += ` ${x.toFixed(1)},${y.toFixed(1)}`;
        }
        const line = document.createElementNS(svgNS, "polyline");
        line.setAttribute("points", points);
        line.setAttribute("fill", "none");
        line.setAttribute("stroke", "#ffd0d8");
        line.setAttribute("stroke-width", randomBetween(1, 2.5).toFixed(1));
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
    }
    svg.addEventListener("animationend", () => svg.remove());
    document.getElementById("crackLayer").appendChild(svg);
}

function setBreaking(on) {
    if (on === isBreaking) return;
    isBreaking = on;
    const body = document.getElementById("gameBody");
    const overlay = document.getElementById("breakOverlay");
    if (on) {
        document.querySelectorAll(BREAKABLE_SELECTOR).forEach(el => {
            el.classList.add("breakable");
            el.style.setProperty("--bx", randomBetween(-35, 35).toFixed(0) + "px");
            el.style.setProperty("--by", randomBetween(-8, 28).toFixed(0) + "px");
            el.style.setProperty("--br", randomBetween(-9, 9).toFixed(1) + "deg");
            el.style.setProperty("--bs", randomBetween(-6, 6).toFixed(1) + "deg");
            el.style.setProperty("--bd", "-" + randomBetween(0, 0.4).toFixed(2) + "s");
        });
        body.classList.add("breaking");
        overlay.classList.add("active");
        lastBreakFx = 0;
        state.stats.broke++;
        logLine("!! ALERTE ICE : surcharge critique, le système plante !!", "bad");
        beep(120, 0.4, "sawtooth", 0.05);
    } else {
        body.classList.remove("breaking");
        overlay.classList.remove("active");
        spawnBreakMessage("✅ Ouf... tout est réparé. Ne recommence pas !", true);
        logLine("> système restauré. traces effacées.", "ok");
    }
    document.getElementById("chaosTag").classList.toggle("on", on);
}

function updateBreakMode(cps, now) {
    if (!state.settings.fx) {
        if (isBreaking) setBreaking(false);
        return;
    }
    if (!isBreaking && cps >= BREAK_START_CPS) setBreaking(true);
    else if (isBreaking && cps < BREAK_END_CPS) setBreaking(false);

    if (isBreaking && now - lastBreakFx > 700) {
        lastBreakFx = now;
        spawnBreakMessage();
        if (Math.random() < 0.7) spawnCrack();
    }
}

/* ---------- Rendu du canvas ---------- */

function tierColor(cps) {
    if (cps >= 9.5) return `hsl(${(Date.now() / 4) % 360}, 100%, 60%)`;
    if (cps >= 8) return "#ff2a55";
    if (cps >= 5) return "#fcee0a";
    if (cps >= 3) return "#4da3ff";
    return "#00ff9c";
}

function hexPath(x, y, r, rot) {
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
        const a = rot + k * Math.PI / 3;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}

function spawnClickFx(x, y, text, color, cps) {
    corePulse = 1;
    ripples.push({ x, y, r: 6, a: 1, color });
    floatTexts.push({ x, y, text, a: 1, color });
    if (!state.settings.fx) return;
    const n = cps >= 3 ? 10 : 4;
    for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = randomBetween(40, 170);
        sparks.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, a: 1, color });
    }
}

function render(dt) {
    const W = canvas.width;
    const cx = W / 2;
    const cy = W / 2;
    const t = performance.now() / 1000;
    const col = tierColor(currentCPS);
    ctx.clearRect(0, 0, W, W);

    // Graduations de radar
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.08);
    ctx.strokeStyle = "rgba(0, 255, 156, 0.16)";
    ctx.lineWidth = 1;
    for (let k = 0; k < 72; k++) {
        const a = k * Math.PI / 36;
        const len = k % 6 === 0 ? 14 : 6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (250 - len), Math.sin(a) * (250 - len));
        ctx.lineTo(Math.cos(a) * 250, Math.sin(a) * 250);
        ctx.stroke();
    }
    ctx.restore();

    if (state.od.timer > 0) {
        ctx.save();
        ctx.strokeStyle = "#fcee0a";
        ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 12);
        ctx.shadowColor = "#fcee0a";
        ctx.shadowBlur = 18;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 242, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // Anneaux = processus
    for (let i = 0; i < CIRCLES.length; i++) {
        const c = CIRCLES[i];
        const r = 58 + i * 19.5;
        const unlocked = isUnlocked(i);
        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = c.color;
        ctx.globalAlpha = unlocked ? 0.16 : 0.07;
        if (!unlocked) ctx.setLineDash([3, 7]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        if (!unlocked) continue;

        const laps = D.laps ? D.laps[i] : 0;
        if (laps > 0) {
            visualAngles[i] = (visualAngles[i] + Math.PI * 2 * Math.min(Math.max(laps, 0.08), 1.6) * dt) % (Math.PI * 2);
        }
        const ang = visualAngles[i];
        ctx.save();
        ctx.strokeStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + ang);
        ctx.stroke();
        const hx = cx + Math.cos(ang - Math.PI / 2) * r;
        const hy = cy + Math.sin(ang - Math.PI / 2) * r;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(hx, hy, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Noyau central (zone de clic)
    corePulse = Math.max(0, corePulse - dt * 4);
    const coreR = 30 * (1 + corePulse * 0.25);
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = 22 + corePulse * 20;
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, coreR);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(1, col);
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = grad;
    hexPath(cx, cy, coreR, t * 0.5);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.lineWidth = 1.5;
    hexPath(cx, cy, coreR * 0.55, -t * 0.9);
    ctx.stroke();
    ctx.restore();

    // Effets de clic
    for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 220 * dt;
        rp.a -= dt * 2.2;
        if (rp.a <= 0) { ripples.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = rp.a;
        ctx.strokeStyle = rp.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        sp.a -= dt * 2.4;
        if (sp.a <= 0) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = sp.a;
        ctx.fillStyle = sp.color;
        ctx.fillRect(sp.x, sp.y, 3, 3);
    }
    ctx.globalAlpha = 1;
    ctx.font = "bold 14px Consolas, monospace";
    ctx.textAlign = "center";
    for (let i = floatTexts.length - 1; i >= 0; i--) {
        const ft = floatTexts[i];
        ft.y -= (30 + currentCPS * 2) * dt;
        ft.a -= dt * 1.4;
        if (ft.a <= 0) { floatTexts.splice(i, 1); continue; }
        ctx.globalAlpha = ft.a;
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "start";
}
