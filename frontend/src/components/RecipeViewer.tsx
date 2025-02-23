import axios from "axios";
import { useState } from "react";
import api from "../utils/api";

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
    const [editedIngredients, setEditedIngredients] = useState<{ [key: number]: { quantity: string; unit: string } }>({});

    const fetchRecipes = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<Recipe[]>(`http://localhost:8080/recipes`);
            setRecipes(response.data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditChange = (id: number, field: string, value: string) => {
        setEditedIngredients((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    const handleUpdate = async (recipeIngredientId: number) => {
        const { quantity, unit } = editedIngredients[recipeIngredientId];
        try {
            await api.put(`http://localhost:8080/recipeIngredients/${recipeIngredientId}`, { quantity, unit });
            // fetchRecipes();
        } catch (error) {
            console.error("Error updating recipe ingredient:", error);
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
                                    <li key={recipeIngredient.id} className="flex items-center space-x-4">
                                        <p>{recipeIngredient.ingredient.name.replace(/\b\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())}</p>
                                        <input
                                            type="text"
                                            value={editedIngredients[recipeIngredient.id]?.quantity || recipeIngredient.quantity}
                                            onChange={(e) => handleEditChange(recipeIngredient.id, "quantity", e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            value={editedIngredients[recipeIngredient.id]?.unit || recipeIngredient.unit}
                                            onChange={(e) => handleEditChange(recipeIngredient.id, "unit", e.target.value)}
                                        />
                                        <button onClick={() => handleUpdate(recipeIngredient.id)}>Update</button>
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