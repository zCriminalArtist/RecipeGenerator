import { Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import RecipePage from "./pages/RecipePage";

function App() {

  return (
    <>
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipes" element={<RecipePage />} />
      </Routes>
    </div>
  </>
  )
}

export default App
