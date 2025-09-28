i# TODO: Greatly Improve JobListing Component

## Steps to Complete
- [x] Enhance Card Design: Add placeholder job images, gradient badges for types, better typography, and subtle animations
- [x] Loading States: Replace spinner with skeleton cards for smoother UX
- [x] Interactivity: Add click-to-expand description, smooth scroll to top on filter change, tooltips for actions
- [x] Visual Polish: Teal accents, improved spacing, responsive images, and empty state with illustration
- [x] Pagination: Modern dots/ellipsis for pages >5, loading indicator during page change
- [x] Accessibility: ARIA labels for buttons, keyboard navigation for cards, alt text for images
- [x] Performance: Debounce filter fetches, virtualize list if jobs >20
- [x] Database Images: Use company logos from database instead of placeholder images

## Information Gathered
- Fetches from /api/jobs with filters (search, location, type, salary)
- Uses Card/Badge from shadcn/ui, Lucide icons
- Job type includes id, title, company, location, description, tags, salaryMin/Max, type, createdAt, viewsCount
- Utils: formatSalary, formatDate, handleShare from lib/jobUtils.ts
- Integrates with NextAuth for session-based apply (redirects to sign-in if unauthenticated)
- Grid layout: 1 col mobile, 2-3 desktop; basic hover shadow

## Plan
- Enhance Card Design: Add placeholder job images (via Unsplash or static), gradient badges for types, better typography (larger titles, bold salaries), progress bar for application status if applicable, and subtle animations (fade-in on load, hover lift)
- Loading States: Replace spinner with skeleton cards (3-6 placeholders) for smoother UX
- Interactivity: Add click-to-expand description, smooth scroll to top on filter change, tooltips for actions (share/save/apply)
- Visual Polish: Teal accents (borders, icons, buttons), improved spacing (pb-4 between sections), responsive images (aspect-ratio), and empty state with illustration
- Pagination: Modern dots/ellipsis for pages >5, loading indicator during page change
- Accessibility: ARIA labels for buttons, keyboard navigation for cards, alt text for images
- Performance: Debounce filter fetches, virtualize list if jobs >20 (using react-window if needed)

## Dependent Files to be edited
- components/sections/JobListing.tsx (main changes)
- lib/jobUtils.ts (enhance utils if needed, e.g., add image URL generation)
- types/job.ts (add optional image field to Job type if implementing images)

## Followup steps
- Update TODO.md with progress
- Test: Run dev server, verify fetches, interactions, responsiveness; check console for errors
- If images added, ensure public/uploads/jobs/ exists or use external CDN
