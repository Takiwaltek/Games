"use strict";

const MAX_NUM = Number.MAX_VALUE;
const SAVE_KEY = "neonRevolution.hack.v1";
const PRESTIGE_UNLOCK = 1e10;
const OFFLINE_CAP_S = 2 * 3600;
const BREAK_START_CPS = 8;
const BREAK_END_CPS = 5;
const BASE_MULT_GAIN = 0.01;

// 10 processus: coût initial, multiplicateur de coût, vitesse de base (tours/s par niveau)
const CIRCLES = [
    { name: "BOTNET",   color: "#ff2a55", c0: 4,    m0: 1.20, speed: 0.200 },
    { name: "ROOTKIT",  color: "#ff8a1f", c0: 100,  m0: 1.24, speed: 0.100 },
    { name: "TROJAN",   color: "#fcee0a", c0: 1e3,  m0: 1.28, speed: 0.067 },
    { name: "WORM",     color: "#39ff14", c0: 1e4,  m0: 1.32, speed: 0.050 },
    { name: "PHISH",    color: "#00ffc8", c0: 1e6,  m0: 1.36, speed: 0.040 },
    { name: "KEYLOG",   color: "#00f0ff", c0: 1e9,  m0: 1.40, speed: 0.033 },
    { name: "RANSOM",   color: "#2f6bff", c0: 1e12, m0: 1.44, speed: 0.029 },
    { name: "ZERO-DAY", color: "#b84dff", c0: 1e15, m0: 1.48, speed: 0.025 },
    { name: "BACKDOOR", color: "#ff2bd6", c0: 1e18, m0: 1.52, speed: 0.022 },
    { name: "QUANTUM",  color: "#f4f4ff", c0: 1e27, m0: 1.56, speed: 0.020 }
];

// Marché noir (payé en Crypto, gagnée aux reboots et exploits)
const SHOP = [
    { name: "Surcadence CPU",      max: 20, base: 1, grow: 1.45, desc: l => `Vitesse des processus x${(1 + 0.1 * l).toFixed(2)} (+10%/niv)` },
    { name: "Payload Amplifier",   max: 20, base: 1, grow: 1.45, desc: l => `Gain de mult x${(1 + 0.15 * l).toFixed(2)} (+15%/niv)` },
    { name: "Neuro-Link",          max: 20, base: 1, grow: 1.4,  desc: l => `Valeur du clic x${(1 + 0.5 * l).toFixed(1)} (+50%/niv)` },
    { name: "Daemon AutoBuy",      max: 1,  base: 5, grow: 1,    desc: l => l ? "Actif : bouton AUTO débloqué" : "Débloque l'achat automatique" },
    { name: "Overclock Overdrive", max: 10, base: 2, grow: 1.5,  desc: l => `Durée de surcharge ${8 + l}s (+1s/niv)` },
    { name: "Réseau Neuronal",     max: 25, base: 2, grow: 1.5,  desc: l => `Revenus x${(1 + 0.1 * l).toFixed(2)} (+10%/niv)` },
    { name: "Lien Hors-Ligne",     max: 10, base: 3, grow: 1.5,  desc: l => `Efficacité hors-ligne ${50 + 5 * l}% (+5%/niv)` }
];

// 4 kits d'exploit (promotions)
const EXPLOITS = [
    { name: "PAYLOAD",     desc: "Multiplie le gain de mult des processus" },
    { name: "BANDWIDTH",   desc: "Multiplie la vitesse des processus" },
    { name: "ROOT ACCESS", desc: "Augmente la puissance d'overclock" },
    { name: "ZERO-DAY KIT", desc: "Renforce les trois autres exploits" }
];

const CONTRACTS = [
    { id: 1, name: "CONTRAT 01 · INFLATION",      desc: "Les coûts de chaque niveau montent +0.15 plus vite.", target: 1e9,  reward: "Revenus x1.5" },
    { id: 2, name: "CONTRAT 02 · ZÉRO OVERCLOCK", desc: "Overclock (ascension) désactivé.",                   target: 1e11, reward: "Puissance d'overclock +1" },
    { id: 3, name: "CONTRAT 03 · SOLITUDE",       desc: "Seuls les processus impairs produisent.",            target: 1e12, reward: "Vitesse +20%" }
];

// Chaque succès donne +2% de revenus
const ACHIEVEMENTS = [
    { id: "boot",    name: "Premier boot",       desc: "Atteindre 100 octets",           test: s => s.runMax >= 100 },
    { id: "mega",    name: "Mégaoctet",          desc: "Atteindre 1e6 octets",           test: s => s.runMax >= 1e6 },
    { id: "giga",    name: "Gigaoctet",          desc: "Atteindre 1e9 octets",           test: s => s.runMax >= 1e9 },
    { id: "tera",    name: "Térabyte",           desc: "Atteindre 1e12 octets",          test: s => s.runMax >= 1e12 },
    { id: "net",     name: "Réseau complet",     desc: "Débloquer les 10 processus",     test: s => s.circles.every((c, i) => isUnlocked(i)) },
    { id: "asc1",    name: "Overclock",          desc: "Faire 1 overclock",              test: s => s.stats.ascensions >= 1 },
    { id: "asc10",   name: "Surchauffe CPU",     desc: "Faire 10 overclocks",            test: s => s.stats.ascensions >= 10 },
    { id: "reboot",  name: "Effacer les traces", desc: "Faire 1 reboot",                 test: s => s.stats.prestiges >= 1 },
    { id: "exp2",    name: "Exposant x2",        desc: "Atteindre P.EXP ^2",             test: s => s.pExp >= 2 },
    { id: "exploit", name: "Script kiddie",      desc: "Lancer 1 exploit",               test: s => s.stats.promotions >= 1 },
    { id: "cps3",    name: "Clic de papi",       desc: "Atteindre 3 CPS",                test: s => s.stats.peakCps >= 3 },
    { id: "cps5",    name: "Doigts de feu",      desc: "Atteindre 5 CPS",                test: s => s.stats.peakCps >= 5 },
    { id: "cps8",    name: "Casse-tout",         desc: "Faire planter le système",       test: s => s.stats.broke >= 1 },
    { id: "ct1",     name: "Mercenaire",         desc: "Finir 1 contrat",                test: s => s.ch.done.length >= 1 },
    { id: "ctall",   name: "Fixer",              desc: "Finir les 3 contrats",           test: s => s.ch.done.length >= 3 },
    { id: "market",  name: "Marché noir",        desc: "Acheter 1 amélioration",         test: s => s.shop.some(l => l > 0) },
    { id: "inf",     name: "∞",                  desc: "Atteindre l'infini (1.79e308)",  test: s => s.score >= MAX_NUM }
];

// Messages affichés quand le système plante
const BREAK_MESSAGES = [
    "😱 OH LÀ LÀ ! ATTENTION, TU VAS TOUT CASSER !",
    "💥 STOOOP ! Le système va exploser !",
    "🔥 Doucement ! Ça fissure de partout !",
    "⚠️ ALERTE ICE : le pare-feu lâche...",
    "🧨 TU VAS TOUT CASSER, JE TE PRÉVIENS !",
    "🙀 Mais arrête, tout se détraque !"
];

// Lignes de faux piratage dans le terminal
const FAKE_LINES = [
    () => `> nmap -sS 10.${rnd(255)}.${rnd(255)}.${rnd(255)} ... port ${[22, 80, 443, 3389][rnd(4)]} OUVERT`,
    () => `> bruteforce admin@node-${rnd(999)} ... ${rnd(99)}%`,
    () => `> injection payload 0x${rnd(65535).toString(16).toUpperCase()} ... OK`,
    () => `> tunnel TOR ${rnd(9) + 1} sauts ... ping ${rnd(80) + 10}ms`,
    () => `> exfiltration ${rnd(900) + 100}ko -> /dev/null`,
    () => `> crack hash ${rnd(4294967295).toString(16)} ... trouvé`,
    () => `> sudo rm -rf /traces ... effacé`
];

function rnd(n) { return Math.floor(Math.random() * n); }
