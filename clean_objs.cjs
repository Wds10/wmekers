const fs = require('fs');
const path = require('path');

const DEMO_DIR = 'public/demos';

const filesToClean = ['charizard.obj', 'car.obj', 'pistol.obj'];

filesToClean.forEach(file => {
    const p = path.join(DEMO_DIR, file);
    if (fs.existsSync(p)) {
        console.log(`Cleaning ${file}...`);
        const content = fs.readFileSync(p, 'utf8');
        const lines = content.split('\n');
        const cleanLines = lines.filter(line => {
            const t = line.trim();
            // Remove comments, material libs, and blank lines
            return t.length > 0 && !t.startsWith('#') && !t.startsWith('mtllib') && !t.startsWith('usemtl');
        });
        fs.writeFileSync(p, cleanLines.join('\n'));
    }
});
console.log('Done cleaning.');
