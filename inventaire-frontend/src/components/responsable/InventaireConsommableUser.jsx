// Imports
import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Printer, Save, X, Package, Layers, Droplet, Search, Droplets } from "lucide-react";
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

const InventaireConsommableUser = () => {
  const { branchName } = useParams();
  const [consommables, setConsommables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
  const navigate = useNavigate();

  useEffect(() => {
    fetchConsommables();
  }, [branchName]);

  // Fonction pour déterminer le type de toner d'un item
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
   const handleLogoClick = () => navigate('/responsable/dashboard');

  // Filtrer les consommables selon la recherche
  const filteredConsommables = searchTerm.trim()
    ? consommables.filter(item =>
        item.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reference.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : consommables;

  const getTonerType = (item) => {
    return getTonerTypeFromData(item);
  };

  return (<>          <header className="login-header" style={{ marginBottom: '2rem' }}>
                  <img src={logoleft} alt="M-AUTOMOTIV" className="header-logo" onClick={handleLogoClick} />
                  <img src={logoright} alt="Service Client 2025" className="service-logo" />
                </header>
    <div className="inventaire-consommable">

      <header className="page-header">
        <h2 className="page-title">
          <Printer size={24} className="header-icon" />
          Inventaire Consommables - {branchName}
        </h2>
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

export default InventaireConsommableUser;