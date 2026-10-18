"use strict";

let state = defaultState();
let D = {};
let currentCPS = 0;
let autoBuyTimer = 0;

function defaultCircles() {
    return CIRCLES.map((c, i) => ({ lvl: i === 0 ? 5 : 0, asc: 0, mult: 1, base: c.c0, cm: c.m0, auto: false }));
}

function defaultState() {
    return {
        v: 1,
        score: 0,
        runMax: 0,
        prestigeUnlocked: false,
        circles: defaultCircles(),
        pMult: 1,
        pExp: 1,
        promo: [0, 0, 0, 0],
        shards: 0,
        shardLog: 9,
        shop: SHOP.map(() => 0),
        ch: { active: null, done: [] },
        ach: {},
        stats: { clicks: 0, peakCps: 0, prestiges: 0, promotions: 0, ascensions: 0, broke: 0, playTime: 0 },
        od: { energy: 0, timer: 0 },
        settings: { sound: true, fx: true },
        lastSave: Date.now()
    };
}

/* ---------- Processus ---------- */

function chCostBonus() { return state.ch.active === 1 ? 0.15 : 0; }
function circleCap(c) { return 100 + 10 * c.asc; }
function cmEff(c) { return c.cm + chCostBonus(); }

function isUnlocked(i) {
    if (i === 0) return true;
    const c = state.circles[i];
    return c.lvl > 0 || c.asc > 0 || state.circles[i - 1].lvl >= 5;
}

function circleCost(i) {
    const c = state.circles[i];
    return c.base * Math.pow(cmEff(c), c.lvl);
}

function totalCost(i, n) {
    const c = state.circles[i];
    const m = cmEff(c);
    return circleCost(i) * (Math.pow(m, n) - 1) / (m - 1);
}

function maxBuy(i) {
    const c = state.circles[i];
    if (!isUnlocked(i)) return 0;
    const room = circleCap(c) - c.lvl;
    const first = circleCost(i);
    if (room <= 0 || !isFinite(first) || state.score < first) return 0;
    const m = cmEff(c);
    let n = Math.floor(Math.log(1 + state.score * (m - 1) / first) / Math.log(m));
    n = Math.max(0, Math.min(n, room));
    while (n > 0 && totalCost(i, n) > state.score) n--;
    return n;
}

function buyLevels(i, n) {
    if (n <= 0) return false;
    const cost = totalCost(i, n);
    if (state.score < cost) return false;
    state.score -= cost;
    state.circles[i].lvl += n;
    return true;
}

function buyAllMax() {
    let bought = 0;
    for (let i = 0; i < state.circles.length; i++) {
        const n = maxBuy(i);
        if (n > 0 && buyLevels(i, n)) bought += n;
    }
    return bought;
}

function canAscend(i) {
    const c = state.circles[i];
    return state.ch.active !== 2 && isUnlocked(i) && c.lvl >= circleCap(c);
}

function ascend(i) {
    if (!canAscend(i)) return false;
    const c = state.circles[i];
    c.base *= Math.pow(cmEff(c), circleCap(c));
    c.cm += 0.1;
    c.asc++;
    c.lvl = 5;
    state.stats.ascensions++;
    return true;
}

/* ---------- Production ---------- */

function computeDerived() {
    const s = state;
    const act = s.ch.active;
    const done = s.ch.done;
    const L = s.promo;

    const P4 = 1 + 0.05 * Math.pow(L[3], 0.48);
    const P1 = P4 * (Math.floor(Math.pow(L[0], 1.5)) + 1);
    const P2 = P4 * (1 + Math.sqrt(L[1]));
    const P3 = P4 * (10 + Math.pow(L[2], 0.82));

    const odOn = s.od.timer > 0;
    const heat = currentCPS >= 3 ? 1 + Math.min(currentCPS, 15) * 0.03 : 1;
    const speedMult = P2 * (1 + 0.1 * s.shop[0]) * (done.includes(3) ? 1.2 : 1) * heat * (odOn ? 3 : 1);
    const ascPow = P3 + (done.includes(2) ? 1 : 0);
    const gainMult = P1 * (1 + 0.15 * s.shop[1]);
    const achCount = Object.keys(s.ach).length;
    const incomeMult = (1 + 0.1 * s.shop[5]) * (1 + 0.02 * achCount) * (done.includes(1) ? 1.5 : 1);
    const pm = act ? 1 : s.pMult;
    const pe = act ? 1 : s.pExp;

    let prod = 1;
    let lapsTotal = 0;
    D.laps = [];
    D.gain = [];
    for (let i = 0; i < s.circles.length; i++) {
        const c = s.circles[i];
        prod = Math.min(MAX_NUM, prod * c.mult);
        const inert = act === 3 && (i + 1) % 2 === 0;
        const laps = inert ? 0 : c.lvl * CIRCLES[i].speed * speedMult;
        D.laps.push(laps);
        D.gain.push(Math.min(MAX_NUM, BASE_MULT_GAIN * Math.pow(ascPow, c.asc) * gainMult));
        lapsTotal += laps;
    }

    let perRev = Math.pow(prod * pm * incomeMult, pe);
    if (!isFinite(perRev)) perRev = MAX_NUM;
    D.P = [P1, P2, P3, P4];
    D.ascPow = ascPow;
    D.prod = prod;
    D.pm = pm;
    D.pe = pe;
    D.incomeMult = incomeMult;
    D.speedMult = speedMult;
    D.lapsTotal = lapsTotal;
    D.perRev = perRev;
    D.sps = Math.min(MAX_NUM, lapsTotal * perRev);
    D.clickValue = (1 + D.sps * 0.05) * (1 + 0.5 * s.shop[2]);
}

function advance(dt, offline) {
    const s = state;
    computeDerived();

    if (!offline) {
        if (s.od.timer > 0) {
            s.od.timer = Math.max(0, s.od.timer - dt);
        } else {
            s.od.energy = Math.min(100, s.od.energy + dt * 0.8);
            if (s.od.energy >= 100) {
                s.od.timer = 8 + s.shop[4];
                s.od.energy = 0;
                onOverdrive();
            }
        }
    }

    let gained = 0;
    for (let i = 0; i < s.circles.length; i++) {
        const lp = D.laps[i];
        if (lp <= 0) continue;
        gained += lp * dt * D.perRev;
        s.circles[i].mult = Math.min(MAX_NUM, s.circles[i].mult + lp * dt * D.gain[i]);
    }
    if (!isFinite(gained)) gained = MAX_NUM;
    s.score = Math.min(MAX_NUM, s.score + gained);
    s.runMax = Math.max(s.runMax, s.score);
    if (s.score >= PRESTIGE_UNLOCK) s.prestigeUnlocked = true;
    s.stats.playTime += dt;

    autoBuyTimer += dt;
    if (autoBuyTimer >= 0.25 && s.shop[3] > 0) {
        autoBuyTimer = 0;
        for (let i = 0; i < s.circles.length; i++) {
            if (!s.circles[i].auto) continue;
            const n = maxBuy(i);
            if (n > 0) buyLevels(i, n);
        }
    }

    checkContract();
}

/* ---------- Reboot (prestige) et exploits (promotions) ---------- */

function resetRun() {
    state.score = 0;
    state.circles = defaultCircles().map((c, i) => {
        c.auto = state.circles[i].auto;
        return c;
    });
    state.od = { energy: 0, timer: 0 };
}

function upcoming(score) {
    let pm = 1;
    let pe = 1;
    if (score >= 1e4) pm = Math.max(1, 2.56 * Math.pow(Math.log10(score / 1e3), 2.25));
    if (score >= 1e5) pe = 1 + Math.pow(Math.log10(score / 1e5), 2) / 225;
    return { pm, pe };
}

function shardsFor(score) {
    return Math.max(0, Math.floor(Math.log10(Math.max(score, 1))) - state.shardLog);
}

function grantShards() {
    const gain = shardsFor(state.score);
    state.shards += gain;
    state.shardLog = Math.max(state.shardLog, Math.floor(Math.log10(Math.max(state.score, 1))));
    return gain;
}

function canReboot() {
    if (state.ch.active || !state.prestigeUnlocked || state.score < PRESTIGE_UNLOCK) return false;
    const up = upcoming(state.score);
    return up.pm > state.pMult * 1.0001 || up.pe > state.pExp + 1e-6;
}

function doReboot() {
    if (!canReboot()) return null;
    const up = upcoming(state.score);
    const shards = grantShards();
    state.pMult = Math.max(state.pMult, up.pm);
    state.pExp = Math.max(state.pExp, up.pe);
    state.stats.prestiges++;
    resetRun();
    return { shards, pm: state.pMult, pe: state.pExp };
}

function exploitXp() {
    const up = upcoming(state.score);
    const pm = Math.max(state.pMult, up.pm);
    return pm >= 1000 ? Math.floor(Math.pow(pm / 1000, 0.5)) : 0;
}

function canExploit() {
    return !state.ch.active && state.score >= PRESTIGE_UNLOCK && exploitXp() >= 1;
}

function doExploit(k) {
    if (!canExploit()) return null;
    const xp = exploitXp();
    const shards = grantShards();
    state.promo[k] += xp;
    state.pMult = 1;
    state.pExp = 1;
    state.stats.promotions++;
    resetRun();
    return { xp, shards };
}

/* ---------- Marché noir ---------- */

function shopCost(i) {
    return Math.ceil(SHOP[i].base * Math.pow(SHOP[i].grow, state.shop[i]));
}

function buyShop(i) {
    if (state.shop[i] >= SHOP[i].max) return false;
    const cost = shopCost(i);
    if (state.shards < cost) return false;
    state.shards -= cost;
    state.shop[i]++;
    return true;
}

/* ---------- Contrats ---------- */

function startContract(id) {
    if (state.ch.active || state.ch.done.includes(id)) return false;
    state.ch.active = id;
    resetRun();
    return true;
}

function abandonContract() {
    if (!state.ch.active) return false;
    state.ch.active = null;
    resetRun();
    return true;
}

function checkContract() {
    const id = state.ch.active;
    if (!id) return;
    const c = CONTRACTS.find(x => x.id === id);
    if (state.score >= c.target) {
        state.ch.done.push(id);
        state.ch.active = null;
        resetRun();
        onContractDone(c);
    }
}

/* ---------- Succès ---------- */

function tickAchievements() {
    for (const a of ACHIEVEMENTS) {
        if (!state.ach[a.id] && a.test(state)) {
            state.ach[a.id] = true;
            onAchievement(a);
        }
    }
}

/* ---------- Sauvegarde ---------- */

function mergeValue(def, src) {
    if (src === undefined) return def;
    if (def === null) return src;
    if (src === null) return def;
    if (Array.isArray(def)) {
        if (!Array.isArray(src)) return def;
        if (def.length === 0) return src.filter(x => Number.isFinite(x));
        return def.map((d, i) => mergeValue(d, src[i]));
    }
    if (typeof def === "number") return Number.isFinite(src) ? src : def;
    if (typeof def === "boolean") return typeof src === "boolean" ? src : def;
    if (typeof def === "object") {
        if (Object.keys(def).length === 0) return typeof src === "object" ? { ...src } : def;
        const out = {};
        for (const k of Object.keys(def)) out[k] = mergeValue(def[k], src[k]);
        return out;
    }
    return typeof src === typeof def ? src : def;
}

function saveGame() {
    try {
        state.lastSave = Date.now();
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        return true;
    } catch (e) {
        return false;
    }
}

function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        state = mergeValue(defaultState(), JSON.parse(raw));
        return true;
    } catch (e) {
        return false;
    }
}

function exportSave() {
    state.lastSave = Date.now();
    return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

function importSave(text) {
    try {
        const data = JSON.parse(decodeURIComponent(escape(atob(text.trim()))));
        state = mergeValue(defaultState(), data);
        saveGame();
        return true;
    } catch (e) {
        return false;
    }
}

function hardReset() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
    state = defaultState();
}

function simulateOffline(elapsed) {
    const eff = 0.5 + 0.05 * state.shop[6];
    const total = Math.min(elapsed, OFFLINE_CAP_S) * eff;
    const before = state.score;
    const steps = Math.min(7200, Math.max(1, Math.ceil(total)));
    const dt = total / steps;
    for (let i = 0; i < steps; i++) advance(dt, true);
    return { seconds: Math.min(elapsed, OFFLINE_CAP_S), gained: state.score - before };
}

function applyOffline() {
    const elapsed = (Date.now() - state.lastSave) / 1000;
    if (elapsed < 60) return null;
    return simulateOffline(elapsed);
}
