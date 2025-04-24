// src/components/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import UsersManagement from "./usersManagement";
import "./dashboard.css";
import ContactRequests from "./ContactRequests";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("home");
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setAdminName(user.name);
    }
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <button
          className={activePage === "home" ? "active" : ""}
          onClick={() => setActivePage("home")}
        >
          Accueil
        </button>
        <button
          className={activePage === "users" ? "active" : ""}
          onClick={() => setActivePage("users")}
        >
          Gestion des utilisateurs
        </button>
        <button
          className={activePage === "contact" ? "active" : ""}
          onClick={() => setActivePage("contact")}
        >
          Messages reçus
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activePage === "home" && (
          <div>
            <h1>Bienvenue 👋</h1>
            <p>
              Bonjour Monsieur{" "}
              <span className="highlight-orange">{adminName}</span>,<br />
              vous êtes dans le dashboard admin de la plateforme d’inventaire de{" "}
              <span className="highlight-purple">M.Automotiv</span>.
            </p>
          </div>
        )}
        {activePage === "users" && <UsersManagement />}
        {activePage === "contact" && <ContactRequests />}
      </main>
    </div>
  );
};

export default Dashboard;