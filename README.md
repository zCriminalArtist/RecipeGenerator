# Smart AI-Powered Recipe Generator

The Smart AI-Powered Recipe Generator is an app where you input available ingredients, and AI generates recipes instantly. It solves the problem where people don’t know what to cook with the ingredients they have. Features include suggested recipes based on available ingredients as well as custom filters (low-calorie, high-protein, vegan, keto, etc). Future development may lead to monetization opportunities in the form of subscription-based enabled features in which users may generate grocery lists based on missing ingredients or one-click online grocery orders via Instacart/Amazon.

## Entities
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

