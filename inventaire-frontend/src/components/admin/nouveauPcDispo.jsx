import  { useState, useEffect } from 'react';
import axios from 'axios';
import CreatableSelect from 'react-select/creatable';
import './nouveauPc.css';
import logoright from "./assets/logoright.svg"; 
import logoleft from "./assets/logoleft.svg"; 
import { Edit,Factory, Trash2, Calendar, Box, Tag, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NouveauPcDispo = () => {
  const [showForm, setShowForm] = useState(false);
  const [pcs, setPcs] = useState([]);
  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    quantite_arrivee: '',
    date_arrivage: '',
    admin_nom: localStorage.getItem('username') || '',
    fournisseur: '',
    disponibilite: 'disponible',
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchPcs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/nouveaux-pcs');
      console.log("PCs récupérés :", response.data);
      setPcs(response.data);
    } catch (err) {
      console.error('Erreur de récupération des PCs:', err);
    }
  };

  useEffect(() => {
    fetchPcs();
  }, []);

  const handleLogoClick = () => navigate('/admin/Dashboard');

  const toggleForm = () => setShowForm(!showForm);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem('token');

    // Ajout ou mise à jour du champ pour forcer sa présence
    const payload = {
      ...formData,
      disponibilite: 'disponible'
    };

    console.log("FormData envoyée :", payload); // pour débug

    let response;

    if (editId) {
      response = await axios.put(`http://localhost:8000/api/nouveaux-pcs/${editId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('PC mis à jour avec succès !');
    } else {
      response = await axios.post('http://localhost:8000/api/nouveaux-pcs', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('PC ajouté avec succès !');
    }

    setFormData({
      marque: '',
      modele: '',
      quantite_arrivee: '',
      date_arrivage: '',
      admin_nom: localStorage.getItem('username') || '',
      fournisseur: '',
      disponibilite: 'disponible',
    });
    setShowForm(false);
    setEditId(null);
    fetchPcs();
  } catch (error) {
    console.error("Erreur de soumission :", error.response?.data || error.message);
    alert('Erreur: ' + (error.response?.data?.message || error.message));
  }
};


  const handleDelete = async (id) => {
    if (window.confirm('Confirmer la suppression de ce PC ?')) {
      try {
        await axios.delete(`http://localhost:8000/api/nouveaux-pcs/${id}`);
        fetchPcs();
      } catch (err) {
        alert('Erreur de suppression');
        console.error(err);
      }
    }
  };

  const handleEdit = (pc) => {
    setFormData({
      marque: pc.marque,
      modele: pc.modele,
      quantite_arrivee: pc.quantite_arrivee,
      date_arrivage: pc.date_arrivage,
      admin_nom: pc.admin_nom,
      fournisseur: pc.fournisseur || '',
      disponibilite:'disponible',
    });
    setEditId(pc.id);
    setShowForm(true);
  };

  const filteredPcs = pcs.filter(pc =>
    pc.disponibilite === 'disponible' && (
      pc.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pc.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pc.admin_nom.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
      <header className="login-header">
        <img src={logoleft} alt="M-AUTOMOTIV" className="header-logo" onClick={handleLogoClick} />
        <img src={logoright} alt="Service Client 2025" className="service-logo" />
      </header>
      <div className="nouveau-pc-container">
        <div className="nouveau-pc-header">
          <h2>Arrivage des nouveaux PC disponible</h2>
          <div className="nouveau-pc-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Rechercher un Arrivage"
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
                <div className="pc-detail">
                  <Tag size={16} />
                  <div>
                    <span className="detail-label">Marque:</span>
                    <span className="detail-value">{pc.marque}</span>
                  </div>
                </div>

                <div className="pc-detail">
                  <Box size={16} />
                  <div>
                    <span className="detail-label">Modèle:</span>
                    <span className="detail-value">{pc.modele}</span>
                  </div>
                </div>

                <div className="pc-detail">
                  <span className="quantity-badge">{pc.quantite_arrivee}</span>
                  <div>
                    <span className="detail-label">Quantité:</span>
                    <span className="detail-value">{pc.quantite_arrivee} unité(s)</span>
                  </div>
                </div>

                <div className="pc-detail">
                  <Calendar size={16} />
                  <div>
                    <span className="detail-label">commande passer le :</span>
                    <span className="detail-value">{pc.date_arrivage}</span>
                  </div>
                </div>

                <div className="pc-detail">
                  <User size={16} />
                  <div>
                    <span className="detail-label">Administrateur:</span>
                    <span className="detail-value">{pc.admin_nom}</span>
                  </div>
                </div>

          {pc.fournisseur && (
  <div className="pc-detail">
    <Factory size={16} />
    <div>
      <span className="detail-label">Fournisseur:</span>
      <span className="detail-value">{pc.fournisseur}</span>
    </div>
  </div>
)}

              </div>
            </div>
          ))}

          <div className="add-pc-card" onClick={toggleForm}>
            <div className="add-symbol">+</div>
            <h3>Ajouter un arrivage</h3>
          </div>
        </div>

        {showForm && (
          <div className="form-overlay">
            <div className="form-container">
              <h3>{editId ? "Modifier PC" : "Nouveau arrivage des PCs"}</h3>
              <form onSubmit={handleSubmit} className="nouveau-pc-form">
                <div className="form-group">
                  <label htmlFor="marque">Marque</label>
                  <input
                    type="text"
                    id="marque"
                    name="marque"
                    value={formData.marque}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modele">Modèle</label>
                  <input
                    type="text"
                    id="modele"
                    name="modele"
                    value={formData.modele}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quantite_arrivee">Quantité</label>
                  <input
                    type="number"
                    id="quantite_arrivee"
                    name="quantite_arrivee"
                    value={formData.quantite_arrivee}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date_arrivage">commende passer le :</label>
                  <input
                    type="date"
                    id="date_arrivage"
                    name="date_arrivage"
                    value={formData.date_arrivage}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admin_nom">Administrateur</label>
                  <CreatableSelect
                    id="admin_nom"
                    isClearable
                    onChange={(selected) =>
                      setFormData({ ...formData, admin_nom: selected ? selected.value : '' })
                    }
                    options={[
                      { value: 'Othman azgui', label: 'Othman azgui' },
                      { value: 'Oussama jaber', label: 'Oussama jaber' },
                    ]}
                    value={formData.admin_nom ? { value: formData.admin_nom, label: formData.admin_nom } : null}
                    className="select-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fournisseur">Fournisseur</label>
                  <input
                    type="text"
                    id="fournisseur"
                    name="fournisseur"
                    value={formData.fournisseur}
                    onChange={handleChange}
                  />
                </div>



                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowForm(false);
                      setEditId(null);
                      setFormData({
                        marque: '',
                        modele: '',
                        quantite_arrivee: '',
                        date_arrivage: '',
                        admin_nom: localStorage.getItem('username') || '',
                        fournisseur: '',
                        disponibilite: 'disponible',
                      });
                    }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="submit-btn">
                    {editId ? "Mettre à jour" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <footer className="login-footer">
        <div className="social-links">
          {/* liens réseaux sociaux ici */}
        </div>
        <p style={{color :'white'}}>© {new Date().getFullYear()} M.automotiv. Tous droits réservés.</p>

      </footer>
    </>
  );
};

export default NouveauPcDispo;
