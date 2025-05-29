import React, { useState, useEffect } from "react";
import UsersManagement from "./usersManagement";
import { useNavigate } from 'react-router-dom';
import "./dashboard.css";
import NouveauPC from "./nouveauxPCS";
import Consomable from "./consomableimprimante";

import ContactRequests from "./ContactRequests";
import logoright from "./assets/logoright.svg";
import logoleft from "./assets/logoleft.svg";
import logo from "./assets/logo1.png"
import { Edit, Trash2, PlusSquare } from 'lucide-react';
import CountUp from "react-countup";
import {
  Home,
  Droplets,
  PrinterCheck,
  Users,
  CirclePlus,
  MessageSquare,
  LogOut,
  Server,
  Building2,
  Activity,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  PieChart,
    Computer,
  Printer,
  Cpu
} from 'lucide-react';

const Dashboard = () => {
  const [activePage, setActivePage] = useState("home");
  const [adminName, setAdminName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBranch, setNewBranch] = useState({ name: '', location: '', image: null });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [editBranch, setEditBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState({
    users: 0,
    messages: 0,
    branches: 0,
    inventory: 0,
    printers: 0,
    newPcs: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setAdminName(user.name);
    }

    const token = localStorage.getItem("token");

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

  useEffect(() => {
    if (activePage === 'inventory' || activePage === 'imprimente') {
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

  const handleAddBranch = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', newBranch.name);
    formData.append('location', newBranch.location);
    if (newBranch.image) {
      formData.append('image', newBranch.image);
    }

    try {
      const response = await fetch('http://localhost:8000/api/branches', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout de la branche');

      const data = await response.json();
      alert('Branche ajoutée avec succès');
      setBranches([...branches, data]);
      setShowAddForm(false);
      setNewBranch({ name: '', location: '', image: null });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette branche ?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/branches/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      setBranches(branches.filter(branch => branch.id !== id));
      alert('Branche supprimée avec succès');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditBranch = async (e, id) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    if (editBranch.name) formData.append('name', editBranch.name);
    if (editBranch.location) formData.append('location', editBranch.location);
    if (editBranch.image instanceof File) formData.append('image', editBranch.image);

    try {
      const response = await fetch(`http://localhost:8000/api/branches/${id}/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erreur de mise à jour");

      alert("Branche modifiée avec succès");
      setBranches(branches.map(b => b.id === id ? data : b));
      setEditBranch(null);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const filteredBranches = branches.filter(branch =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <div className="logo-container">
                <img src={logo} alt="zakaria saidi <3" className="sidebar-logo" style={{width:'65%'}} />
              </div>
              <h3 className="sidebar-title">Admin Panel</h3>
            </div>

            <nav className="sidebar-nav">
              {[
                { id: "home", icon: <Home size={18} />, label: "Accueil" },
                { id: "users", icon: <Users size={18} />, label: "Utilisateurs" },
                { id: "inventory", icon: <Computer size={18} />, label: "Inventaire PC" },
                { id: "new", icon: <ShoppingCart size={18} />, label: "Arrivages PC" },
                { id: "imprimente", icon: <Printer size={18} />, label: "Imprimantes" },
                { id: "consomableimprimente", icon: <Droplets size={18} />, label: "consomable" },
                { id: "contact", icon: <MessageSquare size={18} />, label: "Messages reçus",
                  badge: stats.messages > 0 ? stats.messages : null }
              ].map(item => (
                  <button
                      key={item.id}
                      className={activePage === item.id ? "active" : ""}
                      onClick={() => setActivePage(item.id)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && <span className="notification-badge">{item.badge}</span>}
                  </button>
              ))}
            </nav>

            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={18} />
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
                      Vous êtes dans le dashboard administrateur de la plateforme{" "}
                      <span className="highlight-company">M.Automotiv inventory</span>.
                    </p>
                  </div>

                  <div className="stats-overview">
                    <h2>Vue d'ensemble</h2>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-icon users">
                          <Users size={24} />
                        </div>
                        <div className="stat-content">
                          <h3>Utilisateurs</h3>
                          <div className="stat-value"><CountUp end={stats.users} duration={2} /></div>
                          <p className="stat-description">Comptes actifs</p>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon messages">
                          <MessageSquare size={24} />
                        </div>
                        <div className="stat-content">
                          <h3>Messages</h3>
                          <div className="stat-value"><CountUp end={stats.messages} duration={2} /></div>
                          <p className="stat-description">messages reçues</p>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon branches">
                          <Building2 size={24} />
                        </div>
                        <div className="stat-content">
                          <h3>Succursales</h3>
                          <div className="stat-value"><CountUp end={stats.branches} duration={2} /></div>
                          <p className="stat-description">Sites au Maroc</p>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon inventory">
                          <Computer size={24} />
                        </div>
                        <div className="stat-content">
                          <h3> PC </h3>
                          <div className="stat-value"><CountUp end={stats.inventory} duration={2} /></div>
                          <p className="stat-description">Équipements enregistré</p>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon printers">
                          <Printer size={24} />
                        </div>
                        <div className="stat-content">
                          <h3>Imprimantes</h3>
                          <div className="stat-value"><CountUp end={stats.printers} duration={2} /></div>
                          <p className="stat-description">Équipements enregistré</p>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon new-pcs">
                          <ShoppingCart size={24} />
                        </div>
                        <div className="stat-content">
                          <h3>Arrivage PC</h3>
                          <div className="stat-value"><CountUp end={stats.newPcs} duration={2} /></div>
                          <p className="stat-description">Nouveau Arrivage</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-row">
                    <div className="quick-actions">
                      <h2>Actions Rapides</h2>
                      <div className="action-buttons-grid">
                        <button onClick={() => setActivePage("users")}>
                          <Users size={20} />
                          <span>Gérer les Utilisateurs</span>
                        </button>
                        <button onClick={() => setActivePage("inventory")}>
                          <Computer size={20} />
                          <span>Inventaire PC</span>
                        </button>
                        <button onClick={() => setActivePage("new")}>
                          <ShoppingCart size={20} />
                          <span>Nouveaux PC</span>
                        </button>
                        <button onClick={() => setActivePage("imprimente")}>
                          <Printer size={20} />
                          <span>Imprimantes</span>
                        </button>
                        <button onClick={() => setActivePage("contact")}>
                          <MessageSquare size={20} />
                          <span>Messages</span>
                        </button>
                      </div>
                    </div>

                    <div className="activity-summary">
                      <h2>Activité Récente</h2>
                      <div className="activity-list">
                        <div className="activity-item">
                          <div className="activity-icon">
                            <Server size={18} />
                          </div>
                          <div className="activity-details">
                            <p>Nouveau matériel enregistré</p>
                            <span className="activity-time">Il y a 2 heures</span>
                          </div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-icon">
                            <Users size={18} />
                          </div>
                          <div className="activity-details">
                            <p>Nouvel utilisateur créé</p>
                            <span className="activity-time">Aujourd'hui, 09:45</span>
                          </div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-icon">
                            <AlertTriangle size={18} />
                          </div>
                          <div className="activity-details">
                            <p>Message prioritaire reçu</p>
                            <span className="activity-time">Hier, 16:30</span>
                          </div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-icon">
                            <Printer size={18} />
                          </div>
                          <div className="activity-details">
                            <p>5 nouvelles imprimantes ajoutées</p>
                            <span className="activity-time">19/05/2025</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {activePage === "users" && <UsersManagement />}

            {activePage === 'inventory' && (
                <div className="branches">
                  <h2 className="page-title">Succursales</h2>

                  <div className="search-container">
                    <input
                        type="text"
                        placeholder="Rechercher un Succursales ou une adresse..."
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
                                    onClick={() => navigate(`/admin/branch/${branch.name}`)}
                                />
                                <div className="branch-action">
                                  <button onClick={() => handleDeleteBranch(branch.id)} title="Supprimer">
                                    <Trash2 size={16} color="#f97316" />
                                  </button>
                                  <button onClick={() => setEditBranch(branch)} title="Modifier">
                                    <Edit size={16} color="#7c3aed" />
                                  </button>
                                </div>
                                <h4 onClick={() => navigate(`/admin/branch/${branch.name}`)} className="titlepoint">
                                  {branch.name}<br />RENAULT/DACIA/ALPINE
                                </h4>
                              </div>
                            </div>
                        ))}

                        <div className="branch-card-light add-branch-card" onClick={() => setShowAddForm(true)}>
                          <div className="add-symbol"><CirclePlus size={50}/></div>
                          <h3>Ajouter un Succursales</h3>
                        </div>
                      </div>
                  )}
                </div>
            )}

            {showAddForm && (
                <div className="add-branch-form-overlay">
                  <form className="add-branch-form" onSubmit={handleAddBranch}>
                    <h2>Ajouter un Succursales</h2>
                    <input
                        type="text"
                        name="name"
                        placeholder="Nom de la branche"
                        value={newBranch.name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="location"
                        placeholder="Adresse"
                        value={newBranch.location}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleInputChange}
                    />
                    <div className="form-buttons">
                      <button type="submit" className="btn-orange">Ajouter</button>
                      <button type="button" className="btn-purple" onClick={() => setShowAddForm(false)}>Annuler</button>
                    </div>
                  </form>
                </div>
            )}

            {editBranch && (
                <div className="add-branch-form-overlay">
                  <form className="add-branch-form" onSubmit={(e) => handleEditBranch(e, editBranch.id)}>
                    <h2>Modifier le Succursales</h2>
                    <input
                        type="text"
                        name="name"
                        defaultValue={editBranch.name}
                        onChange={(e) => setEditBranch({ ...editBranch, name: e.target.value })}
                    />
                    <input
                        type="text"
                        name="location"
                        defaultValue={editBranch.location}
                        onChange={(e) => setEditBranch({ ...editBranch, location: e.target.value })}
                    />
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={(e) => setEditBranch({ ...editBranch, image: e.target.files[0] })}
                    />
                    <div className="form-buttons">
                      <button type="submit" className="btn-orange">Enregistrer</button>
                      <button type="button" className="btn-purple" onClick={() => setEditBranch(null)}>Annuler</button>
                    </div>
                  </form>
                </div>
            )}

            {activePage === 'new' && <NouveauPC/>}
            {activePage === 'consomableimprimente' && <Consomable/>}

            {activePage === 'imprimente' && (
                <div className="branches">
                  <h2 className="page-title">Succursales - Imprimantes</h2>

                  <div className="search-container">
                    <input
                        type="text"
                        placeholder="Rechercher un Succursales ou une adresse..."
                        className="search-bar-branch"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {loading ? (
                      <p>Chargement...</p>
                  ) : error ? (
                      <p>{error}</p>
                  ) : (
                      <div className="branch-list">
                        {filteredBranches.map((branch) => (
                            <div key={branch.id} className="branch-card-light">
                              <div className="card-image">
                                <img
                                    src={branch.image_path}
                                    alt={branch.name}
                                    className="card-img"
                                    onClick={() => navigate(`/admin/printer-branch/${branch.name}`)}
                                />
                                <div className="branch-action">
                                  <button onClick={() => handleDeleteBranch(branch.id)} title="Supprimer">
                                    <Trash2 size={16} color="#f97316" />
                                  </button>
                                  <button onClick={() => setEditBranch(branch)} title="Modifier">
                                    <Edit size={16} color="#7c3aed" />
                                  </button>
                                </div>
                                <h4 onClick={() => navigate(`/admin/printer-branch/${branch.name}`)} className="titlepoint">
                                  {branch.name}<br />RENAULT/DACIA/ALPINE
                                </h4>
                              </div>
                            </div>
                        ))}

                        <div className="branch-card-light add-branch-card" onClick={() => setShowAddForm(true)}>
                          <div className="add-symbol"><CirclePlus size={50}/></div>
                          <h3>Ajouter un Succursales</h3>
                        </div>
                      </div>
                  )}

                  {/* Formulaire d'ajout */}
                  {showAddForm && (
                      <div className="add-branch-form-overlay">
                        <form className="add-branch-form" onSubmit={handleAddBranch}>
                          <h2>Ajouter un Succursales</h2>
                          <input
                              type="text"
                              name="name"
                              placeholder="Nom de la branche"
                              value={newBranch.name}
                              onChange={handleInputChange}
                              required
                          />
                          <input
                              type="text"
                              name="location"
                              placeholder="Adresse"
                              value={newBranch.location}
                              onChange={handleInputChange}
                              required
                          />
                          <input
                              type="file"
                              name="image"
                              accept="image/*"
                              onChange={handleInputChange}
                          />
                          <div className="form-buttons">
                            <button type="submit" className="btn-orange">Ajouter</button>
                            <button type="button" className="btn-purple" onClick={() => setShowAddForm(false)}>Annuler</button>
                          </div>
                        </form>
                      </div>
                  )}

                  {/* Formulaire de modification */}
                  {editBranch && (
                      <div className="add-branch-form-overlay">
                        <form className="add-branch-form" onSubmit={(e) => handleEditBranch(e, editBranch.id)}>
                          <h2>Modifier le Succursales</h2>
                          <input
                              type="text"
                              name="name"
                              defaultValue={editBranch.name}
                              onChange={(e) => setEditBranch({ ...editBranch, name: e.target.value })}
                          />
                          <input
                              type="text"
                              name="location"
                              defaultValue={editBranch.location}
                              onChange={(e) => setEditBranch({ ...editBranch, location: e.target.value })}
                          />
                          <input
                              type="file"
                              name="image"
                              accept="image/*"
                              onChange={(e) => setEditBranch({ ...editBranch, image: e.target.files[0] })}
                          />
                          <div className="form-buttons">
                            <button type="submit" className="btn-orange">Enregistrer</button>
                            <button type="button" className="btn-purple" onClick={() => setEditBranch(null)}>Annuler</button>
                          </div>
                        </form>
                      </div>
                  )}
                </div>
            )}

            {activePage === "contact" && <ContactRequests />}
          </main>
        </div>

        <footer className="login-footer">



          <p className="copyright">© {new Date().getFullYear()} M.automotiv. Tous droits réservés.<span> realiser par zakariadevpro@gmail.com ;)</span></p>
        </footer>
      </>
  );
};

export default Dashboard;