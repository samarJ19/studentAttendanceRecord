# UI Design Guidelines - Admin Dashboard

## 🎨 Color System

### Background Gradients
```css
/* Primary background */
bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900

/* Card backgrounds */
bg-gradient-to-br from-white/15 via-white/10 to-white/5

/* Section-specific overlays */
from-white/20 via-[color]-500/10 to-[color]-500/15
```

### Tab Color Mapping
- **Users**: `from-blue-600 via-purple-600 to-indigo-700`
- **Branches**: `from-purple-600 via-pink-600 to-rose-700`
- **Courses**: `from-emerald-600 via-teal-600 to-cyan-700`
- **Assignments**: `from-orange-600 via-red-600 to-pink-700`
- **Enrollments**: `from-indigo-600 via-purple-600 to-blue-700`
- **Promotions**: `from-pink-600 via-rose-600 to-purple-700`

## 🌟 Glass Morphism Effects

### Primary Glass Cards
```css
/* Main content cards */
bg-gradient-to-br from-white/15 via-white/10 to-white/5
backdrop-blur-2xl
border border-white/20
shadow-2xl shadow-black/20
```

### Secondary Glass Elements
```css
/* Filter/form sections */
bg-white/10 backdrop-blur-xl
border border-white/20
shadow-lg
```

### Table/Data Containers
```css
bg-white/15 backdrop-blur-xl
border border-white/25
shadow-xl
```

## 🎭 Visual Hierarchy

### Headers & Titles
- **Page titles**: `text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent`
- **Section titles**: `text-2xl font-bold text-white`
- **Descriptions**: `text-white/70` or `text-white/80`

### Icon Containers
```css
/* Active tab icons */
p-4 rounded-3xl bg-gradient-to-r [tab-gradient]
shadow-2xl shadow-[color]-500/25 animate-pulse

/* Section icons */
p-3 bg-gradient-to-r from-[color]-500 to-[color]-600
rounded-2xl shadow-lg shadow-[color]-500/25
```

## 🌈 Background Elements

### Floating Orbs
```css
/* Primary orb */
w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-600/20
rounded-full blur-3xl animate-pulse

/* Secondary orbs */
w-80 h-80 bg-gradient-to-br from-pink-400/25 to-indigo-600/20
animate-pulse delay-1000
```

### Grid Pattern
```css
bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)]
bg-[size:50px_50px] opacity-20
```

## 📏 Spacing & Layout

### Container Structure
- **Main container**: `max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8`
- **Card padding**: `p-8 lg:p-12`
- **Section spacing**: `space-y-10` (sections), `space-y-6` (subsections)

### Border Radius
- **Large cards**: `rounded-3xl`
- **Medium elements**: `rounded-2xl`
- **Small elements**: `rounded-xl`

## ✨ Animation Guidelines

### Entrance Animations
```css
animate-in fade-in-50 duration-500
animate-in slide-in-from-top-2 duration-300
```

### Interactive Elements
```css
animate-pulse (for icons and orbs)
hover:scale-105 transition-transform
```

## 🎯 Component Styling Rules

### Form Sections
- Background: Tab-specific gradient overlay + glass morphism
- Padding: `p-8`
- Border: `border-white/25`
- Shadow: `shadow-xl shadow-[color]-500/10`

### Data Tables
- Background: `bg-white/15 backdrop-blur-xl`
- Border: `border-white/25`
- Container: `overflow-hidden` for rounded corners

### Filter Controls
- Background: `bg-white/10 backdrop-blur-xl`
- Padding: `p-6`
- Border: `border-white/20`

## 🚀 Implementation Notes

1. **Always use backdrop-blur** for glass effects
2. **Layer transparencies** (white/15, white/10, white/5) for depth
3. **Match shadow colors** to section themes
4. **Maintain white text** on dark backgrounds
5. **Use relative z-index** (z-10) for layered elements
6. **Apply consistent border-radius** hierarchy