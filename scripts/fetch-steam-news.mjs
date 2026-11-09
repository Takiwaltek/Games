// Génère steam-new.json (nouveautés Steam) pour la page d'accueil.
// Exécuté pendant le déploiement Pages : l'API Steam bloque les requêtes navigateur (CORS).
import { writeFile } from 'node:fs/promises';

const API_URL = 'https://store.steampowered.com/api/featuredcategories/?cc=fr&l=french';
const MAX_ITEMS = 12;
const OUTPUT = new URL('../steam-new.json', import.meta.url);

function formatPrice(item) {
    if (item.final_price === 0) return 'Gratuit';
    if (typeof item.final_price !== 'number') return '';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: item.currency || 'EUR' })
        .format(item.final_price / 100);
}

function toEntry(item) {
    return {
        id: item.id,
        name: item.name,
        image: item.header_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.id}/header.jpg`,
        price: formatPrice(item),
        discount: item.discounted ? item.discount_percent : 0,
        url: `https://store.steampowered.com/app/${item.id}`,
    };
}

async function fetchNewReleases() {
    const response = await fetch(API_URL, { headers: { 'Accept-Language': 'fr-FR' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const items = data?.new_releases?.items ?? [];
    return items.filter((item) => item.type === 0 && item.id && item.name).slice(0, MAX_ITEMS).map(toEntry);
}

const feed = { updated: new Date().toISOString(), items: [] };
try {
    feed.items = await fetchNewReleases();
    console.log(`${feed.items.length} nouveautés Steam récupérées.`);
} catch (error) {
    console.warn(`::warning::Nouveautés Steam indisponibles : ${error.message}`);
}

await writeFile(OUTPUT, JSON.stringify(feed, null, 2) + '\n', 'utf8');
