import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { FormulaSelection } from "./pages/FormulaSelection";
import { Viewer } from "./pages/Viewer";
import CircleComplete from "./components/CircleComplete";
import { CircularProgress } from "./components/CircularProgress";


 const handleComplete = () => {
    // Use setTimeout to allow the final frame to render before blocking with alert
    setTimeout(() => {
      alert("Circle completed");
     
    }, 50);
  };
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
       

        <Route path="/formulas" element={<FormulaSelection />} />
        <Route path="/viewer/:formulaId" element={<Viewer />} />
      </Routes>
    </Router>
  );
}