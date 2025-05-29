import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatableSelect from 'react-select/creatable';
import './nouveauPc.css';
import logoright from "./assets/logoright.svg";
import logoleft from "./assets/logoleft.svg";
import { Edit, Trash2, Calendar, Box, Tag, User, Factory, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PcCommandes = () => {
  const [pcs, setPcs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    quantite_arrivee: '',
    date_arrivage: '',
    admin_nom: localStorage.getItem('username') || '',
    fournisseur: '',
    disponibilite: 'pas encore disponible',
  });

  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const navigate = useNavigate();

  const fetchPcs = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/nouveaux-pcs');
      setPcs(res.data);
    } catch (err) {
      console.error('Erreur de récupération des PCs:', err);
    }
  };

  useEffect(() => {
    fetchPcs();
  }, []);

  const filteredPcs = pcs.filter(pc =>
    pc.disponibilite === 'pas encore disponible' && (
      pc.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pc.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pc.admin_nom.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const confirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleDelete = (id) => {
    confirm("Confirmer la suppression de ce PC ?", async () => {
      try {
        await axios.delete(`http://localhost:8000/api/nouveaux-pcs/${id}`);
        fetchPcs();
      } catch (err) {
        alert("Erreur lors de la suppression");
        console.error(err);
      }
    });
  };

  const handleDisponible = (pc) => {
    confirm("Passer ce PC en disponible ?", async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8000/api/nouveaux-pcs/${pc.id}`, {
          ...pc,
          disponibilite: 'disponible',
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPcs();
      } catch (err) {
        console.error("Erreur lors de la mise à jour de disponibilité:", err);
        alert("Erreur lors de la mise à jour");
      }
    });
  };

  const handleEdit = (pc) => {
    setFormData({
      marque: pc.marque,
      modele: pc.modele,
      quantite_arrivee: pc.quantite_arrivee,
      date_arrivage: pc.date_arrivage,
      admin_nom: pc.admin_nom,
      fournisseur: pc.fournisseur || '',
      disponibilite: 'pas encore disponible',
    });
    setEditId(pc.id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdminChange = (selected) => {
    setFormData({ ...formData, admin_nom: selected ? selected.value : '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = { ...formData, disponibilite: 'pas encore disponible' };

    try {
      if (editId) {
        await axios.put(`http://localhost:8000/api/nouveaux-pcs/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("PC mis à jour avec succès !");
      } else {
        await axios.post('http://localhost:8000/api/nouveaux-pcs', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("PC ajouté avec succès !");
      }

      fetchPcs();
      setShowForm(false);
      setEditId(null);
      setFormData({
        marque: '',
        modele: '',
        quantite_arrivee: '',
        date_arrivage: '',
        admin_nom: localStorage.getItem('username') || '',
        fournisseur: '',
        disponibilite: 'pas encore disponible',
      });
    } catch (err) {
      console.error(err);
      alert("Erreur : " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <>
      <header className="login-header">
        <img src={logoleft} alt="M-AUTOMOTIV" className="header-logo" onClick={() => navigate('/admin/Dashboard')} />
        <img src={logoright} alt="Service Client 2025" className="service-logo" />
      </header>

      <div className="nouveau-pc-container">
        <div className="nouveau-pc-header">
          <h2>PCs en commande</h2>
          <div className="nouveau-pc-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Rechercher un PC..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="pc-list">
          {filteredPcs.map((pc) => (
            <div key={pc.id} className="pc-card">
              <div className="pc-header">
                <h4>Arrivage {pc.marque}</h4>
                <div className="pc-actions">
                  <button className="edit-btn" onClick={() => handleEdit(pc)} title="Modifier">
                    <Edit size={16} />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(pc.id)} title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="pc-details">
                <div className="pc-detail"><Tag size={16} /><div><span className="detail-label">Marque:</span> <span className="detail-value">{pc.marque}</span></div></div>
                <div className="pc-detail"><Box size={16} /><div><span className="detail-label">Modèle:</span> <span className="detail-value">{pc.modele}</span></div></div>
                <div className="pc-detail"><span className="quantity-badge">{pc.quantite_arrivee}</span><div><span className="detail-label">Quantité:</span> <span className="detail-value">{pc.quantite_arrivee} unité(s)</span></div></div>
                <div className="pc-detail"><Calendar size={16} /><div><span className="detail-label">Date d'arrivage:</span> <span className="detail-value">{pc.date_arrivage}</span></div></div>
                <div className="pc-detail"><User size={16} /><div><span className="detail-label">Administrateur:</span> <span className="detail-value">{pc.admin_nom}</span></div></div>
                {pc.fournisseur && (
                  <div className="pc-detail"><Factory size={16} /><div><span className="detail-label">Fournisseur:</span> <span className="detail-value">{pc.fournisseur}</span></div></div>
                )}
              </div>

              <div className="pc-actions-bottom">
                <button className="submit-btn" onClick={() => handleDisponible(pc)}>
                  <CheckCircle size={16} style={{ marginRight: '6px' }} />
                  PCs arrivée
                </button>
              </div>
            </div>
          ))}

          <div className="add-pc-card" onClick={() => setShowForm(true)}>
            <div className="add-symbol">+</div>
            <h3>Ajouter un arrivage en commande</h3>
          </div>
        </div>

        {showForm && (
          <div className="form-overlay">
            <div className="form-container">
              <h3>{editId ? "Modifier PC" : "Ajouter un PC en attente"}</h3>
              <form onSubmit={handleSubmit} className="nouveau-pc-form">
                <div className="form-group"><label>Marque</label><input type="text" name="marque" value={formData.marque} onChange={handleChange} required /></div>
                <div className="form-group"><label>Modèle</label><input type="text" name="modele" value={formData.modele} onChange={handleChange} required /></div>
                <div className="form-group"><label>Quantité</label><input type="number" name="quantite_arrivee" value={formData.quantite_arrivee} onChange={handleChange} required /></div>
                <div className="form-group"><label>Date d'arrivage</label><input type="date" name="date_arrivage" value={formData.date_arrivage} onChange={handleChange} /></div>
                <div className="form-group"><label>Administrateur</label>
                  <CreatableSelect
                    id="admin_nom"
                    isClearable
                    onChange={handleAdminChange}
                    options={[
                      { value: 'Othman azgui', label: 'Othman azgui' },
                      { value: 'Oussama jaber', label: 'Oussama jaber' },
                    ]}
                    placeholder="Choisir ou ajouter un admin"
                    value={formData.admin_nom ? { value: formData.admin_nom, label: formData.admin_nom } : null}
                    className="select-input"
                  />
                </div>
                <div className="form-group"><label>Fournisseur</label><input type="text" name="fournisseur" value={formData.fournisseur} onChange={handleChange} /></div>
                <div className="form-actions">
                  <button type="submit" className="submit-btn">{editId ? "Mettre à jour" : "Enregistrer"}</button>
                  <button type="button" className="cancel-btn" onClick={() => { setShowForm(false); setEditId(null); }}>Annuler</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showConfirmModal && (
          <div className="form-overlay">
            <div className="confirm-modal">
              <p>{confirmMessage}</p>
              <div className="form-actions">
                
                <button className="submit-btn" onClick={() => {
                  confirmAction();
                  setShowConfirmModal(false);
                }}>Confirmer</button>
                <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>Annuler</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="login-footer">
        <div className="social-links" />
        <p>© {new Date().getFullYear()} M.automotiv. Tous droits réservés.</p>
        
      </footer>
    </>
  );
};

export default PcCommandes;
