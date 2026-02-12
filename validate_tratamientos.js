import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, 'js/tratamientosData.js');
const fileContent = readFileSync(filePath, 'utf8');

try {
    // Evaluate the file content and return the data array
    const data = eval(fileContent + '\n; tratamientosData;');

    console.log(`Loaded ${data.length} treatments.`);

    let missingFieldsCount = 0;
    const missingLog = [];

    data.forEach(t => {
        const requiredFields = ['indicaciones', 'contraindicaciones', 'preTratamiento', 'postTratamiento'];
        const missing = [];

        requiredFields.forEach(field => {
            if (!t[field]) {
                missing.push(field);
            } else if (Array.isArray(t[field]) && t[field].length === 0) {
                missing.push(`${field} (empty array)`);
            }
        });

        if (missing.length > 0) {
            missingLog.push({ id: t.id, name: t.nombre, missing });
            missingFieldsCount++;
        }
    });

    if (missingFieldsCount === 0) {
        console.log("✅ All treatments have valid medical data fields.");
    } else {
        console.log(`❌ Found ${missingFieldsCount} treatments with missing data:`);
        console.log(JSON.stringify(missingLog, null, 2));
    }

} catch (e) {
    console.error("Error evaluating data:", e);
}
