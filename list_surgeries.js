import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, 'js/tratamientosData.js');
const fileContent = readFileSync(filePath, 'utf8');

try {
    const data = eval(fileContent + '\n; tratamientosData;');

    // Find unique categories and subcategories
    const cats = {};
    const surgeries = [];

    data.forEach(t => {
        if (!cats[t.categoria]) cats[t.categoria] = new Set();
        cats[t.categoria].add(t.subcategoria);

        // Heuristic for surgeries
        if (t.categoria.includes('Cirugía') || t.subcategoria.includes('Cirugía') || t.categoria === 'Quirúrgico') {
            surgeries.push({
                id: t.id,
                name: t.nombre,
                cat: t.categoria,
                sub: t.subcategoria
            });
        }
    });

    console.log("--- Categories ---");
    for (const c in cats) {
        console.log(`${c}: ${[...cats[c]].join(', ')}`);
    }

    console.log("\n--- Potential Surgeries ---");
    surgeries.forEach(s => console.log(`[${s.id}] ${s.name} (${s.cat} - ${s.sub})`));

} catch (e) {
    console.error(e);
}
