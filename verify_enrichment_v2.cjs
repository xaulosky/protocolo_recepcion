
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'tratamientosData.js');
const fileContent = fs.readFileSync(filePath, 'utf8');

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

console.log("Verifying enrichment for treatments...");

let allPass = true;

targetIDs.forEach(id => {
    const idIndex = fileContent.indexOf(`id: '${id}'`);
    if (idIndex === -1) {
        // Try double quotes
        const idIndex2 = fileContent.indexOf(`id: "${id}"`);
        if (idIndex2 === -1) {
            console.error(`❌ ID NOT FOUND: ${id}`);
            // Don't fail immediately, maybe it's a quote issue or structure issue
            allPass = false;
            return;
        }
    }

    // Find the start of the object
    const startIndex = (idIndex !== -1) ? idIndex : fileContent.indexOf(`id: "${id}"`);

    // Scan ahead for the next "id:" or end of file to delimit the object
    // This is a naive parser but works if "id:" is always at the start of a line or standard format
    const nextIdIndex = fileContent.indexOf('id:', startIndex + 10);
    const objectChunk = (nextIdIndex > -1) ? fileContent.substring(startIndex, nextIdIndex) : fileContent.substring(startIndex);

    // Check for personal and insumos in this chunk
    // Use regex to be safer about comments or similar text, but simple includes is fine for now
    const hasPersonal = objectChunk.includes('personal:');
    const hasInsumos = objectChunk.includes('insumos:');

    if (hasPersonal && hasInsumos) {
        console.log(`✅ ${id}: OK`);
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
