const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [search, replace] of replacements) {
        // use regex with global flag if search is a string
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, replace);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content);
    }
}

const replacements = [
    ["https://res.cloudinary.com/dpuody0df/image/upload/v1775587085/bakano/logos/bakano-light.png", "https://assets.cdn.filesafe.space/fy1F7zMSleMO2xTmoE30/media/69b57a89cab7f76d86d38f87.png"],
    ["https://metrics.bakano.ec", "https://hellenbermeo.ec"],
    ["metrics.bakano.ec", "hellenbermeo.ec"],
    ["bakano.ec", "hellenbermeo.ec"],
    ["bakano-web", "hellenbermeo-web"],
    ["contacto-web-bakano", "contacto-web-hellenbermeo"],
    ["lreyes@bakano.ec", "info@hellenbermeo.ec"],
    ["dreyes@bakano.ec", "info@hellenbermeo.ec"],
    ["dquimi@bakano.ec", "info@hellenbermeo.ec"],
    ["https://www.linkedin.com/company/bakanoec/posts/?feedView=all", "https://www.instagram.com/hellenbermeo_ec/"],
    ["https://www.instagram.com/bakano.ec/", "https://www.instagram.com/hellenbermeo_ec/"],
    ["https://www.facebook.com/bakano.ec", "https://www.facebook.com/hellenbermeo.ec"],
    ["https://www.tiktok.com/@bakano.ec?lang=en", "https://www.tiktok.com/@hellenbermeo.ec"],
    ["<text x=\"50%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"#ffffff\" font-size=\"48\" font-weight=\"900\" letter-spacing=\"4\">BAKANO</text>", "<text x=\"50%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"#ffffff\" font-size=\"32\" font-weight=\"900\" letter-spacing=\"2\">HELLEN<tspan x=\"50%\" dy=\"1.2em\">BERMEO</tspan></text>"],
    ["colors.$BAKANO-PRIMARY", "colors.$BRAND-PRIMARY"],
    ["colors.$BAKANO-SECONDARY", "colors.$BRAND-SECONDARY"],
    ["colors.$BAKANO-LIGHT", "colors.$BRAND-LIGHT"],
];

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.vue') || fullPath.endsWith('.ts') || fullPath.endsWith('.scss')) {
            replaceInFile(fullPath, replacements);
        }
    }
}

traverse(path.join(__dirname, 'src'));
console.log("Done remaining string replacements");
