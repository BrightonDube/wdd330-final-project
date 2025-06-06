# Design System & Wireframes

## Color Palette
- **Primary**: `#4CAF50` (Fresh Green)
- **Secondary**: `#FF9800` (Warm Orange)
- **Accent**: `#03A9F4` (Light Blue)
- **Neutral**: `#F8F9FA` (Light Gray), `#333333` (Dark Gray)
- **Success**: `#4CAF50`
- **Warning**: `#FFC107`
- **Error**: `#F44336`

## Typography
- **Headings**: 'Poppins', sans-serif
- **Body**: 'Open Sans', sans-serif
- **Base Font Size**: 16px
- **Line Height**: 1.6

## Buttons
```css
.btn {
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-secondary {
  background-color: #FF9800;
  color: white;
}

.btn-accent {
  background-color: #03A9F4;
  color: white;
}
```

## Wireframe Components

### Header
- Logo
- Search bar
- Navigation (Home, Favorites, About)

### Recipe Card
- Image
- Title
- Cooking time
- Calories
- Favorite button
- Tags (vegetarian, gluten-free, etc.)

### Recipe Detail View
- Large image
- Title and basic info
- Ingredients list
- Cooking instructions
- Nutrition facts
- Serving size controls
- Favorite toggle
