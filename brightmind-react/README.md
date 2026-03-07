# BrightMind - Online Classes Platform

A modern, responsive React landing page for an online Classes platform, recreating the BrightMind Framer template.

## Features

- ✨ Clean, modern UI with smooth animations
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Built with React + Vite
- 🎨 Styled with Tailwind CSS
- 🧩 Modular component architecture
- 🎯 Smooth hover effects and transitions

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

## Project Structure

```
brightmind-react/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── TeachersSection.jsx
│   │   ├── PartnersSection.jsx
│   │   ├── CategoriesSection.jsx
│   │   ├── CoursesSection.jsx
│   │   ├── StatsSection.jsx
│   │   ├── AboutSection.jsx
│   │   ├── TestimonialsSection.jsx
│   │   ├── FAQSection.jsx
│   │   ├── CTASection.jsx
│   │   └── Footer.jsx
│   ├── data/
│   │   ├── courses.js
│   │   ├── testimonials.js
│   │   └── categories.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── README.md
```

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Components Overview

- **Navbar**: Sticky navigation with logo, menu links, and CTA button
- **Hero**: Large headline, description, dual CTAs, and hero image
- **TeachersSection**: Teacher avatars and quote
- **PartnersSection**: Scrolling partner logos
- **CategoriesSection**: Course category cards with icons
- **CoursesSection**: Featured course cards with ratings, instructor info
- **StatsSection**: Highlight completion rate stat
- **AboutSection**: Platform description with key stats
- **TestimonialsSection**: Student testimonials carousel
- **FAQSection**: Accordion-style FAQ
- **CTASection**: Final call-to-action with visual elements
- **Footer**: Company info, links, contact details, social icons

## Customization

### Colors
Edit the Tailwind config or use custom CSS variables in `index.css`

### Content
Modify data files in `src/data/` to update:
- Course listings
- Testimonials
- Categories
- Partner logos

### Styling
All components use Tailwind utility classes for easy customization

## License

MIT
