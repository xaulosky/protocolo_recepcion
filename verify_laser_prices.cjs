
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'tratamientosData.js');
const fileContent = fs.readFileSync(filePath, 'utf8');

const targetIDs = ['depilacion-laser', 'depilacion-laser-keren'];

console.log("Verifying Laser Pricing Data...");

let allPass = true;

targetIDs.forEach(id => {
    const idIndex = fileContent.indexOf(`id: '${id}'`);
    if (idIndex === -1) {
        console.error(`❌ ID NOT FOUND: ${id}`);
        allPass = false;
        return;
    }

    // Find the start of the object
    const startIndex = idIndex;

    // Scan ahead for the next "id:" or end of file
    const nextIdIndex = fileContent.indexOf('id: \'', startIndex + 10);
    const objectChunk = (nextIdIndex > -1) ? fileContent.substring(startIndex, nextIdIndex) : fileContent.substring(startIndex);

    // Check for zonas
    const hasZonas = objectChunk.includes('zonas: [');
    const hasRostro = objectChunk.includes('Rostro (Packs de 8 Sesiones)');
    const hasCuerpo = objectChunk.includes('Cuerpo - Torso');

    if (hasZonas && hasRostro && hasCuerpo) {
        console.log(`✅ ${id}: OK (Found zones & categories)`);
    } else {
        console.error(`❌ ${id}: FAILED`);
        if (!hasZonas) console.error(`   - Missing 'zonas' field`);
        if (!hasRostro) console.error(`   - Missing 'Rostro' category`);
        if (!hasCuerpo) console.error(`   - Missing 'Cuerpo' category`);
        allPass = false;
    }
});

if (allPass) {
    console.log("\nSuccess! Laser pricing data verified.");
} else {
    console.log("\nVerification failed.");
    process.exit(1);
}
