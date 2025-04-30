// src/components/responsable/DashboardUser.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboarduser.css'; // style personnalisé
import { Edit, Trash2 } from "lucide-react";

const DashboardUser = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    location: '',
    image: null,
  });
  const [activePage, setActivePage] = useState('home');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const [editBranch, setEditBranch] = useState(null); // branche à éditer
  const [searchTerm, setSearchTerm] = useState('');


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
      // Mise à jour dans l'état local
      const updatedBranches = branches.map(b => b.id === id ? data : b);
      setBranches(updatedBranches);
      setEditBranch(null);
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
    }
  };
  
  const handleDeleteBranch = async (id) => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer cette branche ?");
    if (!confirmDelete) return;
  
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
      console.error(err);
      alert('Erreur : ' + err.message);
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
  
      const text = await response.text(); // lisons la réponse brute
      console.log('Status:', response.status);
      console.log('Réponse brute:', text); // POUR DEBUG
  
      if (!response.ok) throw new Error('Erreur lors de l\'ajout de la branche');
  
      const data = JSON.parse(text); // si tu veux parser quand tout va bien
      alert('Branche ajoutée avec succès');
      setBranches([...branches, data]);
      setShowAddForm(false);
      setNewBranch({ name: '', location: '', image: null });
    } catch (err) {
      console.error('Erreur complète:', err);
      alert(err.message);
    }
  };
  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
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
                <input
  type="text"
  placeholder="Rechercher par nom ou adresse..."
  className="search-bar-branch"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
                {filteredBranches.map((branch) => (
                  <div>
                  <div
                    key={branch.id}
                    className="branch-card-light"
                    
                  >               
                    
                    
                    <div className="card-image">
  <img src={branch.image_path} alt={branch.name} className="card-img"  onClick={() => navigate(`/responsable/branch/${branch.name}`)}/>
  <div className="branch-action">
    <button
      onClick={() => handleDeleteBranch(branch.id)}
      title="Supprimer"
      className="delete-icon"
    >
      <Trash2 size={16} color="#f97316" />
    </button>
    <button
      onClick={() => setEditBranch(branch)}
      title="Modifier"
      className="edit-icon"
    >
      <Edit size={16} color="#7c3aed" />
    </button>
  </div>
  <h4
    className="titlepoint"
   
  >
    {branch.name}<br />RENAULT/DACIA/ALPINE
  </h4>
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
      <h2>Modifier la branche</h2>
      <input
        type="text"
        name="name"
        placeholder="Nom de la branche"
        defaultValue={editBranch.name}
        onChange={(e) => setEditBranch({ ...editBranch, name: e.target.value })}
      />
      <input
        type="text"
        name="location"
        placeholder="Adresse"
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
