const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

function convertValue(val, base) {
    const num = parseFloat(val);
    if (num === 0) return '0';
    if (Math.abs(num) === 1 && val.includes('px')) return val; // preserve 1px
    
    let pxVal = num;
    if (val.includes('rem')) pxVal = num * 16;
    
    const vw = (pxVal / base) * 100;
    return vw.toFixed(3).replace(/\.?0+$/, '') + 'vw';
}

function processBlock(text, base) {
    let lines = text.split('\n');
    let out = [];
    for (let line of lines) {
        if (line.match(/border|box-shadow|blur|perspective|translateZ/i)) {
            if (line.includes('border-radius')) {
                 line = line.replace(/(\d+(?:\.\d+)?)(px|rem)/g, (m, p1, p2) => convertValue(m, base));
            }
            out.push(line);
            continue;
        }
        
        // protect clamp limits that might be px/rem but let's just let it be converted to vw
        let newLine = line.replace(/(\d+(?:\.\d+)?)(px|rem)/g, (m, p1, p2) => convertValue(m, base));
        out.push(newLine);
    }
    return out.join('\n');
}

let chunks = css.split(/(@media[^{]+\{)/);
let finalCss = '';
finalCss += processBlock(chunks[0], 1920);

for (let i = 1; i < chunks.length; i += 2) {
    let mediaHeader = chunks[i];
    let content = chunks[i+1] || '';
    
    let base = 1920;
    let match = mediaHeader.match(/max-width:\s*(\d+)px/);
    if (match) base = parseInt(match[1]);
    
    let lastBraceIdx = content.lastIndexOf('}');
    let mediaContent = content.substring(0, lastBraceIdx);
    let afterMedia = content.substring(lastBraceIdx);
    
    finalCss += mediaHeader + processBlock(mediaContent, base) + afterMedia;
}

fs.writeFileSync('style.css', finalCss);
console.log('Conversion complete.');
