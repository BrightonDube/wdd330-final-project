# 🍽️ Recipe & Nutrition Finder

A responsive web application that helps users discover recipes and view their nutritional information. Built with vanilla JavaScript, HTML5, and CSS3.

## 🌟 Features

- 🔍 Search for recipes by keywords
- 🥗 Filter by dietary preferences (vegetarian, vegan, etc.)
- ❤️ Save favorite recipes
- 📱 Fully responsive design
- 📊 View detailed nutrition information
- 🛒 Add ingredients to shopping list
- 🖨️ Print-friendly recipe pages

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for API calls)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/recipe-nutrition-finder.git
   cd recipe-nutrition-finder
   ```

2. Open `index.html` in your browser

### API Keys

To use the application, you'll need to obtain API keys from:
1. [Edamam API](https://developer.edamam.com/)
2. [Nutritionix API](https://www.nutritionix.com/business/api)

Create a `config.js` file in the `src/scripts` directory with your API keys:

```javascript
// src/scripts/config.js
const CONFIG = {
  EDA_APP_ID: 'YOUR_EDAMAM_APP_ID',
  EDA_APP_KEY: 'YOUR_EDAMAM_APP_KEY',
  NUTRIX_APP_ID: 'YOUR_NUTRITIONIX_APP_ID',
  NUTRIX_APP_KEY: 'YOUR_NUTRITIONIX_APP_KEY'
};

export default CONFIG;
```

## 🛠️ Development

### Project Structure

```
recipe-nutrition-finder/
├── index.html          # Main HTML file
├── src/
│   ├── assets/         # Images, icons, fonts
│   ├── scripts/         # JavaScript files
│   │   ├── api.js       # API integration
│   │   ├── main.js      # Main application logic
│   │   └── storage.js   # Local storage utilities
│   └── styles/          # CSS files
│       ├── main.css     # Main styles
│       └── desktop.css  # Desktop-specific styles
├── DESIGN.md            # Design system documentation
├── prd.md              # Product requirements
└── tasks.md            # Project tasks and roadmap
```

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Edamam API](https://developer.edamam.com/) for recipe data
- [Nutritionix API](https://www.nutritionix.com/) for nutrition data
- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for typography & Nutrition Finder

A simple web application to find recipes and view their nutritional information.

## Features
- Search for recipes
- View recipe details
- See nutritional information
- Save favorite recipes

## Project Structure
```
src/
  ├── styles/     # CSS files
  └── scripts/    # JavaScript files
```

## Setup
1. Clone this repository
2. Open `index.html` in a web browser

## Usage
1. Search for recipes using the search bar
2. Click on a recipe to see details
3. View nutritional information
4. Save your favorite recipes

## Technologies Used
- HTML5
- CSS3
- Vanilla JavaScript
