import React, { useState, useEffect } from "react";
import UsersManagement from "./usersManagement";
import "./dashboard.css";
import ContactRequests from "./ContactRequests";
import logoright from "./assets/logoright.svg"; 
import logoleft from "./assets/logoleft.svg"; 
import CountUp from "react-countup";
import { Home, Users, MessageSquare, LogOut, Server, Building2 } from 'lucide-react';

const Dashboard = () => {
  const [activePage, setActivePage] = useState("home");
  const [adminName, setAdminName] = useState("");

  const [stats, setStats] = useState({
    users: 0,
    messages: 0,
    branches: 0,
    inventory: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setAdminName(user.name);
    }

    const token = localStorage.getItem("token");

    // Fetch unread messages


    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error("Erreur lors de la récupération des statistiques");
        }
      } catch (error) {
        console.error("Erreur réseau lors de la récupération des stats:", error);
      }
    };


    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      <header className="login-header">
        <img src={logoleft} alt="M-AUTOMOTIV" className="header-logo" />
        <img src={logoright} alt="Service Client 2025" className="service-logo" />
      </header>

      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <img 
              src="https://www.m-automotiv.ma/assets/img/packimg/logoleft.svg" 
              alt="M-AUTOMOTIV" 
              className="sidebar-logo"
            />
            <h3 id="navbar header">admin panel</h3>
            
          </div>

          <nav className="sidebar-nav">
            <button
              className={activePage === "home" ? "active" : ""}
              onClick={() => setActivePage("home")}
            >
              <Home size={20} />
              <span>Accueil</span>
            </button>
            
            <button
              className={activePage === "users" ? "active" : ""}
              onClick={() => setActivePage("users")}
            >
              <Users size={20} />
              <span>Gestion des utilisateurs</span>
            </button>
            
            <button
              className={activePage === "contact" ? "active" : ""}
              onClick={() => setActivePage("contact")}
            >
              <MessageSquare size={20} />
              <span>Messages reçus</span>
              {stats.messages > 0 && (
                <span className="notification-badge">{stats.messages}</span>
              )}
            </button>
          </nav>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {activePage === "home" && (
            <div className="home-content">
              <div className="welcome-section">
                <h1>Bienvenue, {adminName} 👋</h1>
                <p className="welcome-text">
                  Vous êtes dans le dashboard administrateur de la plateforme d'inventaire de{" "}
                  <span className="highlight-company">M.Automotiv</span>.
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <Users size={32} />
                  <h3>Utilisateurs Actifs</h3>
                  <div className="stat-value"><CountUp end={stats.users} duration={3} /></div>
                  <p className="stat-description">Utilisateurs enregistrés sur la plateforme</p>
                </div>
                

                <div className="stat-card">
                  <MessageSquare size={32} />
                  <h3>Messages Reçus</h3>
                  <div className="stat-value"><CountUp end={stats.messages} duration={3} /></div>
                  <p className="stat-description">Demandes de réinitialisation reçues</p>
                </div>
                

                <div className="stat-card">
                  <Building2 size={32} />
                  <h3>Succursales</h3>
                  <div className="stat-value"><CountUp end={stats.branches} duration={3} /></div>
                  <p className="stat-description">Points de vente à travers le Maroc</p>
                </div>

                <div className="stat-card">
                  <Server size={32} />
                  <h3>Inventaire Total</h3>
                  <div className="stat-value"><CountUp end={stats.inventory} duration={3} /></div>
                  <p className="stat-description">Équipements enregistrés</p>
                </div>
              </div>

              <div className="quick-actions">
                <h2>Actions Rapides</h2>
                <div className="action-buttons-grid">
                  <button onClick={() => setActivePage("users")}>
                    <Users size={24} />
                    Gérer les Utilisateurs
                  </button>
                  <button onClick={() => setActivePage("contact")}>
                    <MessageSquare size={24} />
                    Voir les Messages
                  </button>
                </div>
              </div>
            </div>
          )}
          {activePage === "users" && <UsersManagement />}
          {activePage === "contact" && <ContactRequests />}
        </main>
      </div>

      <footer className="login-footer">
        <div className="social-links">
          <a href="https://web.facebook.com/M.Automotiv" target="_blank" rel="noopener noreferrer" className="social-link facebook"></a>
          <a href="https://www.linkedin.com/company/m-automotiv" target="_blank" rel="noopener noreferrer" className="social-link linkedin"></a>
          <a href="https://www.youtube.com/@mautomotiv" target="_blank" rel="noopener noreferrer" className="social-link youtube"></a>
          <a href="https://www.instagram.com/m.automotiv.maroc" target="_blank" rel="noopener noreferrer" className="social-link instagram"></a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} M.automotiv. Tous droits réservés.</p>
        <img src="https://m-automotiv.ma/assets/img/packimg/logoleft.svg" alt="M-AUTOMOTIV" className="footer-logo" />
      </footer>
    </>
  );
};

export default Dashboard;
