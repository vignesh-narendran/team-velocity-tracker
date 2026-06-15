const fs = require('fs');

let content = fs.readFileSync('frontend/index.html', 'utf8');
content = content.replace('<title>frontend</title>', '<title>Team Velocity Tracker</title>');
fs.writeFileSync('frontend/index.html', content);
