import { useState } from "react";
import axios from "axios";

function IngredientInput() {
    interface Recipe {
        id: number;
        name: string;
        instructions: string;
        description: string;
    }

    const [ingredients, setIngredients] = useState<string[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const fetchRecipe = async () => {
        setIsGenerating(true);
        try {
            const response = await axios.get<Recipe[]>(`http://localhost:8080/recipes?ingredients=${ingredients.join(",")}`);
            setRecipes(response.data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const deleteIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div>
                {ingredients.map((ingredient, index) => (
                    <div key={index}>
                        <span>{ingredient}</span>
                        <button onClick={() => deleteIngredient(index)}>X</button>
                    </div>
                ))}
            </div>
            <input 
                type="text" 
                placeholder="Enter ingredient" 
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        setIngredients([...ingredients, (e.target as HTMLInputElement).value]);
                        (e.target as HTMLInputElement).value = "";
                    }
                }} 
            />
            <button onClick={fetchRecipe}>Generate Recipe</button>
            <div>
                {isGenerating ? (
                    <p>Generating...</p>
                ) : recipes.length > 0 ? (
                    recipes.map((recipe) => (
                            <div className="grid grid-cols-3 gap-4 bg-gray-100 rounded-md border border-gray-300 p-2 m-2" key={recipe.id}>
                                <h2>{recipe.name}</h2>
                                <p>Instructions: {recipe.instructions}</p>
                                <p></p>
                                <p>Description: {recipe.description}</p>
                            </div>
                        ))
                ) : (<p>No recipes found</p>) }
            </div>
        </div>
    );
}

export default IngredientInput;