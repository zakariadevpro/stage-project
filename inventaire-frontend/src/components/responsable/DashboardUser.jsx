// src/components/responsable/DashboardUser.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboarduser.css'; // style personnalisé

const DashboardUser = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    image: null,
  });
  const [activePage, setActivePage] = useState('home');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name);
    }
  }, []);

  useEffect(() => {
    if (activePage === 'inventory') {
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
    formData.append('address', newBranch.address);
    formData.append('image', newBranch.image);
  
    try {
      const response = await fetch('http://localhost:8000/api/branches', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });
  
      const text = await response.text(); // lisons la réponse brute
      console.log('Status:', response.status);
      console.log('Réponse brute:', text); // POUR DEBUG
  
      if (!response.ok) throw new Error('Erreur lors de l\'ajout de la branche');
  
      const data = JSON.parse(text); // si tu veux parser quand tout va bien
      alert('Branche ajoutée avec succès');
      setBranches([...branches, data]);
      setShowAddForm(false);
      setNewBranch({ name: '', address: '', image: null });
    } catch (err) {
      console.error('Erreur complète:', err);
      alert(err.message);
    }
  };
  
  return (
    <div className="dashboard-container-light">
      {/* Sidebar */}
      <aside className="sidebar-light">
        <h2>Utilisateur</h2>
        <button
          className={activePage === 'home' ? 'active' : ''}
          onClick={() => setActivePage('home')}
        >
          Accueil
        </button>
        <button
          className={activePage === 'inventory' ? 'active' : ''}
          onClick={() => setActivePage('inventory')}
        >
          Inventaire PC
        </button>
        <button
          className={activePage === 'new' ? 'active' : ''}
          onClick={() => setActivePage('new')}
        >
          Nouveaux PC
        </button>
      </aside>

      {/* Main content */}
      <main className="main-content-light">
        {activePage === 'home' && (
          <div>
            <h1>Bienvenue </h1>
            <p>
              Bonjour <span className="highlight-orange">{userName}</span>,<br />
              vous êtes dans votre espace utilisateur pour consulter l'inventaire de{" "}
              <span className="highlight-purple">M.Automotiv</span>.
            </p>
          </div>
        )}

        {activePage === 'inventory' && (
          <div>
            <h2>Branches Disponibles</h2>
            {loading ? (
              <p>Chargement...</p>
            ) : error ? (
              <p>Erreur : {error}</p>
            ) : (
              <div className="branch-list">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="branch-card-light"
                    onClick={() => navigate(`/responsable/branch/${branch.name}`)}
                  >
                    <div className="image-content">
                      <div className="card-image">
                        <img src={branch.image_path} alt={branch.name} className="card-img" />
                        <h4 className="titlepoint">{branch.name}<br />RENAULT/DACIA/ALPINE</h4>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Carte Ajouter une branche */}
                <div
                  className="branch-card-light add-branch-card"
                  onClick={() => setShowAddForm(true)}
                >
                  <div className="add-symbol">+</div>
                  <h3>Ajouter une branche</h3>
                </div>
              </div>
            )}
          </div>
        )}

        {showAddForm && (
          <div className="add-branch-form-overlay">
            <form className="add-branch-form" onSubmit={handleAddBranch}>
              <h2>Ajouter une nouvelle branche</h2>
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
                name="address"
                placeholder="Adresse"
                value={newBranch.address}
                onChange={handleInputChange}
                required
              />
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                required
              />
              <div className="form-buttons">
                <button type="submit" className="btn-orange">Ajouter</button>
                <button type="button" className="btn-purple" onClick={() => setShowAddForm(false)}>Annuler</button>
              </div>
            </form>
          </div>
        )}

        {activePage === 'new' && (
          <div>
            <h2>Page Nouveaux PC</h2>
            <p>Cette page sera bientôt disponible...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardUser;
