const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    }
    else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync('./src');

const replacements = [
  { regex: /placeholder="Sanjay Rana"/g, replacement: 'placeholder="e.g. Your Name"' },
  { regex: /placeholder="Enter your full name"/g, replacement: 'placeholder="e.g. Your Name"' },
  { regex: /placeholder="Your Full Name \*"/g, replacement: 'placeholder="e.g. Your Name *"' },
  
  { regex: /placeholder="sanjayrana@gmail\.com"/g, replacement: 'placeholder="e.g. email@example.com"' },
  { regex: /placeholder="sanjay@example\.com"/g, replacement: 'placeholder="e.g. email@example.com"' },
  { regex: /placeholder="Enter your email address"/g, replacement: 'placeholder="e.g. email@example.com"' },
  
  { regex: /placeholder="e\.g\., 021 555 1234"/g, replacement: 'placeholder="0987654321"' },
  { regex: /placeholder="\+64 21 000 0000"/g, replacement: 'placeholder="0987654321"' },
  { regex: /placeholder="e\.g\. 021 123 4567"/g, replacement: 'placeholder="0987654321"' },
  { regex: /placeholder="Enter your phone number"/g, replacement: 'placeholder="0987654321"' },
  { regex: /placeholder="Mobile Number \*"/g, replacement: 'placeholder="0987654321 *"' },
];

let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(r => {
    content = content.replace(r.regex, r.replacement);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log(`Updated placeholders in ${file}`);
  }
});

console.log(`Finished updating placeholders. Total files changed: ${changedCount}`);
