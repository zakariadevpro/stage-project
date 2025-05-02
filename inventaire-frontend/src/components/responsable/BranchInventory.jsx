import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './branchInventoriy.css';
import logoright from "./assets/logoright.svg"; 
import logoleft from "./assets/logoleft.svg"; 

const BranchInventory = () => {
  const { name } = useParams();
  const [pcs, setPcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editPc, setEditPc] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [etatFilter, setEtatFilter] = useState('');
  const [formData, setFormData] = useState({
    nom_poste: '', num_serie: '', user: '', email: '', service: '', description: '', date_aff: '', etat: '', remarque: ''
  });

  const fetchPcs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/pcs-by-branche/${name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await res.json();
      setPcs(data.pcs || []);
    } catch (err) {
      alert("Erreur lors du chargement des PCs");
      setPcs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPcs();
  }, [name]);

  const filteredPcs = pcs.filter(pc => {
    const searchText = `${pc.nom_poste} ${pc.num_serie} ${pc.user} ${pc.email} ${pc.service}`.toLowerCase();
    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesEtat = etatFilter ? pc.etat.toLowerCase() === etatFilter.toLowerCase() : true;
    return matchesSearch && matchesEtat;
  });
  

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/pcs/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPcs(pcs.filter(pc => pc.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/pcs/${editPc.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      await fetchPcs();
      setEditPc(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/pcs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, branches: name }),
      });
      if (!response.ok) throw new Error('Erreur lors de l\'ajout');
      await fetchPcs();
      setShowAddForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const inputType = (key) => {
    if (key === 'email') return 'email';
    if (key === 'date_aff') return 'date';
    return 'text';
  };

  return <>
    <header className="login-header">
      <img src={logoleft} alt="M-AUTOMOTIV" className="header-logo" />
      <img src={logoright} alt="Service Client 2025" className="service-logo" />
    </header>

    <div className="branch-inventory">
      <h2>Inventaire PCs pour le Succursales : {name}</h2>
      <div className="top-section">
  <div className="add-btn-container">
    <button onClick={() => {
      setFormData({
        nom_poste: '', num_serie: '', user: '', email: '', service: '', description: '', date_aff: '', etat: '', remarque: ''
      });
      setShowAddForm(true);
    }}>Ajouter un PC</button>
  </div>

  <div className="top-bar">
    <div className="search-bar">
      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    <div className="etat-filter">
      <p>Filtrer par état :</p>
      <div className="etat-buttons">
        <button onClick={() => setEtatFilter('Actif')} className={etatFilter === 'Actif' ? 'active' : ''}>Actif</button>
        <button onClick={() => setEtatFilter('Inactif')} className={etatFilter === 'Inactif' ? 'active' : ''}>Inactif</button>
        <button onClick={() => setEtatFilter('Hors service')} className={etatFilter === 'Hors service' ? 'active' : ''}>Hors service</button>
        <button onClick={() => setEtatFilter('')} className={etatFilter === '' ? 'active' : ''}>Tous</button>
      </div>
    </div>
  </div>
</div>



      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nom du poste</th>
              <th>Numéro de série</th>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Service</th>
              <th>Description</th>
              <th>Date d'affectation</th>
              <th>État</th>
              <th>Remarque</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPcs.map((pc, index) => (
              <tr key={pc.id}>
                <td>{index + 1}</td>
                <td>{pc.nom_poste}</td>
                <td>{pc.num_serie}</td>
                <td>{pc.user}</td>
                <td>{pc.email}</td>
                <td>{pc.service}</td>
                <td>{pc.description}</td>
                <td>{pc.date_aff}</td>
                <td>{pc.etat}</td>
                <td>{pc.remarque}</td>
                <td>
                  <button onClick={() => { setEditPc(pc); setFormData(pc); }}>Éditer</button>
                  <button onClick={() => setDeleteTarget(pc)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal suppression */}
      {deleteTarget && (
        <div className="modal">
          <div className="modal-content">
            <p>Confirmer la suppression du PC "{deleteTarget.nom_poste}" ?</p>
            <div className="modal-actions">
              <button onClick={handleDelete}>Confirmer</button>
              <button onClick={() => setDeleteTarget(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal édition */}
      {editPc && (
        <div className="modal">
          <div className="modal-content">
            <h3>Modifier PC</h3>
            <form onSubmit={handleEditSubmit}>
              {Object.keys(formData)
                .filter(key => key !== 'id')
                .map((key) => (
                  <input
                    key={key}
                    name={key}
                    type={inputType(key)}
                    placeholder={key}
                    value={formData[key] || ''}
                    onChange={handleChange}
                    required={key !== 'remarque'}
                  />
              ))}
              <div className="modal-actions">
                <button type="submit">Modifier</button>
                <button type="button" onClick={() => setEditPc(null)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ajout */}
      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Ajouter un PC</h3>
            <form onSubmit={handleAddSubmit}>
              {Object.keys(formData)
                .filter(key => key !== 'id')
                .map((key) => (
                  <input
                    key={key}
                    name={key}
                    type={inputType(key)}
                    placeholder={key}
                    value={formData[key] || ''}
                    onChange={handleChange}
                    required={key !== 'remarque'}
                  />
              ))}
              <div className="modal-actions">
                <button type="submit">Ajouter</button>
                <button type="button" onClick={() => setShowAddForm(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  </>;
};

export default BranchInventory;
