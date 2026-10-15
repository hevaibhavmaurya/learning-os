# Learning OS: design notes

## Visual concept: a quiet study desk
The palette is warm and calm: an off-white paper background, deep forest green for the one action that matters, soft sage for verified and "you are here" states, charcoal text, and amber only for things that need attention (attempted, review due, overrides). Rose is used only for gaps. Geist handles the UI. Instrument Serif appears only in page titles, the greeting and a few editorial moments. Borders are hairlines, shadows are faint, and whitespace does most of the grouping. Motion is short and purposeful: a fade when a view changes, a soft pop when you verify a week, and the progress line drawing in.

## Primary UX decisions
- **Six destinations only:** Today, Roadmap, Projects, Library, Content Studio and Progress. Assessments, reviews, gaps, evidence and notes live inside the workflows that create them, not in their own menus.
- **One dominant action per screen.** Today shows a single current-week card whose button changes with your state: Continue learning, Retry with a new unseen task, Finish your evidence, or Review evidence and verify. Everything below it is small and secondary.
- **The week workspace mirrors the 13-hour rhythm:** Overview, Learn, Practise, Build, Verify, Notes. A sticky bar always states the next step.
- **Verify is deliberate.** Scores record an attempt, evidence moves a week to Done, and only an explicit Verify, behind a confirmation checkbox, unlocks the next week. The app never auto-verifies. Done, Verified, Review due and Gap look different everywhere.
- **Locked states explain themselves:** "Opens after Week N is verified". You can read ahead, but every action is disabled. Overrides need typed confirmation, are written to the audit log, and never count as verification.
- **Non-guilt time:** planned versus actual dates are shown as information ("2 weeks later than the guide"), with no streaks and no red deadlines.
- **Projects stay light:** a calm list plus a detail page with milestones, a build log, decisions and the acceptance contract.
- **Library and Studio are real writing spaces:** one-field capture, search, tags, week links and autosave. The editor supports code blocks. Studio keeps separate copy per platform with character counts, and publishing is manual.
- **Mobile:** six-item bottom bar, with the action bar above it.

Keyboard: Ctrl K, 1 to 6, /, arrow keys on tabs, Esc.
