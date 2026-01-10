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
import AgentProfile from "./pages/AgentProfile";
import ChatPage from "./pages/ChatPage";
import ScrollToTop from "./components/ScrollToTop"; // Добавьте этот импорт
import PrivacyPolicy from './pages/PrivacyPolicy';
import UserAgreement from './pages/UserAgreement';

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

const AppContent: React.FC = () => {
  const location = useLocation();
  
  const noFooterPages = ['/profile', '/create-ad', '/admin', '/chat'];
  
  const showFooter = !noFooterPages.some(page => location.pathname.startsWith(page));

  return (
    <div className="app-wrapper">
      <ScrollToTop /> {/* Добавьте этот компонент здесь */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/house/:id" element={<HouseInfo />} />
          <Route path="/agents/:id" element={<AgentProfile />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
  <Route path="/user-agreement" element={<UserAgreement />} />
          <Route path="/chat/:chatId" element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          } />
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