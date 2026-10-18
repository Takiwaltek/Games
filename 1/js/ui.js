"use strict";

const $ = id => document.getElementById(id);
let clickTimestamps = [];
const rowRefs = [];
let chipRefs = [];
let shopRefs = [];
let contractRefs = [];
let missionRefs = [];
let exploitRefs = [];
let achRefs = {};
let infinityUpgradeRefs = [];
let infinityRiftRefs = [];
let tutorialIndex = 0;

const TUTORIAL_STEPS = [
    {
        title: "🎮 Bienvenue dans NEON//REVOLUTION",
        content: `<p><b>NEON//REVOLUTION</b> est un jeu de piratage inactif (idle game). Tu gères des processus pour générer des <b>octets</b> (ta monnaie).</p>
            <p><b>Clique le noyau</b> au centre du canvas pour gagner des octets. Ou clique le bouton ⚡ en bas du canvas.</p>
            <p>Tu commences avec du <b>BOTNET</b> qui produit automatiquement. Regarde le compteur « <b>OCTETS / s</b> » en haut à gauche!</p>`
    },
    {
        title: "📊 Les 10 processus",
        content: `<p>Il y a 10 processus du plus faible au plus puissant:</p>
            <p><b>BOTNET</b> → ROOTKIT → TROJAN → WORM → PHISH → KEYLOG → RANSOM → ZERO-DAY → BACKDOOR → QUANTUM</p>
            <p>Chaque processus débloqué (en haut à gauche) se déverrouille après 5 niveaux du précédent. Ils produisent des <b>octets</b> et gagnent en puissance avec le <b>P.MULT</b> (voir en haut).</p>
            <p>Plus tu as de processus puissants, plus tu gagnes vite!</p>`
    },
    {
        title: "💰 Acheter des niveaux",
        content: `<p>Dans l'onglet <b>PROCESSUS</b>, clique <b>ACHETER</b> pour augmenter le niveau d'un processus (coûte des octets).</p>
            <p><b>MAX</b> = achète autant de niveaux que tu peux avec tes octets. Le bouton « TOUT ACHETER » = achète tous les niveaux pour tous les processus.</p>
            <p>Les coûts augmentent : chaque niveau coûte plus cher. Plus tu vas loin, plus tu as besoin d'octets!</p>`
    },
    {
        title: "⚡ Surcharge du système (CPS)",
        content: `<p>Le <b>CPS</b> = clics par seconde. Clique trop vite et tu vas surcharger le système!</p>
            <p>🟢 < 3 CPS : normal. 🟠 3-5 CPS : attention. 🔴 > 8 CPS : le système plante!</p>
            <p>Si ça plante (effets visuels), c'est normal, tu ne perds rien. Mais ça peut être dérangeant. Tu peux désactiver ces effets dans <b>SYSTÈME</b>.</p>`
    },
    {
        title: "🔋 L'OVERDRIVE",
        content: `<p>Chaque clic et chaque octet gagné charge l'<b>OVERDRIVE</b> (barre en bas à gauche). Une fois à 100%, il s'active!</p>
            <p>Pendant ~8 secondes, tes processus vont <b>3x plus vite</b>. C'est puissant! Regarde « Overclock Overdrive » dans le MARCHÉ NOIR pour augmenter la durée.</p>
            <p>Le problème : tu cliques trop = surcharge. L'Overdrive te sauve!</p>`
    },
    {
        title: "🔧 Overclocker (améliorer)",
        content: `<p>Quand un processus atteint son niveau MAX (100 de base), tu peux le <b>OVERCLOCKER</b>.</p>
            <p>L'overclock : le processus revient au niveau 5, MAIS son plafond augmente de +10 (devient 110, puis 120...) ET sa puissance multipliée explose!</p>
            <p>Attention : tu perds l'overclock lors du REBOOT. C'est le prix à payer pour redémarrer plus fort.</p>`
    },
    {
        title: "🚀 Le REBOOT (redémarrage)",
        content: `<p>À <b>10 milliards d'octets</b>, tu peux faire un <b>REBOOT</b>. Clique le bouton dans l'onglet REBOOT.</p>
            <p>Effet : tu perds TOUT (octets, processus, overclocks), MAIS tu gagnes:</p>
            <p>✨ <b>P.MULT</b> permanent +x1.5 ou plus (multiplicateur)<br>✨ <b>P.EXP</b> permanent +0.01 ou plus (exposant bonus)<br>✨ <b>Crypto ₿</b> (nouvelle monnaie)</p>
            <p>Plus tu recommences, plus tu deviens puissant rapidement!</p>`
    },
    {
        title: "🛒 Le MARCHÉ NOIR",
        content: `<p>Utilise ta <b>Crypto ₿</b> pour acheter des améliorations PERMANENTES dans le <b>MARCHÉ NOIR</b>:</p>
            <p>💨 Surcadence CPU : +vitesse des processus<br>💥 Payload Amplifier : +gain de multiplicateur<br>🖱️ Neuro-Link : +puissance des clics<br>⏳ Lien Hors-ligne : tu gagnes octets même fermé (max 2h)</p>
            <p>Ces améliorations restent FOREVER. C'est là que tu dépenses ta Crypto!</p>`
    },
    {
        title: "🎯 EXPLOITS et autres défis",
        content: `<p>Quand <b>P.MULT ≥ x1000</b>, tu peux lancer un <b>EXPLOIT</b>. Cela remet P.MULT et P.EXP à zéro, mais renforce un kit d'exploit FOREVER.</p>
            <p>Les <b>CONTRATS</b> = défis bonus avec des règles spéciales. Réussis pour +rewards permanentes.</p>
            <p>Les <b>SUCCÈS</b> = chacun +2% revenus. À ~1.79e308 octets, tu débloques l'univers INFINI!</p>`
    },
    {
        title: "🎮 C'est parti!",
        content: `<p><b>Résumé :</b> Clique → achète processus → clique plus → REBOOT → Crypto → améliorations → REPEAT</p>
            <p>Chaque cycle te rend plus fort. Le jeu s'accélère exponentiellement!</p>
            <p>💡 Conseil : commence par augmenter BOTNET niveau 30-50, puis déverrouille les autres petit à petit.</p>
            <p>Bonne chance, hacker! 🚀</p>`
    }
];

function renderTutorial() {
    const step = TUTORIAL_STEPS[tutorialIndex];
    const isPanel = !$("tutorialPanel").hasAttribute("hidden");
    
    const progId = isPanel ? "tutorialPanelProgress" : "tutorialProgress";
    const titleId = isPanel ? "tutorialPanelTitle" : "tutorialTitle";
    const contentId = isPanel ? "tutorialPanelContent" : "tutorialContent";
    const backId = isPanel ? "tutorialPanelBack" : "tutorialBack";
    const nextId = isPanel ? "tutorialPanelNext" : "tutorialNext";
    
    const progEl = $(progId);
    const titleEl = $(titleId);
    const contentEl = $(contentId);
    const backEl = $(backId);
    const nextEl = $(nextId);
    
    if (progEl) progEl.textContent = `ÉTAPE ${tutorialIndex + 1} / ${TUTORIAL_STEPS.length}`;
    if (titleEl) titleEl.textContent = step.title;
    if (contentEl) contentEl.innerHTML = step.content;
    if (backEl) backEl.disabled = tutorialIndex === 0;
    if (nextEl) setText(nextEl, tutorialIndex === TUTORIAL_STEPS.length - 1 ? "COMMENCER À JOUER" : "SUIVANT");
}

function openTutorial() {
    tutorialIndex = 0;
    const panel = $("tutorialPanel");
    const helpBtn = $("helpBtn");
    panel.removeAttribute("hidden");
    helpBtn.classList.add("active");
    renderTutorial();
}

function closeTutorial() {
    const panel = $("tutorialPanel");
    const helpBtn = $("helpBtn");
    panel.setAttribute("hidden", "");
    helpBtn.classList.remove("active");
    $("tutorial").close();
    saveGame();
}

$("helpBtn").addEventListener("click", () => {
    const panel = $("tutorialPanel");
    if (panel.hasAttribute("hidden")) {
        openTutorial();
    } else {
        closeTutorial();
    }
});

$("closeTutorialPanel").addEventListener("click", closeTutorial);

/* ---------- Utilitaires ---------- */

function fmt(n) {
    if (!isFinite(n) || n >= MAX_NUM) return "∞";
    if (n < 1000) return n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : n.toFixed(0);
    if (n < 1e15) {
        const suf = ["", "K", "M", "B", "T"];
        const e = Math.floor(Math.log10(n) / 3);
        return (n / Math.pow(1000, e)).toFixed(2) + suf[e];
    }
    const e = Math.floor(Math.log10(n));
    return (n / Math.pow(10, e)).toFixed(2) + "e" + e;
}

function fmtTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m ${Math.floor(s % 60)}s`;
}

function setText(el, v) {
    if (el._t !== v) { el._t = v; el.textContent = v; }
}

function setDisabled(el, v) {
    if (el.disabled !== v) el.disabled = v;
}

function setShown(el, v) {
    const d = v ? "" : "none";
    if (el.style.display !== d) el.style.display = d;
}

/* ---------- Construction de l'interface ---------- */

function buildMultRow() {
    $("multRow").innerHTML = CIRCLES.map(c =>
        `<div class="chip" style="--c:${c.color}"><i>${c.name}</i><b>x1.00</b></div>`).join("");
    chipRefs = [...$("multRow").children].map(el => ({ el, val: el.querySelector("b") }));
}

function buildCircles() {
    $("tabCircles").innerHTML = `
        <div class="toolbar">
            <button class="btn warn" data-act="maxAll">TOUT ACHETER (M)</button>
            <span>Niv. max = 100 + 10 × overclocks</span>
        </div>
        <div id="crows">${CIRCLES.map((c, i) => `
            <div class="crow" style="--c:${c.color}">
                <div class="cdot"></div>
                <div>
                    <div class="cname">${c.name}<small></small></div>
                    <span class="cline l1"></span>
                    <span class="cline l2"></span>
                </div>
                <div class="cbtns">
                    <button class="btn b1" data-act="buy" data-i="${i}"></button>
                    <button class="btn bmax" data-act="max" data-i="${i}"></button>
                    <button class="btn asc" data-act="asc" data-i="${i}">OVERCLOCK</button>
                    <button class="btn tog" data-act="auto" data-i="${i}">AUTO</button>
                </div>
                <div class="clock">🔒 Se débloque après 5 niveaux de ${i > 0 ? CIRCLES[i - 1].name : ""}</div>
            </div>`).join("")}
        </div>`;
    const rows = [...$("crows").children];
    rows.forEach((row, i) => {
        rowRefs[i] = {
            row,
            asc: row.querySelector("small"),
            l1: row.querySelector(".l1"),
            l2: row.querySelector(".l2"),
            b1: row.querySelector(".b1"),
            bmax: row.querySelector(".bmax"),
            basc: row.querySelector(".asc"),
            auto: row.querySelector(".tog"),
            lock: row.querySelector(".clock"),
            btns: row.querySelector(".cbtns"),
            info: row.children[1]
        };
    });
}

function buildPrestige() {
    $("tabPrestige").innerHTML = `
        <div class="card">
            <h3>♻ REBOOT SYSTÈME (PRESTIGE)</h3>
            <p>Débloqué à ${fmt(PRESTIGE_UNLOCK)} octets. Efface octets, processus et overclocks, mais remplace P.MULT et P.EXP par de meilleures valeurs. Gagne aussi de la Crypto.</p>
            <div class="kv"><span>P.MULT</span><b id="pvPm"></b></div>
            <div class="kv"><span>P.EXP (appliqué en dernier, très puissant)</span><b id="pvPe"></b></div>
            <div class="kv"><span>Crypto gagnée</span><b id="pvSh"></b></div>
            <button class="btn big warn" id="btnReboot" data-act="reboot">REBOOT</button>
        </div>
        <div class="card">
            <h3>☠ EXPLOITS (PROMOTIONS)</h3>
            <p>Disponible quand P.MULT atteint x1000 (actuel ou à venir). Efface tout, y compris P.MULT et P.EXP, pour monter un kit d'exploit de <b id="pvXp" style="color:var(--y)">0</b> niveau(x).</p>
            ${EXPLOITS.map((e, k) => `
                <div class="prow">
                    <div><b>${e.name}</b> <em class="lv" style="color:var(--m);font-style:normal"></em><span>${e.desc}</span><span class="eff"></span></div>
                    <button class="btn danger" data-act="exploit" data-i="${k}">LANCER</button>
                </div>`).join("")}
        </div>`;
    exploitRefs = [...$("tabPrestige").querySelectorAll(".prow")].map(row => ({
        lv: row.querySelector(".lv"), eff: row.querySelector(".eff"), btn: row.querySelector("button")
    }));
}

function buildShop() {
    $("tabShop").innerHTML = `<div class="card"><p>Dépense ta Crypto ₿ (gagnée aux reboots et exploits) en améliorations permanentes.</p><div class="kv"><span>Crypto disponible</span><b id="shopShards">0</b></div></div>` +
        SHOP.map((s, i) => `
            <div class="card">
                <h3>${s.name} <small class="lv" style="color:var(--m)"></small></h3>
                <p class="desc"></p>
                <button class="btn big" data-act="shop" data-i="${i}"></button>
            </div>`).join("");
    shopRefs = [...$("tabShop").querySelectorAll(".card")].slice(1).map(card => ({
        lv: card.querySelector(".lv"), desc: card.querySelector(".desc"), btn: card.querySelector("button")
    }));
}

function buildContracts() {
    $("tabContracts").innerHTML = CONTRACTS.map(c => `
        <div class="card">
            <h3>${c.name}</h3>
            <p>${c.desc}</p>
            <div class="kv"><span>Objectif</span><b>${fmt(c.target)} octets</b></div>
            <div class="kv"><span>Récompense</span><b>${c.reward}</b></div>
            <button class="btn big" data-act="contract" data-id="${c.id}"></button>
        </div>`).join("");
    contractRefs = [...$("tabContracts").children].map(card => ({ card, btn: card.querySelector("button") }));
}

function buildMissions() {
    $("tabMissions").innerHTML = `
        <div class="card">
            <h3>OBJECTIFS EXPRESS</h3>
            <p>Des défis courts à ton rythme. Termine-les pour gagner de la Crypto ; une nouvelle série commence quand tu as réclamé les trois récompenses. Aucun délai, aucune pénalité si tu fais une pause.</p>
            <div class="kv"><span>Série</span><b id="missionRound">1</b></div>
        </div>
        ${QUICK_MISSIONS.map((mission, i) => `
            <div class="card mission-card">
                <h3>${mission.name}</h3>
                <p>${mission.desc}</p>
                <div class="mission-progress"><i></i></div>
                <div class="kv"><span class="mission-count"></span><b class="mission-reward"></b></div>
                <button class="btn big" data-act="claimMission" data-i="${i}"></button>
            </div>`).join("")}`;
    missionRefs = [...$("tabMissions").querySelectorAll(".mission-card")].map(card => ({
        card,
        bar: card.querySelector(".mission-progress i"),
        count: card.querySelector(".mission-count"),
        reward: card.querySelector(".mission-reward"),
        btn: card.querySelector("button")
    }));
}

function buildAchievements() {
    $("tabAch").innerHTML = `<div class="card"><p>Chaque succès donne +2% de revenus.</p><div class="kv"><span>Débloqués</span><b id="achCount">0</b></div></div>
        <div class="agrid">${ACHIEVEMENTS.map(a => `<div class="badge" data-id="${a.id}"><b>${a.name}</b><span>${a.desc}</span></div>`).join("")}</div>`;
    achRefs = {};
    $("tabAch").querySelectorAll(".badge").forEach(el => { achRefs[el.dataset.id] = el; });
}

function buildInfinity() {
    $("tabInfinity").innerHTML = `
        <div class="card">
            <h3>∞ NEON//REVOLUTION : FRACTURE</h3>
            <p>Tu as franchi la limite des octets. Ta progression d'origine est conservée. Explore les failles, reconstruis le nouvel univers et utilise ses Fragments pour alimenter de nouvelles améliorations.</p>
            <div class="kv"><span>Fragments d'Infini</span><b id="infinityBalance">0</b></div>
            <div class="kv"><span>Production actuelle</span><b id="infinityRate">0 / s</b></div>
            <div class="rift-map" id="riftMap"></div>
        </div>
        <div class="card">
            <h3>FAILLE DIMENSIONNELLE</h3>
            <p id="riftStory">Un signal attend au-delà du réseau connu...</p>
            <div class="kv"><span>Zone suivante</span><b id="riftZone">À découvrir</b></div>
            <div class="kv"><span>Récompense</span><b id="riftReward">Production de fragments améliorée</b></div>
            <button class="btn big warn" id="riftRepair" data-act="repairRift">ANALYSER LA FAILLE</button>
        </div>
        <h3 class="infinity-section-title">AMÉLIORATIONS DE L'INFINI</h3>
        ${INFINITY_UPGRADES.map((upgrade, i) => `
            <div class="card">
                <h3>${upgrade.name} <small class="lv" style="color:var(--m)"></small></h3>
                <p class="desc"></p>
                <button class="btn big" data-act="infinityUpgrade" data-i="${i}"></button>
            </div>`).join("")}`;
    $("riftMap").innerHTML = INFINITY_RIFTS.map((rift, i) => `
        <div class="rift-node${i === 0 ? " current" : ""}">
            <span>${i + 1}</span>
            <b>${rift.zone}</b>
            <small>${i === 0 ? "SIGNAL DÉTECTÉ" : "SIGNAL ABSENT"}</small>
        </div>`).join("");
    infinityUpgradeRefs = [...$("tabInfinity").querySelectorAll(".card")].slice(2).map(card => ({
        lv: card.querySelector(".lv"),
        desc: card.querySelector(".desc"),
        btn: card.querySelector("button")
    }));
    infinityRiftRefs = [...$("riftMap").children].map(node => ({
        node,
        marker: node.querySelector("span"),
        status: node.querySelector("small")
    }));
}

function buildOptions() {
    $("tabOptions").innerHTML = `
        <div class="card">
            <h3>PARAMÈTRES</h3>
            <div class="btnrow">
                <button class="btn tog" id="optSound" data-act="sound"></button>
                <button class="btn tog" id="optFx" data-act="fx"></button>
                <button class="btn" data-act="save">SAUVEGARDER</button>
            </div>
        </div>
        <div class="card">
            <h3>EXPORT / IMPORT</h3>
            <div class="btnrow">
                <button class="btn" data-act="export">EXPORTER</button>
                <button class="btn" data-act="import">IMPORTER</button>
            </div>
            <textarea id="saveText" placeholder="Code de sauvegarde..."></textarea>
        </div>
        <div class="card">
            <h3>STATISTIQUES</h3>
            <div id="statsBox"></div>
        </div>
        <div class="card">
            <h3>ZONE DANGER</h3>
            <button class="btn danger" data-act="reset">TOUT EFFACER</button>
        </div>`;
}

/* ---------- Mise à jour de l'interface ---------- */

function updateTop() {
    setText($("score"), fmt(state.score));
    setText($("sps"), fmt(D.sps));
    setText($("pm"), "x" + fmt(D.pm));
    setText($("pe"), "^" + D.pe.toFixed(3));
    setText($("shards"), fmt(state.shards));
    $("infinityResource").hidden = !state.infinity.unlocked;
    $("infinityTab").hidden = !state.infinity.unlocked;
    setText($("infinityFragments"), fmt(state.infinity.fragments));
    setText($("peakCps"), state.stats.peakCps.toFixed(1));
    setText($("clickVal"), fmt(D.clickValue * (isBreaking ? 2 : 1)));

    const od = state.od;
    const odMax = 8 + state.shop[4];
    const fill = $("odFill");
    if (od.timer > 0) {
        fill.classList.add("active");
        fill.style.width = (od.timer / odMax * 100).toFixed(1) + "%";
        setText($("odText"), Math.ceil(od.timer) + "s");
        setText($("odLabel"), "OVERDRIVE x3");
    } else {
        fill.classList.remove("active");
        fill.style.width = od.energy.toFixed(1) + "%";
        setText($("odText"), Math.floor(od.energy) + "%");
        setText($("odLabel"), "OVERDRIVE");
    }

    const banner = $("challengeBanner");
    if (state.ch.active) {
        const c = CONTRACTS.find(x => x.id === state.ch.active);
        banner.style.display = "block";
        const html = `⚠ ${c.name} - objectif ${fmt(c.target)} octets <button class="btn danger" data-act="abandon">ABANDONNER</button>`;
        if (banner._h !== html) { banner._h = html; banner.innerHTML = html; }
    } else {
        banner.style.display = "none";
    }

    chipRefs.forEach((ch, i) => {
        ch.el.classList.toggle("on", isUnlocked(i));
        setText(ch.val, "x" + fmt(state.circles[i].mult));
    });
}

function updateCircles() {
    for (let i = 0; i < CIRCLES.length; i++) {
        const r = rowRefs[i];
        const c = state.circles[i];
        const unlocked = isUnlocked(i);
        r.row.classList.toggle("locked", !unlocked);
        setShown(r.lock, !unlocked);
        setShown(r.btns, unlocked);
        setShown(r.info, unlocked);
        if (!unlocked) continue;
        const cap = circleCap(c);
        setText(r.asc, c.asc > 0 ? `OC ${c.asc}` : "");
        setText(r.l1, `Niv ${c.lvl}/${cap} · ${fmt(D.laps[i])} tours/s`);
        setText(r.l2, `+${D.gain[i] < 1000 ? D.gain[i].toFixed(3) : fmt(D.gain[i])} mult/tour · mult x${fmt(c.mult)}`);
        const cost = circleCost(i);
        setText(r.b1, `+1 · ${fmt(cost)}`);
        setDisabled(r.b1, c.lvl >= cap || state.score < cost);
        const n = maxBuy(i);
        setText(r.bmax, `MAX +${n}`);
        setDisabled(r.bmax, n === 0);
        setShown(r.basc, c.lvl >= cap);
        setDisabled(r.basc, !canAscend(i));
        setShown(r.auto, state.shop[3] > 0);
        r.auto.classList.toggle("active", c.auto);
    }
}

function updatePrestige() {
    const up = upcoming(state.score);
    setText($("pvPm"), `x${fmt(state.pMult)} → x${fmt(Math.max(state.pMult, up.pm))}`);
    setText($("pvPe"), `^${state.pExp.toFixed(3)} → ^${Math.max(state.pExp, up.pe).toFixed(3)}`);
    setText($("pvSh"), "+" + fmt(shardsFor(state.score)));
    const btn = $("btnReboot");
    setDisabled(btn, !canReboot());
    setText(btn, !state.prestigeUnlocked ? `BLOQUÉ (atteins ${fmt(PRESTIGE_UNLOCK)} octets)` : state.ch.active ? "INDISPONIBLE PENDANT UN CONTRAT" : "REBOOT");
    setText($("pvXp"), exploitXp());
    EXPLOITS.forEach((e, k) => {
        const r = exploitRefs[k];
        setText(r.lv, "Niv " + state.promo[k]);
        setText(r.eff, k < 3 ? `Effet actuel : x${fmt(D.P[k])}` : `Effet actuel : x${D.P[3].toFixed(2)} sur les 3 autres`);
        setDisabled(r.btn, !canExploit());
    });
}

function updateShop() {
    setText($("shopShards"), fmt(state.shards));
    SHOP.forEach((s, i) => {
        const r = shopRefs[i];
        const lvl = state.shop[i];
        setText(r.lv, `Niv ${lvl}/${s.max}`);
        setText(r.desc, s.desc(lvl));
        const maxed = lvl >= s.max;
        setText(r.btn, maxed ? "MAX" : `ACHETER · ${shopCost(i)} ₿`);
        setDisabled(r.btn, maxed || state.shards < shopCost(i));
    });
}

function updateContracts() {
    CONTRACTS.forEach((c, i) => {
        const r = contractRefs[i];
        const done = state.ch.done.includes(c.id);
        const active = state.ch.active === c.id;
        r.card.classList.toggle("done", done);
        r.card.classList.toggle("active", active);
        setText(r.btn, done ? "TERMINÉ ✔" : active ? "EN COURS..." : "LANCER LE CONTRAT");
        setDisabled(r.btn, done || active || !!state.ch.active);
    });
}

function updateMissions() {
    setText($("missionRound"), state.missions.round);
    QUICK_MISSIONS.forEach((mission, i) => {
        const refs = missionRefs[i];
        const target = missionTarget(i);
        const progress = missionProgress(i);
        const claimed = state.missions.claimed[i];
        const complete = progress >= target;
        refs.card.classList.toggle("done", claimed);
        refs.card.classList.toggle("ready", complete && !claimed);
        refs.bar.style.width = `${Math.min(100, progress / target * 100)}%`;
        setText(refs.count, `${fmt(Math.min(progress, target))} / ${fmt(target)}`);
        setText(refs.reward, `Récompense : ${mission.reward(state.missions.round)} ₿`);
        setText(refs.btn, claimed ? "RÉCOMPENSE RÉCLAMÉE" : complete ? "RÉCLAMER LA CRYPTO" : "EN COURS");
        setDisabled(refs.btn, claimed || !complete);
    });
}

function updateAchievements() {
    let n = 0;
    ACHIEVEMENTS.forEach(a => {
        const got = !!state.ach[a.id];
        if (got) n++;
        achRefs[a.id].classList.toggle("got", got);
    });
    setText($("achCount"), `${n}/${ACHIEVEMENTS.length}`);
}

function updateInfinity() {
    setText($("infinityBalance"), fmt(state.infinity.fragments));
    setText($("infinityRate"), `${fmt(D.infinityFragmentsPerSecond)} / s`);
    const nextRift = INFINITY_RIFTS[state.infinity.rifts];
    infinityRiftRefs.forEach((refs, i) => {
        const repaired = i < state.infinity.rifts;
        const current = i === state.infinity.rifts;
        refs.node.classList.toggle("repaired", repaired);
        refs.node.classList.toggle("current", current);
        setText(refs.marker, repaired ? "✓" : i + 1);
        setText(refs.status, repaired ? "RECONSTRUITE" : current ? "SIGNAL DÉTECTÉ" : "SIGNAL ABSENT");
    });
    setText($("riftZone"), nextRift ? nextRift.zone : "Toutes les failles réparées");
    setText($("riftReward"), nextRift ? nextRift.reward : "La Fracture est refermée. L'univers est reconstruit.");
    setText($("riftStory"), nextRift ? nextRift.story : "Le réseau reconstruit pulse de nouveau. Une nouvelle aventure pourra s'ouvrir au-delà de cette galaxie.");
    const riftButton = $("riftRepair");
    setText(riftButton, nextRift ? `RÉPARER · ${fmt(nextRift.cost)} fragments` : "UNIVERS RECONSTRUIT");
    setDisabled(riftButton, !nextRift || state.infinity.fragments < nextRift.cost);
    INFINITY_UPGRADES.forEach((upgrade, i) => {
        const refs = infinityUpgradeRefs[i];
        const level = state.infinity.upgrades[i];
        const maxed = level >= upgrade.max;
        setText(refs.lv, `Niv ${level}/${upgrade.max}`);
        setText(refs.desc, upgrade.desc(level));
        setText(refs.btn, maxed ? "MAX" : `AMÉLIORER · ${fmt(infinityUpgradeCost(i))} fragments`);
        setDisabled(refs.btn, maxed || state.infinity.fragments < infinityUpgradeCost(i));
    });
}

function updateOptions() {
    setText($("optSound"), "SON : " + (state.settings.sound ? "ON" : "OFF"));
    $("optSound").classList.toggle("active", state.settings.sound);
    setText($("optFx"), "EFFETS DE CASSE : " + (state.settings.fx ? "ON" : "OFF"));
    $("optFx").classList.toggle("active", state.settings.fx);
    const s = state.stats;
    const rows = [
        ["Temps de jeu", fmtTime(s.playTime)],
        ["Clics", fmt(s.clicks)],
        ["Record CPS", s.peakCps.toFixed(1)],
        ["Systèmes plantés", s.broke],
        ["Overclocks", s.ascensions],
        ["Reboots", s.prestiges],
        ["Exploits", s.promotions]
    ];
    const html = rows.map(r => `<div class="kv"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("");
    if ($("statsBox")._h !== html) { $("statsBox")._h = html; $("statsBox").innerHTML = html; }
}

function activeTabId() {
    const el = document.querySelector(".tabc.active");
    return el ? el.id : "tabCircles";
}

function updateUI() {
    updateTop();
    switch (activeTabId()) {
        case "tabCircles": updateCircles(); break;
        case "tabPrestige": updatePrestige(); break;
        case "tabShop": updateShop(); break;
        case "tabContracts": updateContracts(); break;
        case "tabMissions": updateMissions(); break;
        case "tabAch": updateAchievements(); break;
        case "tabInfinity": updateInfinity(); break;
        case "tabOptions": updateOptions(); break;
    }
}

/* ---------- Événements du jeu ---------- */

function onOverdrive() {
    triggerShake();
    logLine("> OVERDRIVE actif : processus x3 !", "warn");
    beep(880, 0.2, "sawtooth", 0.04);
}

function onContractDone(c) {
    toast("Contrat terminé : " + c.name + " · " + c.reward, "gold");
    logLine("> " + c.name + " accompli. Paiement reçu.", "ok");
    beep(990, 0.3, "triangle", 0.05);
}

function onAchievement(a) {
    toast("Succès : " + a.name, "gold");
    logLine("> succès débloqué : " + a.name, "info");
    beep(1200, 0.15, "triangle", 0.04);
}

/* ---------- Clics ---------- */

function calcCPS(now) {
    clickTimestamps = clickTimestamps.filter(t => t > now - 1000);
    const n = clickTimestamps.length;
    if (n === 0 || now - clickTimestamps[n - 1] > 350) return 0;
    if (n < 2) return 1;
    const duration = (clickTimestamps[n - 1] - clickTimestamps[0]) / 1000;
    return duration > 0.05 ? (n - 1) / duration : n;
}

function doClick(x, y) {
    const now = Date.now();
    clickTimestamps.push(now);
    currentCPS = calcCPS(now);
    state.stats.clicks++;
    computeDerived();
    const val = D.clickValue * (isBreaking ? 2 : 1);
    state.score = Math.min(MAX_NUM, state.score + val);
    state.runMax = Math.max(state.runMax, state.score);
    if (state.od.timer <= 0) state.od.energy = Math.min(100, state.od.energy + 2.5);
    spawnClickFx(x, y, "+" + fmt(val), tierColor(currentCPS), currentCPS);
    beep(300 + Math.min(currentCPS, 12) * 40, 0.04, "square", 0.02);
    if (currentCPS >= 8) triggerShake();
}

const canvasWrap = document.getElementById("canvasWrap");
canvasWrap.addEventListener("pointerdown", e => {
    if (e.target === canvas || e.target.id === "mainClickBtn") {
        const r = canvas.getBoundingClientRect();
        doClick((e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height);
    }
});

document.addEventListener("keydown", e => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "textarea" || tag === "input") return;
    if ($("tutorial").open) return;
    if (e.code === "Space") {
        e.preventDefault();
        if (!e.repeat) doClick(canvas.width / 2 + randomBetween(-20, 20), canvas.height / 2 + randomBetween(-20, 20));
    } else if (e.code === "KeyM" && !e.repeat) {
        if (buyAllMax()) beep(660, 0.05);
    }
});

/* ---------- Actions des boutons ---------- */

const ACTIONS = {
    maxAll() { if (buyAllMax()) beep(660, 0.05); },
    buy(el) { const i = +el.dataset.i; if (maxBuy(i) > 0 && buyLevels(i, 1)) beep(520, 0.04); },
    max(el) { const i = +el.dataset.i; const n = maxBuy(i); if (n > 0 && buyLevels(i, n)) beep(620, 0.05); },
    asc(el) {
        const i = +el.dataset.i;
        if (ascend(i)) {
            logLine(`> OVERCLOCK ${CIRCLES[i].name} : puissance x${fmt(D.ascPow)} sur le gain de mult`, "warn");
            triggerShake();
            beep(440, 0.25, "sawtooth", 0.04);
        }
    },
    auto(el) { const c = state.circles[+el.dataset.i]; c.auto = !c.auto; },
    reboot() {
        if (!canReboot()) return;
        const up = upcoming(state.score);
        if (!confirm(`REBOOT ? P.MULT x${fmt(Math.max(state.pMult, up.pm))}, P.EXP ^${Math.max(state.pExp, up.pe).toFixed(3)}, +${shardsFor(state.score)} Crypto. Tout le reste est effacé.`)) return;
        const r = doReboot();
        logLine(`> REBOOT : P.MULT x${fmt(r.pm)} · P.EXP ^${r.pe.toFixed(3)} · +${r.shards} ₿`, "ok");
        toast("Reboot ! +" + r.shards + " ₿", "gold");
        triggerShake();
        beep(200, 0.5, "sawtooth", 0.05);
    },
    exploit(el) {
        if (!canExploit()) return;
        const k = +el.dataset.i;
        if (!confirm(`Lancer l'exploit ${EXPLOITS[k].name} (+${exploitXp()} niveau(x)) ? Tout est effacé, y compris P.MULT et P.EXP.`)) return;
        const r = doExploit(k);
        logLine(`> EXPLOIT ${EXPLOITS[k].name} +${r.xp} · +${r.shards} ₿`, "ok");
        toast("Exploit " + EXPLOITS[k].name + " +" + r.xp, "gold");
        triggerShake();
        beep(150, 0.6, "sawtooth", 0.05);
    },
    shop(el) { if (buyShop(+el.dataset.i)) beep(760, 0.08, "triangle", 0.04); },
    infinityUpgrade(el) {
        if (buyInfinityUpgrade(+el.dataset.i)) {
            logLine("> amélioration de l'univers infini achetée.", "gold");
            tickAchievements();
            beep(760, 0.08, "triangle", 0.04);
        }
    },
    repairRift() {
        const rift = repairInfinityRift();
        if (!rift) return;
        toast(`${rift.name} reconstruite !`, "gold");
        logLine(`> faille réparée : ${rift.zone}. ${rift.reward}.`, "ok");
        tickAchievements();
        updateUI();
        saveGame();
        triggerShake();
        beep(990, 0.3, "triangle", 0.05);
    },
    claimMission(el) {
        const reward = claimMission(+el.dataset.i);
        if (reward) {
            toast(`Objectif terminé : +${reward} Crypto`, "gold");
            logLine(`> objectif express terminé. +${reward} ₿`, "ok");
            saveGame();
            beep(990, 0.16, "triangle", 0.04);
        }
    },
    contract(el) {
        const id = +el.dataset.id;
        if (state.ch.active || state.ch.done.includes(id)) return;
        if (!confirm("Lancer le contrat ? Ta run actuelle sera effacée.")) return;
        if (startContract(id)) logLine("> contrat accepté. bonne chance.", "warn");
    },
    abandon() { if (confirm("Abandonner le contrat ?")) abandonContract(); },
    sound() { state.settings.sound = !state.settings.sound; },
    fx() { state.settings.fx = !state.settings.fx; },
    save() { if (saveGame()) toast("Sauvegarde OK"); },
    export() { $("saveText").value = exportSave(); $("saveText").select(); },
    import() {
        if (importSave($("saveText").value)) { toast("Import réussi"); location.reload(); }
        else toast("Code invalide");
    },
    reset() {
        if (!confirm("Tout effacer définitivement ?")) return;
        hardReset();
        location.reload();
    }
};

document.addEventListener("click", e => {
    if (e.target.closest("#tutorialBack") || e.target.closest("#tutorialPanelBack")) {
        tutorialIndex = Math.max(0, tutorialIndex - 1);
        renderTutorial();
        return;
    }
    if (e.target.closest("#tutorialNext") || e.target.closest("#tutorialPanelNext")) {
        if (tutorialIndex === TUTORIAL_STEPS.length - 1) {
            closeTutorial();
        } else {
            tutorialIndex++;
            renderTutorial();
        }
        return;
    }
    if (e.target.closest("#tutorialSkip")) {
        closeTutorial();
        return;
    }
    const tab = e.target.closest("[data-tab]");
    if (tab) {
        document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
        document.querySelectorAll(".tabc").forEach(t => t.classList.toggle("active", t.id === tab.dataset.tab));
        updateUI();
        return;
    }
    const act = e.target.closest("[data-act]");
    if (act && !act.disabled && ACTIONS[act.dataset.act]) {
        ACTIONS[act.dataset.act](act);
        updateUI();
    }
});

/* ---------- Boucle principale ---------- */

function updateAlertAndHud() {
    const alert = $("smashAlert");
    const hud = $("cpsHud");
    let cls = "";
    let msg = "";
    if (currentCPS >= 8) { cls = "tier-3"; msg = "🛑 OH LÀ LÀ LÀ DOUCEMENT LÀ ! (>= 8 CPS)"; }
    else if (currentCPS >= 5) { cls = "tier-2"; msg = "⚡ AH OUI LÀ TU COMMENCES À PÉTER UN CÂBLE ! (>= 5 CPS)"; }
    else if (currentCPS >= 3) { cls = "tier-1"; msg = "👴 Tu cliques comme papi... (>= 3 CPS)"; }
    if (alert.className !== cls) alert.className = cls;
    if (msg && alert.textContent !== msg) alert.textContent = msg;

    if (currentCPS > 0.1) {
        hud.className = currentCPS >= 9.5 ? "active rainbow" : "active";
        hud.style.color = currentCPS >= 9.5 ? "" : tierColor(currentCPS);
        hud.style.fontSize = Math.floor(18 + currentCPS * 1.4) + "px";
        hud.textContent = currentCPS.toFixed(1) + " CPS";
    } else {
        hud.className = "";
    }
}

let lastTs = performance.now();
let lastWall = Date.now();
let uiAcc = 0, achAcc = 0, saveAcc = 0, fakeAcc = 0, rainAcc = 0;

function frame(ts) {
    const dt = Math.min(0.25, (ts - lastTs) / 1000);
    lastTs = ts;
    const wall = Date.now();
    const gap = (wall - lastWall) / 1000;
    lastWall = wall;
    if (gap > 30) {
        const r = simulateOffline(gap);
        toast(`Hors-ligne ${fmtTime(r.seconds)} : +${fmt(r.gained)} octets`, "gold");
    }

    currentCPS = calcCPS(wall);
    if (currentCPS > state.stats.peakCps) state.stats.peakCps = currentCPS;
    updateBreakMode(currentCPS, wall);
    advance(dt, false);
    updateAlertAndHud();
    render(dt);

    uiAcc += dt; achAcc += dt; saveAcc += dt; fakeAcc += dt; rainAcc += dt;
    if (uiAcc >= 0.1) { uiAcc = 0; updateUI(); }
    if (achAcc >= 1) { achAcc = 0; tickAchievements(); }
    if (saveAcc >= 10) { saveAcc = 0; saveGame(); }
    if (fakeAcc >= 4 && !isBreaking) { fakeAcc = 0; logLine(FAKE_LINES[rnd(FAKE_LINES.length)](), "dim"); }
    if (rainAcc >= 0.07) { rainAcc = 0; drawRain(); }
    requestAnimationFrame(frame);
}

function init() {
    const loaded = loadGame();
    buildMultRow();
    buildCircles();
    buildPrestige();
    buildShop();
    buildContracts();
    buildMissions();
    buildAchievements();
    buildInfinity();
    buildOptions();
    resizeRain();
    window.addEventListener("resize", resizeRain);
    window.addEventListener("beforeunload", saveGame);

    logLine("> boot NEON//REVOLUTION v2.077 ...", "ok");
    logLine(loaded ? "> session restaurée." : "> nouvelle session. clique le noyau pour pirater.", "info");
    if (loaded) {
        const r = applyOffline();
        if (r) {
            toast(`Hors-ligne ${fmtTime(r.seconds)} : +${fmt(r.gained)} octets`, "gold");
            logLine(`> hors-ligne : +${fmt(r.gained)} octets`, "ok");
        }
    }
    computeDerived();
    tickAchievements();
    updateUI();
    lastTs = performance.now();
    lastWall = Date.now();
    requestAnimationFrame(frame);
}

init();
