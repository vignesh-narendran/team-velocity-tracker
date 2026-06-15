const fs = require('fs');
let content = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

// The original stories Story[] wasn't mapped, probably it wasn't used or implicitly mapped. Let's remove stories Story[] if it's causing issues, or rename it. Since I added named relations, I need to remove the implicit one.
content = content.replace('stories Story[]\n', '');

fs.writeFileSync('backend/prisma/schema.prisma', content);
