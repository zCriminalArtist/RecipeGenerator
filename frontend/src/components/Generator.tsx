import { useState } from "react";
import axios from "axios";

function IngredientInput() {
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [recipe, setRecipe] = useState("");

    const fetchRecipe = async () => {
        const response = await axios.get(`http://localhost:8080/recipes?ingredients=${ingredients.join(",")}`);
        setRecipe(response.data);
    };

    return (
        <div>
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
            <pre>{recipe}</pre>
        </div>
    );
}

export default IngredientInput;