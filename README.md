# Smart AI-Powered Recipe Generator

<img src="https://raw.githubusercontent.com/zCriminalArtist/RecipeGenerator/main/frontend/mobile/assets/images/icon.png" width="200" height="200" align="right">

IngrediGo is the smart AI-Powered Recipe Generator app where you input available ingredients, and AI generates recipes instantly. It solves the problem where people don’t know what to cook with the ingredients they have. Features include suggested recipes based on available ingredients as well as custom filters (low-calorie, high-protein, vegan, keto, etc). Future development may lead to monetization opportunities in the form of subscription-based enabled features in which users may generate grocery lists based on missing ingredients or one-click online grocery orders via Instacart/Amazon.

## ✅ Pre-Beta Launch Checklist – IngrediGo AI Recipe App

Before inviting beta testers, ensure the following checklist is complete to provide a smooth and valuable user experience.

---

### 📦 Core Features

- [x] Ingredient input (manual + voice search + barcode scanning if applicable)
- [x] AI recipe generation using selected ingredients
- [x] Save recipes to user account
- [x] View/edit saved ingredients list
- [ ] Responsive design (mobile, tablet, desktop)

---

### 🧪 AI/Backend Functionality

- [x] Model is trained/tested and gives relevant recipe results
- [ ] AI handles edge cases (e.g., 1 or very few ingredients)
- [ ] Rate limiting & timeout handling on AI calls
- [ ] Backend API is secure and protected (e.g., rate limiting, input validation)
- [ ] PostgreSQL database fully seeded and migrated

---

### 🔐 Authentication & Authorization

- [x] User sign up / login (JWT or OAuth)
- [x] Password recovery & email verification
- [x] Stripe integration for 5-day trial + subscription handling

---

### 🧼 UI/UX Polish

- [x] Smooth navigation flow between screens
- [x] Intuitive onboarding tutorial / welcome modal
- [x] Error states (empty input, server error, no recipes found)
- [x] Loading indicators for AI responses
- [x] Visual design is consistent with brand (colors, typography, icons)
- [x] Mobile-first layout tested

---

### 🧪 QA & Testing

- [ ] Unit tests (backend and frontend)
- [ ] End-to-end test cases for core features
- [ ] Bug/issue tracking set up (e.g., GitHub Issues or Jira)
- [ ] Cross-browser compatibility testing (Chrome, Safari, Firefox)
- [x] Mobile OS testing (iOS, Android)

---

### 🚀 Deployment & DevOps

- [x] Frontend deployed (e.g., Vercel, Netlify, Expo for React Native)
- [x] Backend deployed (e.g., Render, AWS, Heroku, Railway)
- [x] Database securely hosted (e.g., Supabase, Neon, PlanetScale)
- [x] CI/CD pipeline in place (e.g., GitHub Actions, Jenkins)
- [x] Environment variables managed securely

---

### 📣 Beta Testing Setup

- [ ] Create & invite beta tester list (email or TestFlight/Play Store)
- [ ] Beta feedback form created (Google Forms, Typeform, etc.)
- [ ] Documentation for testers (README, usage guide)
- [ ] Set up user activity analytics (e.g., LogRocket, Google Analytics, Mixpanel)
- [ ] In-app feedback option or bug report link

---

### 📄 Documentation

- [ ] README includes project overview, features, installation, and contribution guide
- [ ] API documentation available (Postman or Swagger)
- [ ] Changelog created
- [ ] License file added
- [ ] Code of Conduct & Contributing guide included

---


## POJO Relationship Architecture
1. **User**
- Attributes:
  - **id**: Unique identifier for each user.
  - **username**: Username chosen by the user.
  - **password**: Encrypted password.
  - **email**: User's email address.
  - **first_name**: User's first name.
  - **last_name**: User's last name.
  - **phone_number**: User's contact number.
  - **address**: User's address (optional).
  - **preferences**: User preferences (e.g., Dark Mode).
  - **created_at**: Date and time when the account was created.
  - **updated_at**: Date and time when the account was last updated.
2. **Ingredient**
- Attributes:
  - **id**: Unique identifier for each ingredient.
  - **name**: Name of each ingredient.
  - **category**: Category of each ingredient (e.g., proteins, dairy, vegetables).
3. **Recipe**
- Attributes:
  - **id**: Unique identifier for each recipe.
  - **name**: Name of each recipe.
  - **description**: Description of each recipe.
  - **instructions**: Instructions for each recipe.
4. **RecipeIngredient**
- Attributes:
  - **recipe_id**: Unique identifier for each recipe.
  - **ingredient_id**: Unique identifier for each ingredient.
  - **quantity**: The amount of the ingredient in the recipe (e.g., "200", "2", "1/2").
  - **unit**: The measurement unit (e.g., "grams", "cups", "tablespoons").


## User Stories
1. User Registration
- **As a**: New user
- **I want to**: Register an account
- **So that**: I can access the application with my personal credentials.
2. User Login
- **As a**: Registered user
- **I want to**: Log in with my account credentials.
- **So that**: I can access my personalized dashboard and manage my activities.
3. Password Reset
- **As a**: User who has forgotten their password
- **I want to**: Reset my password using my email address.
- **So that**: I can regain access to my account.
4. Recipe Generation
- **As a**: User who has a random variety of ingredients available to them.
- **I want to**: Know what to cook with the ingredients available.
- **So that**: I can save money, be smart, be resourceful, etc.
5. Custom Filters
- **As a**: User 
- **I want to**: Choose from low-calorie, high-protein, vegan, keto recipe options
- **So that**: The generated recipe may suit my preferences.

