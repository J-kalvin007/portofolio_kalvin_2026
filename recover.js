const fs = require('fs');
const logContent = fs.readFileSync('C:\\Users\\jonas\\.gemini\\antigravity\\brain\\4712ced1-05af-4ec9-af24-b21f04a0b57f\\.system_generated\\logs\\overview.txt', 'utf8');

const logs = logContent.split('\n').filter(Boolean).map(JSON.parse);
const userActions = logs.filter(l => l.source === 'USER_EXPLICIT' && l.content && l.content.includes('The following changes were made by the USER'));

let recoveredCount = 0;

userActions.forEach((action, idx) => {
  if (action.content.includes('[diff_block_start]')) {
     const match = action.content.match(/\[diff_block_start\]([\s\S]*?)\[diff_block_end\]/);
     if (match) {
        const diff = match[1];
        const lines = diff.split('\n');
        const originalLines = [];
        for (const line of lines) {
           if (line.startsWith('-')) {
             originalLines.push(line.substring(1));
           } else if (line.startsWith(' ') || line === '') {
             originalLines.push(line.startsWith(' ') ? line.substring(1) : line);
           }
        }
        
        if (originalLines.length > 500 && action.content.includes('page.tsx')) {
           fs.writeFileSync('app/[locale]/page.client.tsx', originalLines.join('\n'));
           console.log('Recovered app/[locale]/page.client.tsx! (' + originalLines.length + ' lines)');
           recoveredCount++;
        }
        if (originalLines.length > 300 && originalLines.length < 500 && action.content.includes('propos') && action.content.includes('page.tsx')) {
           fs.writeFileSync('app/[locale]/propos/page.client.tsx', originalLines.join('\n'));
           console.log('Recovered propos/page.client.tsx! (' + originalLines.length + ' lines)');
           recoveredCount++;
        }
        if (originalLines.length > 300 && originalLines.length < 500 && action.content.includes('contact') && action.content.includes('page.tsx')) {
           fs.writeFileSync('app/[locale]/contact/page.client.tsx', originalLines.join('\n'));
           console.log('Recovered contact/page.client.tsx! (' + originalLines.length + ' lines)');
           recoveredCount++;
        }
     }
  }
});

console.log('Total files recovered: ' + recoveredCount);
