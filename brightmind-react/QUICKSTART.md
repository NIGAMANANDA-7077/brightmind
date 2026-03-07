# BrightMind Quick Start Guide

## Installation & Setup

1. **Navigate to the project directory:**
   ```bash
   cd brightmind-react
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## Project Structure Explained

```
src/
├── components/          # All React components
│   ├── Navbar.jsx      # Top navigation with mobile menu
│   ├── Hero.jsx        # Main hero section with CTA
│   ├── TeachersSection.jsx    # Teacher avatars & quote
│   ├── PartnersSection.jsx    # Partner logos grid
│   ├── CategoriesSection.jsx  # Course categories cards
│   ├── CoursesSection.jsx     # Popular courses grid
│   ├── StatsSection.jsx       # Completion rate highlight
│   ├── AboutSection.jsx       # About platform section
│   ├── TestimonialsSection.jsx # Student testimonials
│   ├── FAQSection.jsx         # FAQ accordion
│   ├── CTASection.jsx         # Final call-to-action
│   └── Footer.jsx             # Footer with links
├── data/               # Data files
│   ├── courses.js      # Course listings data
│   ├── testimonials.js # Testimonials data
│   └── categories.js   # Category data
├── App.jsx            # Main app component
├── index.css          # Global styles & Tailwind
└── main.jsx           # React entry point
```

## Key Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Fully responsive navigation with mobile menu

### Animations
- Smooth hover effects on cards
- Fade-in and slide-in animations
- Hover scale effects on buttons
- Carousel transitions

### Component Highlights

**Navbar:**
- Sticky positioning with backdrop blur
- Mobile hamburger menu
- Smooth scroll to sections

**Hero:**
- Two-column layout (text + image)
- Gradient text effects
- Floating stat cards
- Dual CTA buttons

**Courses:**
- Grid layout (1/2/3 columns)
- Rating stars
- Instructor info
- Hover animations

**Testimonials:**
- Carousel with navigation
- Smooth transitions
- Dot indicators

**FAQ:**
- Accordion functionality
- Smooth expand/collapse

## Customization Guide

### Change Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    DEFAULT: '#6366f1', // Change primary color
    dark: '#4f46e5',
  },
  // ... add more colors
}
```

### Update Content

**Courses:** Edit `src/data/courses.js`
**Testimonials:** Edit `src/data/testimonials.js`
**Categories:** Edit `src/data/categories.js`

### Modify Spacing

Global spacing classes in `src/index.css`:
- `.section-padding` - Section vertical padding
- `.container-custom` - Container max-width and padding

### Add New Section

1. Create component in `src/components/`
2. Import in `src/App.jsx`
3. Add to the component tree

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

Preview production build:
```bash
npm run preview
```

## Deployment

The built files in `dist/` can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## Tips

1. **Icons:** Using Lucide React for icons
2. **Images:** Replace Unsplash URLs with your own images
3. **Fonts:** Using Inter from Google Fonts
4. **Colors:** Customize in tailwind.config.js
5. **Mobile Testing:** Use responsive design mode in browser DevTools

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 5173 or use different port
npm run dev -- --port 3000
```

**Styles not updating:**
```bash
# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

**Build errors:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Replace placeholder images with your own
- Update course data with real content
- Add actual navigation links
- Connect contact form
- Add analytics
- Optimize images
- Add SEO meta tags
