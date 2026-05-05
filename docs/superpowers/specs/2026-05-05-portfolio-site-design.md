# Portfolio Site Design - Woodworking & CAD

## Goal
Get hired by contractors, interior designers, architects, homeowners, and furniture manufacturers by showcasing woodworking projects and CAD/shop drawing skills.

## Site Structure (Multi-Page Static Site)

```
index.html          → Home (hero, intro, featured work)
gallery.html        → Project Gallery (finished piece photos)
drawings.html       → Shop Drawings (embedded PDFs)
about.html          → About/Resume (skills, tools, experience)
contact.html        → Contact (email, phone, inquiry form)
css/style.css       → Shared workshop industrial theme
pdfs/               → CAD drawing PDFs
images/             → Finished piece photos + site assets
```

## Visual Design: Workshop Industrial

**Color Palette:**
- Background: #1a1a1a (dark charcoal)
- Text: #e8dcc8 (warm parchment)
- Accent: #c4956a (warm wood tone)
- Borders: #3a3a3a (subtle dark gray)

**Typography:**
- Headings: 'Oswald', sans-serif (bold, industrial)
- Body: 'Open Sans', sans-serif (clean, readable)

**Key Elements:**
- Navigation: dark bar with wood-tone hover effects
- Cards: dark cards with subtle borders for projects
- PDF viewer: embedded with dark-themed controls
- Buttons: wood-tone background, parchment text

## Page Layouts

### Home (index.html)
- Hero section with name, title ("Woodworker & CAD Designer"), CTA button
- Brief intro paragraph
- 3-4 featured project cards (mix of photos and drawings)
- Quick skills list (CAD software, woodworking tools)

### Gallery (gallery.html)
- Filter bar (Cabinets, Shelves, Custom Pieces, etc.)
- Grid of project cards with photo thumbnail + title + brief description
- Click card → opens lightbox or dedicated project page

### Drawings (drawings.html)
- List of embedded PDF viewers (14 PDF files from Sample of Work folder)
- Each with project name, date, and brief description
- PDFs embedded using `<embed>` or `<iframe>` tags

### About (about.html)
- Your photo or workshop photo
- Background/experience paragraph
- Skills section (CAD: AutoCAD, Fusion 360, etc. | Tools: table saw, CNC, etc.)
- Downloadable resume link

### Contact (contact.html)
- Email, phone, location (city/state)
- Simple HTML/CSS contact form (mailto: link or formspree-style service)

## Technical Approach
- Static HTML/CSS/JS, no build tools
- Shared CSS file for consistent theming
- PDFs embedded directly in drawings.html
- Responsive design (mobile-friendly)
- Free hosting on GitHub Pages or Netlify

## Source Material
- PDF Drawings: `C:\Users\Custom\Documents\Documents & Paperwork\Personal Documents\Woodworking & CAD\Sample of Work\`
- 14 PDF files including cabinets, jig holders, and work samples
- A few photos of finished pieces available
