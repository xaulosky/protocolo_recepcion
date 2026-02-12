
const fs = require('fs');
const path = require('path');

// Read the file content directly since it's an ES6 module and we are in a CommonJS env (simplified approach)
// or just regex parse it to find the objects. 
// standard require/import might fail if package.json is not set for modules.
// I will read the file and eval it in a sandbox or just regex check.
// Actually, I can just use node to require it if I rename it to .mjs or use a wrapper.
// Let's try reading the file and extracting the array.

const filePath = path.join(__dirname, 'js', 'tratamientosData.js');
const fileContent = fs.readFileSync(filePath, 'utf8');

// simplistic extraction of the export
// The file ends with "export const tratamientosData = [ ... ];" or similar.
// It acts as a module.
// I will just look for specific IDs and check if they have personal/insumos in the text.

const targetIDs = [
    'bichectomia',
    'blefaroplastia-quirurgica',
    'blefaroplastia-superior',
    'lifting-cervical',
    'lifting-cejas',
    'otoplastia',
    'lipo-papada',
    'lobuloplastia',
    'injerto-1000uf-zafiro',
    'injerto-1000uf-implanters',
    'injerto-1000uf-pelo-largo',
    'labioplastia-laser'
];

console.log("Verifying enrichment for " + targetIDs.length + " treatments...");

let allPass = true;

targetIDs.forEach(id => {
    // Regex to find the object with this ID
    // Look for id: 'id', ... up to closing brace? balanced braces are hard with regex.
    // simpler: valid JS block? 
    // I'll just check if the file contains the ID followed by personal and insumos within reasonable distance.
    // This is a weak check but sufficient for "did I write it?".

    // Better: Regex for:  id:\s*['"]${id}['"][\s\S]*?personal:\s*\[[\s\S]*?\][\s\S]*?insumos:\s*\[
    // But order might vary.

    // Let's count occurrences of "personal:" and "insumos:"

    const idIndex = fileContent.indexOf(`id: '${id}'`);
    if (idIndex === -1) {
        console.error(`❌ ID NOT FOUND: ${id}`);
        allPass = false;
        return;
    }

    // Isolate the object roughly (next 50 lines?)
    const fragment = fileContent.substring(idIndex, idIndex + 4000); // 4000 chars should cover it
    const nextIdIndex = fragment.indexOf('id: \'', 10);
    const objectChunk = nextIdIndex > -1 ? fragment.substring(0, nextIdIndex) : fragment;

    const hasPersonal = objectChunk.includes('personal: [');
    const hasInsumos = objectChunk.includes('insumos: [');

    if (hasPersonal && hasInsumos) {
        console.log(`✅ ${id}: OK (Found personal & insumos)`);
    } else {
        console.error(`❌ ${id}: FAILED`);
        if (!hasPersonal) console.error(`   - Missing 'personal'`);
        if (!hasInsumos) console.error(`   - Missing 'insumos'`);
        allPass = false;
    }
});

if (allPass) {
    console.log("\nSuccess! All targeted treatments enriched.");
} else {
    console.log("\nSome checks failed.");
    process.exit(1);
}
