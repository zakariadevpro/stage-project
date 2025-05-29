import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboarduser.css';
import { Edit, Trash2, Printer, Home, Server, PlusSquare } from 'lucide-react';
import logoright from "./assets/logoright.svg";
import logoleft from "./assets/logoleft.svg";

const DashboardUser = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', location: '', image: null });
  const [activePage, setActivePage] = useState('home');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [userBranche, setUserBranche] = useState('');
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name);
      setUserBranche(user.branche || "");
    }
  }, []);

  useEffect(() => {
    if (activePage === 'inventory' || activePage === 'inventory-printer') {
      const fetchBranches = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:8000/api/branches', {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });
          if (!res.ok) throw new Error('Erreur lors du chargement des branches');
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
  }, [activePage, showAddForm]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setNewBranch({ ...newBranch, image: files[0] });
    } else {
      setNewBranch({ ...newBranch, [name]: value });
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.name === userBranche &&
    (branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     branch.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderBranches = (type) => (
    <div>
      <h2>Succursale associée</h2>
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
      ) : filteredBranches.length === 0 ? (
        <p>Aucune succursale ne correspond à votre recherche.</p>
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
                        : `/responsable/branch/${branch.name}`
                    )
                  }
                />
                <h4
                  className="titlepoint"
                  onClick={() =>
                    navigate(
                      type === "printer"
                        ? `/responsable/branch/${branch.name}/printers`
                        : `/responsable/branch/${branch.name}`
                    )
                  }
                >
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

      <div className="dashboard-container-light">
        <aside className="sidebar-light">
          <div className="sidebar-header">
            <h2>Inventory Panel</h2>
            <p className="sidebar-role">Utilisateur</p>
          </div>

          <nav className="sidebar-nav">
            <button className={activePage === 'home' ? 'active' : ''} onClick={() => setActivePage('home')}>
              <Home size={20} /> <span>Accueil</span>
            </button>
            <button className={activePage === 'inventory' ? 'active' : ''} onClick={() => setActivePage('inventory')}>
              <Server size={20} /> <span>Inventaire PC</span>
            </button>
            <button className={activePage === 'inventory-printer' ? 'active' : ''} onClick={() => setActivePage('inventory-printer')}>
              <Printer size={20} /> <span>Imprimante</span>
            </button>
          </nav>
        </aside>

        <main className="main-content-light">
          {activePage === 'home' && (
            <div>
              <h1>Bienvenue</h1>
              <p>
                Bonjour <span className="highlight-orange">{userName}</span>,<br />
                vous êtes dans votre espace utilisateur0000 pour consulter l'inventaire de{" "}
                <span className="highlight-purple">M.Automotiv</span>.
              </p>
            </div>
          )}

          {activePage === 'inventory' && renderBranches("pc")}
          {activePage === 'inventory-printer' && renderBranches("printer")}

          {activePage === 'new' && (
            <div>
              <h2>Page Nouveaux PC</h2>
              <p>Cette page sera bientôt disponible...</p>
            </div>
          )}
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

export default DashboardUser;
