import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import AdminPanel from "./components/AdminPanel";

// Компонент для защиты маршрутов
const PrivateRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (!token) {
    return <Navigate to="/" />;
  }
  
  if (adminOnly && user?.email !== 'admin@gmail.com') {
    return <Navigate to="/profile" />;
  }
  
  return <>{children}</>;
};

// Компонент для определения, нужно ли показывать футер
const AppContent: React.FC = () => {
  const location = useLocation();
  
  // Страницы, на которых НЕ нужно показывать футер
  const noFooterPages = ['/profile', '/create-ad', '/admin']; // Добавьте /admin
  
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
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/create-ad" element={
            <PrivateRoute>
              <CreateAd />
            </PrivateRoute>
          } />
          <Route path="/edit-house/:id" element={
            <PrivateRoute>
              <EditHousePage />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <AdminPanel />
            </PrivateRoute>
          } />
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