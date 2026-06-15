const fs = require('fs');

let content = fs.readFileSync('backend/src/routes/analytics.ts', 'utf8');

// Update backend team-availability endpoint to check based on start and end dates instead of just proposed end date.
const oldAvailabilityLogic = `    const memberStories = activeStories.filter(s =>
      s.frontendId === member.id || s.backendId === member.id || s.qaId === member.id || s.authorId === member.id
    );

    if (memberStories.length === 0) return { member, status: 'free', color: 'green', allLeaves: member.leaves };

    let endingSoon = false;
    for (const story of memberStories) {
      const targetDate = story.dsus[0] ? new Date(story.dsus[0].targetCompletion) : new Date(story.proposedEnd);
      const daysDiff = (targetDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      if (daysDiff >= 0 && daysDiff <= 2) {
        endingSoon = true;
      }
    }

    if (endingSoon) return { member, status: 'about-to-free', color: 'amber', allLeaves: member.leaves };

    return { member, status: 'busy', color: 'red', allLeaves: member.leaves };`;


const newAvailabilityLogic = `    // Find the specific role dates for this member
    let isBusyToday = false;
    let endingSoon = false;
    let hasFutureWork = false;

    for (const s of activeStories) {
      let mStart, mEnd;
      if (s.frontendId === member.id) { mStart = s.frontendStart; mEnd = s.frontendEnd; }
      else if (s.backendId === member.id) { mStart = s.backendStart; mEnd = s.backendEnd; }
      else if (s.qaId === member.id) { mStart = s.qaStart; mEnd = s.qaEnd; }
      else if (s.authorId === member.id) { mStart = s.authorStart; mEnd = s.authorEnd; }

      if (mStart && mEnd) {
        const start = new Date(mStart);
        const end = new Date(mEnd);

        // Remove time portion for fair daily comparison
        const todayAtMidnight = new Date(today);
        todayAtMidnight.setHours(0,0,0,0);
        const startAtMidnight = new Date(start);
        startAtMidnight.setHours(0,0,0,0);
        const endAtMidnight = new Date(end);
        endAtMidnight.setHours(0,0,0,0);

        if (todayAtMidnight >= startAtMidnight && todayAtMidnight <= endAtMidnight) {
          isBusyToday = true;
          const daysDiff = (endAtMidnight.getTime() - todayAtMidnight.getTime()) / (1000 * 3600 * 24);
          if (daysDiff >= 0 && daysDiff <= 2) {
            endingSoon = true;
          }
        } else if (startAtMidnight > todayAtMidnight) {
          hasFutureWork = true;
        }
      }
    }

    if (isBusyToday) {
      if (endingSoon) return { member, status: 'about-to-free', color: 'amber', allLeaves: member.leaves };
      return { member, status: 'busy', color: 'red', allLeaves: member.leaves };
    }

    // Free today, regardless of past or future assignments
    return { member, status: 'free', color: 'green', allLeaves: member.leaves };`;

content = content.replace(oldAvailabilityLogic, newAvailabilityLogic);

fs.writeFileSync('backend/src/routes/analytics.ts', content);
