const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const baseReplacements = [
    // Borders
    { regex: /border-gray-200/g, replacement: 'border-gray-800' },
    { regex: /border-gray-300/g, replacement: 'border-gray-700' },

    // Text colors
    { regex: /text-gray-900/g, replacement: 'text-white' },
    { regex: /text-gray-800/g, replacement: 'text-gray-200' },
    { regex: /text-gray-700/g, replacement: 'text-gray-300' },
    { regex: /text-gray-600/g, replacement: 'text-gray-400' },
    
    // Hover states
    { regex: /hover:bg-gray-50/g, replacement: 'hover:bg-[#111111]' },
    { regex: /hover:bg-gray-100/g, replacement: 'hover:bg-gray-800' },
    { regex: /hover:bg-gray-200/g, replacement: 'hover:bg-gray-700' },
    { regex: /hover:text-gray-900/g, replacement: 'hover:text-white' },
    { regex: /bg-gray-100/g, replacement: 'bg-gray-800' },

    // Semi-transparent backgrounds
    { regex: /bg-black\/20/g, replacement: 'bg-black/40' },
    { regex: /bg-black\/40/g, replacement: 'bg-black/60' },
    { regex: /bg-black\/50/g, replacement: 'bg-black/70' },
    { regex: /bg-black\/60/g, replacement: 'bg-black/80' },
    { regex: /bg-black\/70/g, replacement: 'bg-black/90' },
    
    // Backgrounds (Light to Dark)
    // Careful with order here
    { regex: /bg-white/g, replacement: 'bg-[#1a1a1a]' },
    { regex: /bg-gray-50/g, replacement: 'bg-[#111111]' },
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

    baseReplacements.forEach(r => {
        content = content.replace(r.regex, r.replacement);
    });

    // Special Layout specific fixes
    if (filePath.includes('StaffLayout') || filePath.includes('AdminLayout')) {
        content = content.replace(/bg-\[\#111111\]/g, 'bg-[#0a0a0a]'); // Outer wrapper usually darker
    }

    // Restore brand colors contextually based on the file path
    let primaryColor = 'blue-500';
    let hoverColor = 'blue-400';
    
    if (filePath.includes('admin') || filePath.includes('user') || filePath.includes('Header') || filePath.includes('Auth') || filePath.includes('Login') || filePath.includes('Register')) {
        primaryColor = 'orange-500';
        hoverColor = 'orange-400';
    }

    content = content.replace(/brand-hover/g, hoverColor);
    content = content.replace(/brand/g, primaryColor);

    // Fix auth screens manually since we replaced 'bg-[#1a1a1a]' for 'bg-white' which was 'bg-black' before
    if (filePath.includes('Login.jsx') || filePath.includes('Register.jsx') || filePath.includes('AuthLayout.jsx')) {
        content = content.replace(/bg-\[\#1a1a1a\]/g, 'bg-black');
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Reverted ${filePath}`);
    }
}

processDirectory(srcDir);
console.log("Theme reversion complete.");
