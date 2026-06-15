const fs = require('fs');

let content = fs.readFileSync('backend/src/routes/stories.ts', 'utf8');

// Include all relations in the get response so frontend can get member names
content = content.replace(
  "include: { dsus: true }",
  "include: { dsus: true, frontendMember: true, backendMember: true, qaMember: true, authorMember: true }"
);

fs.writeFileSync('backend/src/routes/stories.ts', content);
