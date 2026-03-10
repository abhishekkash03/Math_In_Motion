import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { FormulaSelection } from "./pages/FormulaSelection";
import { Viewer } from "./pages/Viewer";



;
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