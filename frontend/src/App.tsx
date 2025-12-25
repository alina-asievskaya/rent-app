import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Agents from "./pages/Agents";
import "./App.css";
import AboutPage from "./pages/AboutPage";
import Favorites from "./pages/Favorites";
import HouseInfo from "./pages/HouseInfo";
import ProfilePage from "./pages/ProfilePage";
import CreateAd from './pages/CreateAd';
import EditHousePage from './pages/EditHousePage';

// Компонент для определения, нужно ли показывать футер
const AppContent: React.FC = () => {
  const location = useLocation();
  
  // Страницы, на которых НЕ нужно показывать футер
  const noFooterPages = ['/profile', '/create-ad']; // Добавьте сюда другие страницы без футера
  
  // Проверяем, находится ли текущий путь в списке страниц без футера
  const showFooter = !noFooterPages.includes(location.pathname);

  return (
    <div className="app-wrapper">
     
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/house/:id" element={<HouseInfo />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-ad" element={<CreateAd />} />
          <Route path="/edit-house/:id" element={<EditHousePage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;