// Imports
import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Printer, Save, X, Package, Layers, Droplet, Search,Droplets } from "lucide-react";
import { useParams } from "react-router-dom";
import "./InventaireConsommable.css"; // Assurez-vous d'importer le CSS
import logoright from "./assets/logoright.svg"; 
import logoleft from "./assets/logoleft.svg"; 
import { useNavigate } from 'react-router-dom';
// Couleurs toners
const couleurs = [
  { nom: "Cyan", nomChamp: "quantite_toner_cyan", couleur: "#06b6d4", icon: <Droplet size={16} color="#06b6d4" /> },
  { nom: "Magenta", nomChamp: "quantite_toner_magenta", couleur: "#d946ef", icon: <Droplet size={16} color="#d946ef" /> },
  { nom: "Jaune", nomChamp: "quantite_toner_jaune", couleur: "#facc15", icon: <Droplet size={16} color="#facc15" /> },
  { nom: "Noir ", nomChamp: "quantite_toner_noir_couleur", couleur: "#000", icon: <Droplet size={16} color="#000" /> },
];

const tonerTypes = {
  unicolor: "Toner Noir",
  multicolor: "Toner Couleur (CMYK)"
};
  
const API_URL = "http://localhost:8000/api";

const InventaireConsommable = () => {
  const { branchName } = useParams();
  const [hasDrum, setHasDrum] = useState(false);
  const [consommables, setConsommables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [typeToner, setTypeToner] = useState("unicolor");
  const [searchTerm, setSearchTerm] = useState("");

  // Stockage des marques disponibles et des références par marque
  const [marquesDisponibles, setMarquesDisponibles] = useState([]);
  const [referencesParMarque, setReferencesParMarque] = useState({});

  const [marqueSelectionnee, setMarqueSelectionnee] = useState("");
  const [ajoutNouvelleMarque, setAjoutNouvelleMarque] = useState(false);
  const [ajoutNouvelleReference, setAjoutNouvelleReference] = useState(false);
  const [nouvelleMarque, setNouvelleMarque] = useState("");
  const [nouvelleReference, setNouvelleReference] = useState("");

  const initialFormState = {
    marque: "",
    reference: "",
    type_toner: "unicolor", //
    quantite_toner_noir: 0,
    quantite_toner_cyan: 0,
    quantite_toner_magenta: 0,
    quantite_toner_jaune: 0,
    quantite_toner_noir_couleur: 0,
    quantite_drum: 0,
    etat: "disponible",

  };
  const navigate = useNavigate();

  const [form, setForm] = useState(initialFormState);

  const resetForm = () => {
    setForm(initialFormState);
    setMarqueSelectionnee("");
    setTypeToner("unicolor");
    setEditingId(null);
    setAjoutNouvelleMarque(false);
    setAjoutNouvelleReference(false);
    setHasDrum(false);
  };

  const fetchMarquesReferences = async () => {
    try {
      const token = localStorage.getItem("token");

      // Charger toutes les données des consommables pour extraire les marques et références
      const res = await fetch(`${API_URL}/consommables?branche=${branchName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur lors du chargement des marques et références");

      const consommablesData = await res.json();

      // Extraire les marques uniques
      const marques = [...new Set(consommablesData.map(item => item.marque))].filter(Boolean);
      setMarquesDisponibles(marques);

      // Créer un objet avec les références par marque
      const references = marques.reduce((acc, marque) => {
        acc[marque] = [...new Set(
            consommablesData
                .filter(item => item.marque === marque)
                .map(item => item.reference)
        )].filter(Boolean);
        return acc;
      }, {});

      setReferencesParMarque(references);
    } catch (error) {
      console.error("Erreur de chargement des marques et références:", error);
    }
  };
    const handleLogoClick = () => navigate('/admin/Dashboard');

  const fetchConsommables = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/consommables?branche=${branchName}&etat=disponible`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur serveur");

      const data = await res.json();
      setConsommables(data);
    } catch (error) {
      console.error("Erreur de chargement:", error);
      alert("Erreur lors du chargement des consommables.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsommables();
    fetchMarquesReferences();
  }, [branchName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name.startsWith("quantite_") ? parseInt(value, 10) || 0 : value;
    setForm((prev) => ({ ...prev, [name]: processedValue }));
  };
  const getTonerTypeFromData = (item) => {
    // Si le champ type_toner existe, l'utiliser
    if (item.type_toner) {
      return item.type_toner;
    }

    // Sinon, déterminer basé sur les valeurs -1
    // Si quantite_toner_noir est -1, c'est multicolor
    if (item.quantite_toner_noir === -1) {
      return "multicolor";
    }

    // Si les couleurs sont à -1, c'est unicolor
    if (item.quantite_toner_cyan === -1 ||
        item.quantite_toner_magenta === -1 ||
        item.quantite_toner_jaune === -1 ||
        item.quantite_toner_noir_couleur === -1) {
      return "unicolor";
    }

    // Fallback pour les anciennes données
    return item.quantite_toner_noir > 0 ? "unicolor" : "multicolor";
  };

  const handleEdit = (item) => {
    // Déterminer le type de toner basé sur les valeurs -1
    const tonerType = getTonerTypeFromData(item);

    setForm({
      marque: item.marque,
      reference: item.reference,
      type_toner: tonerType,
      quantite_toner_noir: item.quantite_toner_noir === -1 ? 0 : item.quantite_toner_noir,
      quantite_toner_cyan: item.quantite_toner_cyan === -1 ? 0 : item.quantite_toner_cyan,
      quantite_toner_magenta: item.quantite_toner_magenta === -1 ? 0 : item.quantite_toner_magenta,
      quantite_toner_jaune: item.quantite_toner_jaune === -1 ? 0 : item.quantite_toner_jaune,
      quantite_toner_noir_couleur: item.quantite_toner_noir_couleur === -1 ? 0 : item.quantite_toner_noir_couleur,
      quantite_drum: item.quantite_drum === -1 ? 0 : (item.quantite_drum || 0),
      etat: item.etat,
    });
    setMarqueSelectionnee(item.marque);
    setTypeToner(tonerType);
    setEditingId(item.id);
    setHasDrum(item.quantite_drum !== -1 && item.quantite_drum !== null && item.quantite_drum !== undefined);
    setShowModal(true);
  };


// 1. MODIFIER la fonction handleSubmit pour gérer les valeurs -1
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation basique
    if (!form.marque || !form.reference) {
      alert("Marque et référence sont obligatoires");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = { ...form };
    formData.type_toner = typeToner;

    // NOUVELLE LOGIQUE : Assigner -1 aux champs non utilisés
    if (typeToner === "unicolor") {
      // Pour unicolor : les couleurs prennent -1
      formData.quantite_toner_cyan = -1;
      formData.quantite_toner_magenta = -1;
      formData.quantite_toner_jaune = -1;
      formData.quantite_toner_noir_couleur = -1;
      // quantite_toner_noir garde sa valeur
    } else {
      // Pour multicolor : le toner noir unicolor prend -1
      formData.quantite_toner_noir = -1;
      // Les couleurs gardent leurs valeurs
    }

    // Gestion du drum : si pas coché, mettre -1 au lieu de null
    if (!hasDrum) {
      formData.quantite_drum = -1;
    } else {
      // S'assurer que la quantité drum est bien définie
      formData.quantite_drum = form.quantite_drum || 0;
    }

    const payload = { ...formData, branche: branchName };

    const url = editingId
        ? `${API_URL}/consommables/${editingId}`
        : `${API_URL}/consommables`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");

      resetForm();
      setShowModal(false);
      fetchConsommables();
      fetchMarquesReferences();

      // Notification de succès
      const successMessage = document.createElement("div");
      successMessage.className = "notification success";
      successMessage.textContent = editingId ? "Consommable modifié avec succès" : "Consommable ajouté avec succès";
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);

    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur : " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce consommable ?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/consommables/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      fetchConsommables();
      fetchMarquesReferences(); // Rafraîchir les marques et références après suppression

      // Notification de succès
      const successMessage = document.createElement("div");
      successMessage.className = "notification success";
      successMessage.textContent = "Consommable supprimé avec succès";
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);

    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors de la suppression: " + err.message);
    }
  };

  const ajouterNouvelleMarque = async () => {
    if (!nouvelleMarque.trim()) {
      alert("Veuillez entrer un nom de marque");
      return;
    }

    // Vérifier si la marque existe déjà
    if (marquesDisponibles.includes(nouvelleMarque)) {
      alert("Cette marque existe déjà");
      return;
    }

    // Ajouter la nouvelle marque à la liste
    setMarquesDisponibles(prev => [...prev, nouvelleMarque]);
    setReferencesParMarque(prev => ({
      ...prev,
      [nouvelleMarque]: [],
    }));

    // Sélectionner la nouvelle marque
    setMarqueSelectionnee(nouvelleMarque);
    setForm(f => ({ ...f, marque: nouvelleMarque }));
    setNouvelleMarque("");
    setAjoutNouvelleMarque(false);
  };

  const ajouterNouvelleReference = async () => {
    if (!nouvelleReference.trim()) {
      alert("Veuillez entrer une référence");
      return;
    }

    // Vérifier si la référence existe déjà pour cette marque
    if (referencesParMarque[marqueSelectionnee]?.includes(nouvelleReference)) {
      alert("Cette référence existe déjà pour cette marque");
      return;
    }

    // Ajouter la nouvelle référence à la liste
    setReferencesParMarque(prev => ({
      ...prev,
      [marqueSelectionnee]: [...(prev[marqueSelectionnee] || []), nouvelleReference],
    }));

    // Sélectionner la nouvelle référence
    setForm(f => ({ ...f, reference: nouvelleReference }));
    setNouvelleReference("");
    setAjoutNouvelleReference(false);
  };

  // Supprimer une référence (uniquement de l'interface, pas de la base de données)
  const supprimerReference = (reference) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la référence "${reference}" ?`)) {
      setReferencesParMarque(prev => ({
        ...prev,
        [marqueSelectionnee]: prev[marqueSelectionnee].filter(ref => ref !== reference)
      }));

      // Réinitialiser la référence si celle supprimée était sélectionnée
      if (form.reference === reference) {
        setForm(prev => ({ ...prev, reference: "" }));
      }

      // Afficher une notification
      const successMessage = document.createElement("div");
      successMessage.className = "notification success";
      successMessage.textContent = `Référence "${reference}" supprimée`;
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    }
  };

  // Filtrer les consommables selon la recherche
  const filteredConsommables = searchTerm.trim()
      ? consommables.filter(item =>
          item.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.reference.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : consommables;

  // Fonction pour déterminer le type de toner d'un item (pour la compatibilité avec les anciennes données)
  const getTonerType = (item) => {
    return getTonerTypeFromData(item);
  };

  return (<>
  <header className="login-header" style={{ marginBottom: '2rem' }}>
          <img src={logoleft} alt="M-AUTOMOTIV" className="header-logo" onClick={handleLogoClick} />
          <img src={logoright} alt="Service Client 2025" className="service-logo" />
        </header>
      <div className="inventaire-consommable">
        <header className="page-header">
          <h2 className="page-title">
            <Printer size={24} className="header-icon" />
            Inventaire Consommables - {branchName}
          </h2>
          <button
              className="btn btn-primary"
              onClick={() => { setShowModal(true); resetForm(); }}
          >
            <Plus size={16} /> Ajouter un consommable
          </button>
        </header>

        <div className="search-bar">
          <div className="search-input-container">
            <Search size={18} className="search-icon" />
            <input
                type="text"
                placeholder="                    Rechercher par marque ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
            {searchTerm && (
                <button
                    className="search-clear"
                    onClick={() => setSearchTerm('')}
                    title="Effacer la recherche"
                >
                  <X size={16} />
                </button>
            )}
          </div>
          <div className="search-results">
            {searchTerm && `${filteredConsommables.length} résultat(s)`}
          </div>
        </div>

        {/* Modal de formulaire */}
        {showModal && (
            <div className="modal-backdrop" onClick={() => { setShowModal(false); resetForm(); }}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">
                    {editingId ? (
                        <>
                          <Edit size={20} color="#6366f1" /> Modifier le consommable
                        </>
                    ) : (
                        <>
                          <Plus size={20} color="#6366f1" /> Ajouter un consommable
                        </>
                    )}
                  </h3>
                  <button
                      className="modal-close"
                      onClick={() => { setShowModal(false); resetForm(); }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body">
                  <form className="consommable-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                      <h4 className="section-title">
                        <Package size={18} /> Informations générales
                      </h4>

                      <div className="form-group">
                        <label className="form-label">Marque :</label>
                        <div className="marque-selection">
                          {marquesDisponibles.map((marque) => (
                              <div key={marque} className="chip-container">
                                <button
                                    type="button"
                                    onClick={() => {
                                      setMarqueSelectionnee(marque);
                                      setForm((f) => ({ ...f, marque, reference: "" })); // Réinitialiser la référence
                                    }}
                                    className={`chip ${form.marque === marque ? "chip-active" : ""}`}
                                >
                                  {marque}
                                </button>
                              </div>
                          ))}
                          <button
                              type="button"
                              className="chip chip-add"
                              onClick={() => setAjoutNouvelleMarque(true)}
                          >
                            <Plus size={14} /> Nouvelle marque
                          </button>
                        </div>

                        {ajoutNouvelleMarque && (
                            <div className="form-group-inline">
                              <div className="input-with-button">
                                <input
                                    type="text"
                                    value={nouvelleMarque}
                                    onChange={(e) => setNouvelleMarque(e.target.value)}
                                    placeholder="Nom de la nouvelle marque"
                                    className="form-input"
                                    autoFocus
                                />
                                <div className="input-buttons">
                                  <button
                                      type="button"
                                      className="btn btn-sm btn-success"
                                      onClick={ajouterNouvelleMarque}
                                      title="Ajouter cette marque"
                                  >
                                    <Save size={14} />
                                  </button>
                                  <button
                                      type="button"
                                      className="btn btn-sm btn-danger"
                                      onClick={() => setAjoutNouvelleMarque(false)}
                                      title="Annuler"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                        )}
                      </div>

                      {marqueSelectionnee && (
                          <div className="form-group">
                            <label className="form-label">Référence :</label>
                            <div className="marque-selection">
                              {(referencesParMarque[marqueSelectionnee] || []).map((ref) => (
                                  <div key={ref} className="chip-container">
                                    <button
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, reference: ref }))}
                                        className={`chip ${form.reference === ref ? "chip-active" : ""}`}
                                    >
                                      {ref}
                                    </button>
                                  </div>
                              ))}
                              <button
                                  type="button"
                                  className="chip chip-add"
                                  onClick={() => setAjoutNouvelleReference(true)}
                              >
                                <Plus size={14} /> Nouvelle référence
                              </button>
                            </div>

                            {ajoutNouvelleReference && (
                                <div className="form-group-inline">
                                  <div className="input-with-button">
                                    <input
                                        type="text"
                                        value={nouvelleReference}
                                        onChange={(e) => setNouvelleReference(e.target.value)}
                                        placeholder="Nouvelle référence"
                                        className="form-input"
                                        autoFocus
                                    />
                                    <div className="input-buttons">
                                      <button
                                          type="button"
                                          className="btn btn-sm btn-success"
                                          onClick={ajouterNouvelleReference}
                                          title="Ajouter cette référence"
                                      >
                                        <Save size={14} />
                                      </button>
                                      <button
                                          type="button"
                                          className="btn btn-sm btn-danger"
                                          onClick={() => setAjoutNouvelleReference(false)}
                                          title="Annuler"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                            )}
                          </div>
                      )}
                    </div>

                    <div className="form-section">
                      <h4 className="section-title">
                        <Layers size={18} /> Inventaire
                      </h4>

                      <div className="form-group">
                        <div className="drum-checkbox-container"><span className="checkbox-text"> Drum :</span>
                          <label className="checkbox-label">
                            <input style={ { margintop:'50px',  width: '10px',
                              height: '10px'}}
                                type="checkbox"
                                checked={hasDrum}
                                onChange={(e) => setHasDrum(e.target.checked)}
                                className="drum-checkbox"
                            />
                          </label>
                        </div>

                        {hasDrum && (
                            <div className="drum-quantity-container">
                              <label className="form-label">
                                <Layers size={16} className="input-icon" />
                                Quantité Drum :
                              </label>
                              <div className="quantity-input">
                                <button
                                    type="button"
                                    className="quantity-btn"
                                    onClick={() => setForm(prev => ({
                                      ...prev,
                                      quantite_drum: Math.max(0, prev.quantite_drum - 1)
                                    }))}
                                    disabled={form.quantite_drum <= 0}
                                >
                                  -
                                </button>
                                <input
                                    type="number"
                                    name="quantite_drum"
                                    value={form.quantite_drum}
                                    onChange={handleChange}
                                    className="quantity-value"
                                    min="0"
                                />
                                <button
                                    type="button"
                                    className="quantity-btn"
                                    onClick={() => setForm(prev => ({
                                      ...prev,
                                      quantite_drum: prev.quantite_drum + 1
                                    }))}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Type de toner :</label>
                        <div className="toner-type-selector">
                          {Object.entries(tonerTypes).map(([type, label]) => (
                              <label
                                  key={type}
                                  className={`toner-option ${typeToner === type ? 'selected' : ''}`}
                              >
                                <input
                                    type="radio"
                                    name="tonerType"
                                    value={type}
                                    checked={typeToner === type}
                                    onChange={() => setTypeToner(type)}
                                />
                                <span className="toner-label">{label}</span>
                              </label>
                          ))}
                        </div>
                      </div>

                      {typeToner === "unicolor" ? (
                          <div className="form-group">
                            <label className="form-label">
                              <Droplet size={16} className="input-icon" />
                              Quantité toner noir :
                            </label>
                            <div className="quantity-input">
                              <button
                                  type="button"
                                  className="quantity-btn"
                                  onClick={() => setForm(prev => ({
                                    ...prev,
                                    quantite_toner_noir: Math.max(0, prev.quantite_toner_noir - 1)
                                  }))}
                                  disabled={form.quantite_toner_noir <= 0}
                              >
                                -
                              </button>
                              <input
                                  type="number"
                                  name="quantite_toner_noir"
                                  value={form.quantite_toner_noir}
                                  onChange={handleChange}
                                  className="quantity-value"
                                  min="0"
                              />
                              <button
                                  type="button"
                                  className="quantity-btn"
                                  onClick={() => setForm(prev => ({
                                    ...prev,
                                    quantite_toner_noir: prev.quantite_toner_noir + 1
                                  }))}
                              >
                                +
                              </button>
                            </div>
                          </div>
                      ) : (
                          <div className="toner-colors-grid">

                            {couleurs.map((c) => (
                                <div key={c.nom} className="form-group">
                                  <label className="form-label" style={{ color: c.couleur }}>
                                    {c.icon} Quantité Toner {c.nom} :
                                  </label>
                                  <div className="quantity-input">

                                    <button
                                        type="button"
                                        className="quantity-btn"
                                        onClick={() => setForm(prev => ({
                                          ...prev,
                                          [c.nomChamp]: Math.max(0, prev[c.nomChamp] - 1)
                                        }))}
                                        disabled={form[c.nomChamp] <= 0}
                                    >
                                      -
                                    </button>
                                    <input
                                        type="number"
                                        name={c.nomChamp}
                                        value={form[c.nomChamp]}
                                        onChange={handleChange}
                                        className="quantity-value"
                                        min="0"
                                    />
                                    <button
                                        type="button"
                                        className="quantity-btn"
                                        onClick={() => setForm(prev => ({
                                          ...prev,
                                          [c.nomChamp]: prev[c.nomChamp] + 1
                                        }))}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                            ))}
                          </div>
                      )}
                    </div>
                  </form>
                </div>

                <div className="modal-footer">
                  <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => { resetForm(); setShowModal(false); }}
                  >
                    <X size={16} /> Annuler
                  </button>
                  <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleSubmit}
                  >
                    <Save size={16} /> {editingId ? "Enregistrer les modifications" : "Ajouter le consommable"}
                  </button>
                </div>
              </div>
            </div>
        )}

        <div className="consommables-list">
          {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <span>Chargement des consommables...</span>
              </div>
          ) : filteredConsommables.length === 0 ? (
              <div className="empty-state">
                <Package size={48} />
                <p>
                  {searchTerm
                      ? "Aucun consommable ne correspond à votre recherche."
                      : "Aucun consommable disponible pour cette branche."}
                </p>
                {!searchTerm && (
                    <button
                        className="btn btn-primary"
                        onClick={() => { setShowModal(true); resetForm(); }}
                    >
                      <Plus size={16} style={{marginTop:'20px'}}/> Ajouter votre premier consommable
                    </button>
                )}
              </div>
          ) : (
              <div className="cards-grid">
                {filteredConsommables.map((item) => {
                  const itemTonerType = getTonerType(item);
                  return (
                      <div key={item.id} className="consommable-card">
                        <div className="card-header">
                          <div className="card-title">
                            <Printer size={20} />
                            <h4>{item.marque} - {item.reference}</h4>
                          </div>
                          <div className="card-actions">
                            <button
                                className="btn-icon btn-edit"
                                onClick={() => handleEdit(item)}
                                title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                                className="btn-icon btn-delete"
                                onClick={() => handleDelete(item.id)}
                                title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="card-content">
                          {/* Affichage du Drum : si différent de -1, afficher */}
                          {item.quantite_drum !== -1 && (
                              <div className="inventory-item">
                                <Layers size={16} /> <span className="item-label">Drum :</span> {item.quantite_drum || 0}
                              </div>
                          )}

                          {/* Affichage basé sur le type de toner déterminé par les valeurs -1 */}
                          {itemTonerType === "unicolor" ? (
                              // Toner unicolor : affiche SEULEMENT le toner noir (les couleurs sont à -1)
                              <div className="inventory-item">
                                <Droplet size={16} /> <span className="item-label">Toner (Unicolor) :</span> {item.quantite_toner_noir || 0}
                              </div>
                          ) : (
                              // Toner multicolor : affiche les couleurs (toner noir est à -1)
                              <div className="inventory-colors">

                                {couleurs.map((c) => {
                                  const quantite = item[c.nomChamp] || 0;
                                  return (
                                      <div key={c.nom} className="inventory-item color-item">
                                        {c.icon}<span className="item-label">{c.nom} :</span> {quantite}
                                      </div>
                                  );
                                })}
                              </div>
                          )}
                        </div>
                      </div>
                  );
                })}
              </div>
          )}
        </div>
      </div></>
  );
};

export default InventaireConsommable;

























