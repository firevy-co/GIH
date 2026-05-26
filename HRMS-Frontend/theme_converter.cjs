const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const regexReplacements = [
    // Backgrounds (Dark to Light)
    { regex: /bg-\[\#0a0a0a\]/g, replacement: 'bg-gray-50' },
    { regex: /bg-\[\#111111\]/g, replacement: 'bg-white' },
    { regex: /bg-\[\#1a1a1a\]/g, replacement: 'bg-white' },
    { regex: /bg-\[\#151515\]/g, replacement: 'bg-gray-50' },
    // Semi-transparent backgrounds
    { regex: /bg-black\/40/g, replacement: 'bg-black/20' },
    { regex: /bg-black\/60/g, replacement: 'bg-black/40' },
    { regex: /bg-black\/70/g, replacement: 'bg-black/50' },
    { regex: /bg-black\/80/g, replacement: 'bg-black/60' },
    { regex: /bg-black\/90/g, replacement: 'bg-black/70' },

    // Borders
    { regex: /border-gray-800/g, replacement: 'border-gray-200' },
    { regex: /border-gray-700/g, replacement: 'border-gray-300' },

    // Text colors
    { regex: /text-white/g, replacement: 'text-gray-900' },
    { regex: /text-gray-200/g, replacement: 'text-gray-800' },
    { regex: /text-gray-300/g, replacement: 'text-gray-700' },
    { regex: /text-gray-400/g, replacement: 'text-gray-600' },
    
    // Hover states
    { regex: /hover:bg-\[\#111111\]/g, replacement: 'hover:bg-gray-50' },
    { regex: /hover:bg-\[\#1a1a1a\]/g, replacement: 'hover:bg-gray-50' },
    { regex: /hover:bg-gray-800\/50/g, replacement: 'hover:bg-gray-100' },
    { regex: /hover:bg-gray-800/g, replacement: 'hover:bg-gray-100' },
    { regex: /hover:bg-gray-700/g, replacement: 'hover:bg-gray-200' },
    { regex: /hover:text-white/g, replacement: 'hover:text-gray-900' },
    { regex: /bg-gray-800/g, replacement: 'bg-gray-100' },

    // Unify primary color (Brand color from logo)
    // Replace hardcoded orange and blue with our new 'brand' token
    { regex: /orange-500/g, replacement: 'brand' },
    { regex: /orange-400/g, replacement: 'brand-hover' },
    { regex: /orange-600/g, replacement: 'brand-hover' },
    
    { regex: /blue-500/g, replacement: 'brand' },
    { regex: /blue-400/g, replacement: 'brand-hover' },
    { regex: /blue-600/g, replacement: 'brand-hover' },
    
    // Shadows
    { regex: /shadow-brand\/10/g, replacement: 'shadow-brand/20' }
];

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            processFile(fullPath);
        }
    });
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    regexReplacements.forEach(r => {
        content = content.replace(r.regex, r.replacement);
    });

    // Special cases
    if (filePath.includes('AuthLayout.jsx')) {
        content = content.replace(/bg-black text-gray-900/g, 'bg-gray-50 text-gray-900'); // it was bg-black text-white, white became gray-900
    }

    if (filePath.includes('Login.jsx') || filePath.includes('Register.jsx')) {
        content = content.replace(/bg-black/g, 'bg-brand');
        content = content.replace(/text-gray-900/g, 'text-white'); // buttons in login might need white text
    }

    // Fix possible double hover issues or conflicting classes
    // e.g., hover:text-gray-900 on buttons where it should be white.
    // For standard brand buttons `bg-brand text-gray-900` should be `bg-brand text-white`.
    content = content.replace(/bg-brand(.*?)text-gray-900/g, 'bg-brand$1text-white');
    content = content.replace(/bg-brand-hover(.*?)text-gray-900/g, 'bg-brand-hover$1text-white');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

processDirectory(srcDir);
console.log("Theme conversion complete.");
