import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Agents from "./pages/Agents";
import "./App.css";
import AboutPage from "./pages/AboutPage";

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/about" element={<AboutPage />} />
            {/* Можно добавить другие страницы позже */}
            <Route path="*" element={<Home />} /> {/* Fallback на главную */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;