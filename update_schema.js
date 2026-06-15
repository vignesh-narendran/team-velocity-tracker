const fs = require('fs');
let content = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

// I notice authorMember relation but not frontendMember, backendMember, qaMember.
// In GanttChart the user was expecting s.frontendMember?.name etc.
// Wait, Gantt chart only uses authorMember because of prisma relation.
content = content.replace('authorMember Member? @relation(fields: [authorId], references: [id])',
  'authorMember Member? @relation("AuthorToStory", fields: [authorId], references: [id])\n  frontendMember Member? @relation("FrontendToStory", fields: [frontendId], references: [id])\n  backendMember Member? @relation("BackendToStory", fields: [backendId], references: [id])\n  qaMember Member? @relation("QaToStory", fields: [qaId], references: [id])');

// update Member model to reflect back references
content = content.replace('stories Story[]', 'stories Story[]\n  authoredStories Story[] @relation("AuthorToStory")\n  frontendStories Story[] @relation("FrontendToStory")\n  backendStories Story[] @relation("BackendToStory")\n  qaStories Story[] @relation("QaToStory")');

fs.writeFileSync('backend/prisma/schema.prisma', content);
