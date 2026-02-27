const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const dirFile = path.join(dir, file);
        const dirent = fs.statSync(dirFile);
        if (dirent.isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else {
            if (dirFile.endsWith('.jsx') || dirFile.endsWith('.css') || dirFile.endsWith('.tsx') || dirFile.endsWith('.ts') || dirFile.endsWith('.js')) {
                filelist.push(dirFile);
            }
        }
    }
    return filelist;
};

const map = {
    // exact hex colors
    '#010409': '#050505',
    '#0a0f1a': '#0f0f11',
    '#080d1a': '#0f0f11',
    '#111827': '#18181b',
    '#1e293b': '#18181b', // Tertiary bg
    '#06b6d4': '#f43f5e', // Cyan -> Rose
    '#14b8a6': '#fb923c', // Teal -> Orange
    '#10b981': '#f97316', // Emerald -> Orange
    '#3b82f6': '#a855f7', // Blue -> Purple
    '#8b5cf6': '#c084fc', // Purple -> Lighter Purple
    '#a855f7': '#c084fc', // Purple -> Lighter Purple
    '#d946ef': '#f472b6', // Fuchsia -> Pink
    '#c084fc': '#f472b6', // Lighter Purple -> Pink
    '#ec4899': '#e11d48', // Pink -> Crimson
    '#f59e0b': '#fbbf24', // Amber -> Yellow/Amber
    '#ef4444': '#e11d48', // Red -> Crimson
    '#22d3ee': '#fb7185', // Text cyan -> Text Rose

    // rgb replacements
    '15, 23, 42': '24, 24, 27',
    '30, 41, 59': '39, 39, 42',
    '6, 182, 212': '244, 63, 94',
    '16, 185, 129': '251, 146, 60',
    '139, 92, 246': '192, 132, 252',
    '245, 158, 11': '251, 191, 36',
    '239, 68, 68': '225, 29, 72',
    '6,182,212': '244,63,94',
};

const files = walkSync(path.join(__dirname, 'src'));

for (const file of files) {
    if (file.endsWith('index.css')) continue; // Skip since we manually updated it

    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    for (const [key, value] of Object.entries(map)) {
        // Regex to match globally
        const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        if (regex.test(content)) {
            content = content.replace(regex, value);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
    }
}
