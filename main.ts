// main.ts - Neo Harbor build entry for make.fun GTA 6 competition
// Build script that copies game/ and screenshots/ to output and writes dossier.json
import { buildDossier } from './vendor/makefun-game.ts';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const repoDir = process.cwd();
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Create output directory
mkdirSync(outputDir, { recursive: true });

// Copy game directory
const gameSrc = join(repoDir, 'game');
const gameDest = join(outputDir, 'game');

// Recursively copy game files
function copyDir(src: string, dest: string): void {
    const entries = readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);
        if (entry.isDirectory()) {
            mkdirSync(destPath, { recursive: true });
            copyDir(srcPath, destPath);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}

copyDir(gameSrc, gameDest);

// Copy screenshots
const shotsSrc = join(repoDir, 'screenshots');
const shotsDest = join(outputDir, 'screenshots');
try {
    mkdirSync(shotsDest, { recursive: true });
    const files = readdirSync(shotsSrc);
    for (const file of files) {
        copyFileSync(join(shotsSrc, file), join(shotsDest, file));
    }
} catch (e) {
    // Screenshots may not exist yet
}

// Write dossier
const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648
});

import { writeFileSync } from 'node:fs';
writeFileSync(join(outputDir, 'dossier.json'), Buffer.from(dossier).toString());

console.log('Build complete: neo-harbor-gta6')