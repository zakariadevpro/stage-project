// Imports
import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Printer, Save, X, Package, Layers, Droplet, Search, Building2,User, FileText} from "lucide-react";
import { useParams } from "react-router-dom";
import "./InventaireConsommable.css"; // Assurez-vous d'importer le CSS

// Couleurs toners
const couleurs = [
  { nom: "Cyan", nomChamp: "quantite_toner_cyan", couleur: "#06b6d4", icon: <Droplet size={16} color="#06b6d4" /> },
  { nom: "Magenta", nomChamp: "quantite_toner_magenta", couleur: "#d946ef", icon: <Droplet size={16} color="#d946ef" /> },
  { nom: "Jaune", nomChamp: "quantite_toner_jaune", couleur: "#facc15", icon: <Droplet size={16} color="#facc15" /> },
  { nom: "Noir (couleur)", nomChamp: "quantite_toner_noir_couleur", couleur: "#000", icon: <Droplet size={16} color="#000" /> },
];

const tonerTypes = {
  unicolor: "Toner Noir",
  multicolor: "Toner Couleur (CMYK)"
};

const API_URL = "http://localhost:8000/api";

const ConsommablesEnCommande = () => {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
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
    branche: "",
    nom_demandeur: "",
  description_detaillee: "",


  };

  const [form, setForm] = useState(initialFormState);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/branches`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new Error("Erreur de chargement des branches");
      const data = await response.json();
      setBranches(data);
    } catch (err) {
      console.error("Erreur branches:", err);
    }
  };



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
      if (!token) return;

      const res = await fetch(`${API_URL}/consommables`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }

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

  const fetchConsommables = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token manquant");
      }

      // Construction de l'URL avec le filtre etat=endemande
      const url = `${API_URL}/consommables?etat=endemande`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setConsommables(data);
    } catch (error) {
      console.error("Erreur de chargement:", error);
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    fetchBranches();
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
  const handleMarkAsAvailable = async (id) => {
    if (!window.confirm("Êtes-vous sûr que ce consommable est arrivé ?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/consommables/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ etat: "disponible" }),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      fetchConsommables(); // Rafraîchir la liste

      // Notification de succès
      const successMessage = document.createElement("div");
      successMessage.className = "notification success";
      successMessage.textContent = "Consommable marqué comme disponible avec succès";
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);

    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors de la mise à jour: " + err.message);
    }
  };

const handleEdit = (item) => {
  // Déterminer le type de toner basé sur les valeurs -1
  const tonerType = getTonerTypeFromData(item);

  // Extraire nom et description depuis le champ description
  let nomDemandeur = "";
  let descriptionDetaillee = "";
  
  if (item.description) {
    const match = item.description.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      nomDemandeur = match[1].trim();
      descriptionDetaillee = match[2].trim();
    } else {
      descriptionDetaillee = item.description;
    }
  }

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
    branche: item.branche || "",
    // AJOUTER ces lignes
    nom_demandeur: nomDemandeur,
    description_detaillee: descriptionDetaillee,
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

  // AJOUTER cette validation
  if (!form.nom_demandeur.trim()) {
    alert("Le nom du demandeur est obligatoire");
    return;
  }

  const token = localStorage.getItem("token");
  const formData = { ...form };
  formData.type_toner = typeToner;

  // NOUVELLE LOGIQUE : Assigner -1 aux champs non utilisés
  if (typeToner === "unicolor") {
    formData.quantite_toner_cyan = -1;
    formData.quantite_toner_magenta = -1;
    formData.quantite_toner_jaune = -1;
    formData.quantite_toner_noir_couleur = -1;
  } else {
    formData.quantite_toner_noir = -1;
  }

  if (!hasDrum) {
    formData.quantite_drum = -1;
  } else {
    formData.quantite_drum = form.quantite_drum || 0;
  }

  // AJOUTER : Construire la description finale
  const descriptionFinale = `${form.nom_demandeur.trim()}: ${form.description_detaillee.trim()}`;
  
  const payload = { 
    ...formData, 
    etat: "endemande",
    description: descriptionFinale // Remplacer description par la version formatée
  };

  // Supprimer les champs temporaires du payload
  delete payload.nom_demandeur;
  delete payload.description_detaillee;

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
const parseDescription = (description) => {
  if (!description) return { nom: "", description: "" };
  
  const match = description.match(/^([^:]+):\s*(.*)$/);
  if (match) {
    return {
      nom: match[1].trim(),
      description: match[2].trim()
    };
  }
  return { nom: "", description: description };
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

  return (
      <div className="inventaire-consommable">
        <header className="page-header">
          <h2 className="page-title">
            <Printer size={24} className="header-icon" />
            Consommables en Commande
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
                placeholder="               Rechercher par marque ou référence..."
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
                            <div className="form-group">
                              <label className="form-label">Branche concernée :</label>
                              <select
                                  className="form-input"
                                  name="branche"
                                  value={form.branche}
                                  onChange={handleChange}
                                  required
                              >
                                <option value="">-- Choisir une branche --</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.name}>{b.name}</option>
                                ))}
                              </select>
                            </div>

                          </div>
                      )}
                    </div>
                    <div className="form-section">
  <h4 className="section-title">
    <Package size={18} /> Informations de la demande
  </h4>

  <div className="form-group">
    <label className="form-label">Nom du demandeur :</label>
    <input
      type="text"
      name="nom_demandeur"
      value={form.nom_demandeur}
      onChange={handleChange}
      className="form-input"
      placeholder="Nom et prénom du demandeur"
      required
    />
  </div>

  <div className="form-group">
    <label className="form-label">Description :</label>
    <textarea
      name="description_detaillee"
      value={form.description_detaillee}
      onChange={handleChange}
      className="form-input"
      placeholder="Décrivez le motif de la demande (ex: imprimante en panne, stock épuisé, etc.)"
      rows="3"
      style={{ resize: 'vertical', minHeight: '80px' }}
    />
  </div>
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
                              Quantité toner  :
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
                      <Plus size={16}style={{marginTop:'20px'}} /> Ajouter votre premier consommable
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
                          <div className="inventory-item">
                            < Building2 size={18} />succursale : <span className="item-label">{item.branche}</span>
                          </div>
                         
                          {item.quantite_drum !== -1 && (
                              <div className="inventory-item">
                                <Layers size={16} /> <span className="item-label">Drum :</span> {item.quantite_drum || 0}
                              </div>
                          )}

                          {/* Affichage basé sur le type de toner déterminé par les valeurs -1 */}
                          {itemTonerType === "unicolor" ? (
                              // Toner unicolor : affiche SEULEMENT le toner noir (les couleurs sont à -1)
                              <div className="inventory-item">
                                <Droplet size={16} /> <span className="item-label">Toner :</span> {item.quantite_toner_noir || 0}
                              </div>
                          ) : (
                              // Toner multicolor : affiche les couleurs (toner noir est à -1)
                              <div className="inventory-colors">
                                {couleurs.map((c) => {
                                  const quantite = item[c.nomChamp] || 0;
                                  return (
                                      <div key={c.nom} className="inventory-item color-item">
                                        {c.icon} <span className="item-label">{c.nom} :</span> {quantite}
                                      </div>
                                  );
                                })}
                              </div>

                          )}
                           {item.description && (
  <div className="request-info">
    {(() => {
      const { nom, description } = parseDescription(item.description);
      return (
        <>
          {nom && (
            <div className="inventory-item">
              <User size={16} /> <span className="item-label">Demandeur :</span> {nom}
            </div>
          )}
          {description && (<>
            <div className="inventory-item">
              <FileText size={16} /> <span className="item-label">Description :</span> 
              
            </div><div className="inventory-item description-item"><span className="description-text">{description}</span></div></>
          )}
        </>
      );
    })()}
  </div>
)}
                          <div className="card-footer">
                            <button
                                className="btn-arrived-full"
                                onClick={() => handleMarkAsAvailable(item.id)}
                                title="Marquer comme arrivé"
                            >
                              ✓ Arrivé
                            </button>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
          )}
        </div>
      </div>
  );
};

export default ConsommablesEnCommande;

























