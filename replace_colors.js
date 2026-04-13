const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.vue') || fullPath.endsWith('.scss') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content.replace(/BAKANO-PINK/g, 'BRAND-PRIMARY');
            content = content.replace(/BAKANO-PURPLE/g, 'BRAND-SECONDARY');
            content = content.replace(/BAKANO-GREEN/g, 'BRAND-ACCENT');
            content = content.replace(/BAKANO-DARK/g, 'BRAND-DARK');
            content = content.replace(/bakanoLogo/g, 'brandLogo');
            content = content.replace(/@\/assets\/logos\/logo\.png/g, 'https://assets.cdn.filesafe.space/fy1F7zMSleMO2xTmoE30/media/69b57a89cab7f76d86d38f87.png');
            fs.writeFileSync(fullPath, content);
        }
    }
}

traverse(srcDir);
console.log("Done");
