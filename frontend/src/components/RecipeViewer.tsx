import axios from "axios";
import { useState } from "react";

const RecipeViewer = () => {

    interface Recipe {
        id: number;
        name: string;
        instructions: string;
        description: string;
        recipeIngredients: RecipeIngredient[];
    }

    interface Ingredient {
        id: number;
        name: string;
        category: string;
    }

    interface RecipeIngredient {
        id: number;
        ingredient: Ingredient;
        quantity: string;
        unit: string;
    }

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchRecipes = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<Recipe[]>(`http://localhost:8080/recipes`);
            setRecipes(response.data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
           
            <button onClick={fetchRecipes}>My Recipes</button>
            <div>
                {isLoading ? (
                    <p>Loading...</p>
                ) : recipes.length > 0 ? (
                    recipes.map((recipe) => (
                        <div className="grid grid-cols-3 gap-4 bg-gray-100 rounded-md border border-gray-300 p-2 m-2" key={recipe.id}>
                            <h2>{recipe.name}</h2>
                            <p>Description: {recipe.description}</p>
                            <p>Ingredients:</p>
                            <ul>
                                {recipe.recipeIngredients.map((recipeIngredient) => (
                                    <li key={recipeIngredient.id}>
                                        {recipeIngredient.ingredient.name} - {recipeIngredient.quantity} {recipeIngredient.unit}
                                    </li>
                                ))}
                            </ul>
                            <p>Instructions: {recipe.instructions}</p>
                        </div>
                    ))
                ) : (
                    <p>No recipes found</p>
                )}
            </div>
        </div>
    );
}

export default RecipeViewer;