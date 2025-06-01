import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboarduser.css';
import {
  Home,
  Printer,
  Server,
  Droplets,
  LogOut,
  Computer,
  ShoppingCart
} from 'lucide-react';
import logoright from "./assets/logoright.svg";
import logoleft from "./assets/logoleft.svg";
import logo from "./assets/logo1.png"
import CountUp from "react-countup";

const DashboardUser = () => {
  const [activePage, setActivePage] = useState('home');
  const [userName, setUserName] = useState('');
  const [userBranche, setUserBranche] = useState('');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    inventory: 0,
    printers: 0,
    consommables: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name);
      setUserBranche(user.branche || "");
    }

    const token = localStorage.getItem("token");
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/user/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          console.log("Stats reçues:", data);
          setStats(data);
        }
      } catch (err) {
        console.error("Erreur récupération stats user :", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (activePage === 'inventory' || activePage === 'inventory-printer' || activePage === 'consommables') {
      const fetchBranches = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:8000/api/branches', {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });
          const data = await res.json();
          setBranches(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchBranches();
    }
  }, [activePage]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const filteredBranches = branches.filter(branch =>
    branch.name === userBranche &&
    (branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     branch.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

 const renderBranches = (type) => (
  <div className="branches">
    <h2 className="page-title">Votre succursale</h2>
    <div className="search-container">
      <input
        type="text"
        placeholder="Rechercher la succursale ou l'adresse..."
        className="search-bar-branch"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    {loading ? (
      <p>Chargement...</p>
    ) : error ? (
      <p>Erreur : {error}</p>
    ) : (
      <div className="branch-list">
        {filteredBranches.map((branch) => (
          <div key={branch.id} className="branch-card-light">
            <div className="card-image">
              <img
                src={branch.image_path}
                alt={branch.name}
                className="card-img"
                onClick={() =>
                  navigate(
                    type === "printer"
                      ? `/responsable/branch/${branch.name}/printers`
                      : type === "consommables"
                      ? `/user/branch/${branch.name}/consommables`
                      : `/responsable/branch/${branch.name}`
                  )
                }
              />
              <h4 className="titlepoint" onClick={() =>
                  navigate(
                    type === "printer"
                      ? `/responsable/branch/${branch.name}/printers`
                      : type === "consommables"
                      ? `/user/branch/${branch.name}/consommables`
                      : `/responsable/branch/${branch.name}`
                  )
                }>
                {branch.name}<br />RENAULT/DACIA/ALPINE
              </h4>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

  return (
    <>
      <header className="login-header">
        <img src={logoleft} alt="M-AUTOMOTIV" className="header-logo" />
        <img src={logoright} alt="Service Client 2025" className="service-logo" />
      </header>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo-container">
              <img src={logo} alt="zakaria saidi <3" className="sidebar-logo" style={{width:'65%'}} />
            </div>
            <h3 className="sidebar-title">Users Panel</h3>
          </div>

          <nav className="sidebar-nav">
            <button className={activePage === 'home' ? 'active' : ''} onClick={() => setActivePage('home')}>
              <Home size={18} /> <span>Accueil</span>
            </button>
            <button className={activePage === 'inventory' ? 'active' : ''} onClick={() => setActivePage('inventory')}>
              <Server size={18} /> <span>Inventaire PC</span>
            </button>
            <button className={activePage === 'inventory-printer' ? 'active' : ''} onClick={() => setActivePage('inventory-printer')}>
              <Printer size={18} /> <span>Imprimantes</span>
            </button>
            <button className={activePage === 'consommables' ? 'active' : ''} onClick={() => setActivePage('consommables')}>
              <Droplets size={18} /> <span>Consommables</span>
            </button>
          </nav>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </aside>

        <main className="main-content">
          {activePage === 'home' && (
            <div className="home-content">
              <div className="welcome-section">
                <h1>Bienvenue, {userName} 👋</h1>
                <p className="welcome-text">
                  Vous êtes dans votre tableau de bord <span className="highlight-company">M.Automotiv</span>.
                </p>
              </div>

              <div className="stats-overview">
                <h2>Vue d'ensemble</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon inventory">
                      <Computer size={24} />
                    </div>
                    <div className="stat-content">
                      <h3>PC</h3>
                      <div className="stat-value"><CountUp end={stats.inventory} duration={2} /></div>
                      <p className="stat-description">Matériel enregistré</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon printers">
                      <Printer size={24} />
                    </div>
                    <div className="stat-content">
                      <h3>Imprimantes</h3>
                      <div className="stat-value"><CountUp end={stats.printers} duration={2} /></div>
                      <p className="stat-description">Matériel enregistré</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon messages">
                      <Droplets size={24} />
                    </div>
                    <div className="stat-content">
                      <h3>Consommables</h3>
                      <div className="stat-value"><CountUp end={stats.consommables} duration={2} /></div>
                      <p className="stat-description">Éléments suivis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'inventory' && renderBranches("pc")}
          {activePage === 'inventory-printer' && renderBranches("printer")}
          {activePage === 'consommables' && renderBranches("consommables")}
        </main>
      </div>

      <footer className="login-footer">
        <p className="copyright" style={{color: 'white'}}>© {new Date().getFullYear()} M.automotiv. Tous droits réservés. <span>Réaliser par zakariadevpro@gmail.com ;) </span></p>
      </footer>
    </>
  );
};
  
export default DashboardUser;