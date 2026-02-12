const fs = require('fs');
const path = require('path');

// Mock DOM elements to run the data files
const window = {
    tratamientosData: [],
    tratamientosProfesionalesData: []
};
global.window = window;

// Read and eval the data files manually as modules
const tratamientosPath = path.join(__dirname, 'js/tratamientosData.js');
const tratamientosProfesionalesPath = path.join(__dirname, 'js/tratamientosProfesionalesData.js');

let tratamientosContent = fs.readFileSync(tratamientosPath, 'utf8');
let tratamientosProfesionalesContent = fs.readFileSync(tratamientosProfesionalesPath, 'utf8');

// Simple EVAL approach (hacky but works for these data files)
// We need to remove 'const' to assign to global/window
eval(tratamientosContent.replace(/const /g, 'window.'));
eval(tratamientosProfesionalesContent.replace(/const /g, 'window.'));

const tratamientosData = window.tratamientosData;
const tratamientosProfesionalesData = window.tratamientosProfesionalesData;

let errors = [];
let success = [];

// 1. Check Depilacion Laser existence and content
const laser = tratamientosData.find(t => t.id === 'depilacion-laser');
if (!laser) {
    errors.push("❌ 'depilacion-laser' not found in tratamientosData.js");
} else {
    success.push("✅ 'depilacion-laser' exists");

    // Check Professionals String
    const expectedProf = 'Keren Matus / María Jesús Contreras / Susana Pereira';
    if (laser.profesional === expectedProf) {
        success.push(`✅ Profesional string correct: "${laser.profesional}"`);
    } else {
        errors.push(`❌ Profesional string mismatch. Expected "${expectedProf}", got "${laser.profesional}"`);
    }

    // Check Zonas
    if (laser.zonas && laser.zonas.length > 0) {
        success.push(`✅ 'depilacion-laser' has ${laser.zonas.length} categories of zones`);
    } else {
        errors.push("❌ 'depilacion-laser' does NOT have 'zonas' defined");
    }
}

// 2. Check Depilacion Laser Keren absence
const laserKeren = tratamientosData.find(t => t.id === 'depilacion-laser-keren');
if (laserKeren) {
    errors.push("❌ 'depilacion-laser-keren' STILL EXISTS (should be deleted)");
} else {
    success.push("✅ 'depilacion-laser-keren' correctly removed");
}

// 3. Check Mappings
// We need to check if mappings exist in tratamientosProfesionalesData
const targetMappings = [
    { p: 'keren-matus', t: 'depilacion-laser' },
    { p: 'maria-jesus-contreras', t: 'depilacion-laser' },
    { p: 'susana-pereira', t: 'depilacion-laser' }
];

targetMappings.forEach(target => {
    const exists = tratamientosProfesionalesData.some(m => m.profesionalId === target.p && m.tratamientoId === target.t);
    if (exists) {
        success.push(`✅ Mapping exists: ${target.p} -> ${target.t}`);
    } else {
        errors.push(`❌ Mapping MISSING: ${target.p} -> ${target.t}`);
    }
});

// 4. Check Duplicate Keren Mappings
const kerenOldMapping = tratamientosProfesionalesData.some(m => m.profesionalId === 'keren-matus' && m.tratamientoId === 'depilacion-laser-keren');
if (kerenOldMapping) {
    errors.push("❌ Old mapping 'keren-matus' -> 'depilacion-laser-keren' still exists");
} else {
    success.push("✅ Old mapping correctly removed from 'tratamientosProfesionalesData.js'");
}

console.log("\nVerification Results:");
success.forEach(s => console.log(s));
if (errors.length > 0) {
    console.error("\nERRORS FOUND:");
    errors.forEach(e => console.error(e));
    process.exit(1);
} else {
    console.log("\n✨ All checks passed!");
    process.exit(0);
}
