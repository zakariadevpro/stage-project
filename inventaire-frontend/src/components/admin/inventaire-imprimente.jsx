import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import './imprimente_inventory.css';
import logoright from "./assets/logoright.svg";
import logoleft from "./assets/logoleft.svg";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ConsumablePrompt = ({ initialIp, onSubmit, onCancel }) => {
  const [ip, setIp] = useState(initialIp || '');
  const [community, setCommunity] = useState('public');
  const [isConsultingConsumables, setIsConsultingConsumables] = useState(false);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ip.trim()) {
      alert("Veuillez saisir une adresse IP valide");
      return;
    }
    onSubmit(ip.trim(), community.trim());
  };

  return (
      <div className="modal-overlay">
        <form className="modal-content" onSubmit={handleSubmit}>
          <h3>Consulter l'état des consommables</h3>
          <label>
            Adresse IP de l'imprimante:
            <input
                type="text"
                value={ip}
                onChange={e => setIp(e.target.value)}
                required
                autoFocus
            />
          </label>
          <label>
            Communauté SNMP (par défaut "public"):
            <input
                type="text"
                value={community}
                onChange={e => setCommunity(e.target.value)}
            />
          </label>
          <div style={{ marginTop: 15 }}>
            <button type="submit" style={{ marginRight: 10 }}>Consulter</button>
            <button type="button" onClick={onCancel}>Annuler</button>
          </div>
        </form>
      </div>
  );
};

const ImprinterForm = ({ printer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    emplacement: printer?.emplacement || '',
    adresseip: printer?.adresseip || '',
    hostname: printer?.hostname || '',
    numero_serie: printer?.numero_serie || '',
    modele_peripherique: printer?.modele_peripherique || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
      <div className="modal-overlay">
        <form className="modal-content" onSubmit={handleSubmit}>
          <h3>{printer ? 'Modifier une imprimante' : 'Ajouter une imprimante'}</h3>

          <div className="form-field">
            <label htmlFor="emplacement">Emplacement</label>
            <input
                id="emplacement"
                name="emplacement"
                type="text"
                value={formData.emplacement}
                onChange={handleChange}
                required
            />
          </div>

          <div className="form-field">
            <label htmlFor="adresseip">Adresse IP</label>
            <input
                id="adresseip"
                name="adresseip"
                type="text"
                value={formData.adresseip}
                onChange={handleChange}
                required
            />
          </div>

          <div className="form-field">
            <label htmlFor="hostname">Hostname</label>
            <input
                id="hostname"
                name="hostname"
                type="text"
                value={formData.hostname}
                onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="numero_serie">Numéro de série</label>
            <input
                id="numero_serie"
                name="numero_serie"
                type="text"
                value={formData.numero_serie}
                onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="modele_peripherique">Modèle</label>
            <input
                id="modele_peripherique"
                name="modele_peripherique"
                type="text"
                value={formData.modele_peripherique}
                onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="submit">{printer ? 'Modifier' : 'Ajouter'}</button>
            <button type="button" onClick={onCancel}>Annuler</button>
          </div>
        </form>
      </div>
  );
};

const ImprimenteInventory = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [printers, setPrinters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [selectedIp, setSelectedIp] = useState('');
  const [resultat, setResultat] = useState('');
  const [editPrinter, setEditPrinter] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletePrinter, setDeletePrinter] = useState(null);
  const [importProgress, setImportProgress] = useState(null);
  const [isConsultingConsumables, setIsConsultingConsumables] = useState(false);

  useEffect(() => {
    fetchPrinters();
  }, [name]);

  const fetchPrinters = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/printers-by-branche/${name}`);
      setPrinters(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des imprimantes :", error);
    }
  };

  const onClickConsult = (ip) => {
    setSelectedIp(ip || '');
    setShowPromptModal(true);
  };

const consulterViaScript = async (ip, community) => {
  try {
    setIsConsultingConsumables(true);
    
    const res = await fetch('http://localhost:5000/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, community })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erreur inconnue lors de l'exécution du script");
    }

    setResultat(data.result);
    setShowResultModal(true);
  } catch (error) {
    console.error("Erreur côté client:", error.message);
    setResultat(`❌ Erreur : ${error.message}`);
    setShowResultModal(true);
  } finally {
    setIsConsultingConsumables(false);
  }
};


const fermerResultat = async () => {
  try {
    await fetch('http://localhost:5000/clear-result', { method: 'POST' });
    setResultat('');
    setShowResultModal(false);
  } catch (error) {
    console.error("Erreur lors du nettoyage:", error);
    setResultat('');
    setShowResultModal(false);
  }
};


const handleConsultConsumable = async (ip, community = 'public') => {
  setShowPromptModal(false);
  await consulterViaScript(ip, community);
};

  const handleAddPrinter = async (data) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/printers', {
        ...data,
        branche: name
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddForm(false);
      fetchPrinters();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'imprimante:", error);
      alert("Erreur lors de l'ajout de l'imprimante");
    }
  };

  const handleEditPrinter = async (data) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/printers/${editPrinter.id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditPrinter(null);
      fetchPrinters();
    } catch (error) {
      console.error("Erreur lors de la modification de l'imprimante:", error);
      alert("Erreur lors de la modification de l'imprimante");
    }
  };

  const handleDeletePrinter = async () => {
    if (!deletePrinter) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/printers/${deletePrinter.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeletePrinter(null);
      fetchPrinters();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'imprimante:", error);
      alert("Erreur lors de la suppression de l'imprimante");
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredPrinters.map(({ id, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Imprimantes');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `imprimantes_${name}.xlsx`);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Montrer immédiatement la barre de progression à 0%
    setImportProgress({
      current: 0,
      total: 0,
      success: 0,
      failed: 0,
      fileName: file.name,
      errors: [],
      retries: []
    });

    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        // Parse Excel file
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        const sheet = wb.Sheets[wb.SheetNames[0]];

        // Options pour la conversion des données Excel
        const sheetOpts = {
          header: 1,
          defval: '',
          raw: false
        };

        // Get data as array of arrays
        const rawData = XLSX.utils.sheet_to_json(sheet, sheetOpts);
        if (rawData.length === 0) {
          throw new Error("Le fichier Excel est vide");
        }

        // Détecter les en-têtes et les mapper aux champs attendus
        const headerMap = {
          'emplacement': 'emplacement',
          'lieu': 'emplacement',
          'localisation': 'emplacement',
          'adresse ip': 'adresseip',
          'adresseip': 'adresseip',
          'ip': 'adresseip',
          'hostname': 'hostname',
          'nom d\'hôte': 'hostname',
          'hôte': 'hostname',
          'nom': 'hostname',
          'numéro de série': 'numero_serie',
          'numero de serie': 'numero_serie',
          'numero_serie': 'numero_serie',
          'n° série': 'numero_serie',
          'série': 'numero_serie',
          'nserie': 'numero_serie',
          'sn': 'numero_serie',
          'modèle': 'modele_peripherique',
          'modele': 'modele_peripherique',
          'modele_peripherique': 'modele_peripherique',
          'modèle périphérique': 'modele_peripherique',
          'type': 'modele_peripherique'
        };

        // Normaliser les en-têtes
        const normalizeHeader = (header) => {
          if (!header) return '';
          return String(header)
              .toLowerCase()
              .trim()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
        };

        // Détecter si la première ligne contient des en-têtes
        const firstRow = rawData[0] || [];
        let hasHeaders = firstRow.some(cell =>
            typeof cell === 'string' &&
            normalizeHeader(cell) in headerMap
        );

        // Assigner les indexes des colonnes
        let columnIndexes = {};

        if (hasHeaders) {
          firstRow.forEach((header, index) => {
            if (header) {
              const normalizedHeader = normalizeHeader(header);
              if (normalizedHeader in headerMap) {
                columnIndexes[headerMap[normalizedHeader]] = index;
              }
            }
          });
        } else {
          // Si pas d'en-têtes, utiliser l'ordre par défaut
          const fieldOrder = ['emplacement', 'adresseip', 'hostname', 'numero_serie', 'modele_peripherique'];
          fieldOrder.forEach((field, index) => {
            if (index < firstRow.length) {
              columnIndexes[field] = index;
            }
          });
        }

        // Filtrer les données
        const dataRows = hasHeaders ? rawData.slice(1) : rawData;

        // Filtrer les lignes vides
        const validRows = dataRows.filter(row =>
            Array.isArray(row) && row.length > 0 &&
            row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
        );

        setImportProgress(prev => ({ ...prev, total: validRows.length }));

        const token = localStorage.getItem('token');
        let successCount = 0;
        let failedCount = 0;
        let errors = [];
        let retriesNeeded = [];

        // Traiter chaque ligne valide
        for (let i = 0; i < validRows.length; i++) {
          const row = validRows[i];

          // Créer un nouvel objet imprimante
          const printer = {
            emplacement: '',
            adresseip: '',
            hostname: '',
            numero_serie: '',
            modele_peripherique: '',
            branche: name
          };

          // Remplir l'objet imprimante avec les données disponibles
          Object.keys(columnIndexes).forEach(field => {
            const index = columnIndexes[field];
            if (index !== undefined && index < row.length) {
              const value = row[index];
              if (value !== null && value !== undefined) {
                printer[field] = typeof value === 'string' ? value.trim() : String(value).trim();
              }
            }
          });

          // Validation minimale
          if (!printer.adresseip) {
            failedCount++;
            errors.push({
              row: i + (hasHeaders ? 2 : 1),
              error: "Adresse IP manquante",
              printer: printer
            });
            continue;
          }

          try {
            // Essayer d'ajouter l'imprimante
            await axios.post('http://localhost:8000/api/printers', printer, {
              headers: { Authorization: `Bearer ${token}` }
            });
            successCount++;
          } catch (error) {
            console.error('Erreur lors de l\'importation:', error);
            failedCount++;
            errors.push({
              row: i + (hasHeaders ? 2 : 1),
              error: error.response?.data?.message || "Erreur inconnue",
              printer: printer
            });
          }

          // Mettre à jour la progression
          setImportProgress(prev => ({
            ...prev,
            current: i + 1,
            success: successCount,
            failed: failedCount,
            errors: errors
          }));
        }

        // Recharger les données
        fetchPrinters();

        // Garder la progression visible pendant quelques secondes
        setTimeout(() => {
          setImportProgress(null);
        }, 5000);

      } catch (error) {
        console.error('Erreur d\'importation:', error);
        alert(`Erreur d'importation: ${error.message}`);
        setImportProgress(null);
      }
    };

    reader.onerror = () => {
      alert("Erreur lors de la lecture du fichier");
      setImportProgress(null);
    };

    reader.readAsArrayBuffer(file);
  };

  const filteredPrinters = printers.filter((p) => {
    const hostname = p.hostname || '';
    const adresseip = p.adresseip || '';
    const modele = p.modele_peripherique || '';
    const emplacement = p.emplacement || '';
    return (
        hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adresseip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emplacement.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculer le pourcentage d'avancement pour l'importation
  const progressPercentage = importProgress?.total > 0
      ? Math.round((importProgress.current / importProgress.total) * 100)
      : 0;

  // Déterminer si l'importation est terminée
  const isImportComplete = importProgress?.current === importProgress?.total && importProgress?.total > 0;

  return (
      <>
        <header className="login-header">
          <img src={logoleft} alt="M-AUTOMOTIV" className="header-logo" onClick={() => navigate('/admin/Dashboard')} />
          <img src={logoright} alt="Service Client 2025" className="service-logo" />
        </header>

        <div className="branch-inventory-container">
          <h2>
            Inventaire Imprimantes -
            <span className="highlight-orange">{name}</span>
          </h2>

          <div className="button-group">
            <button className="button import" onClick={() => document.getElementById('printer-import').click()}>
              <Icons.Import size={16}/> Importer
            </button>
            <input
                id="printer-import"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImport}
                style={{ display: 'none' }}
            />
            <button className="button export" onClick={exportToExcel}>
              <Icons.FileSpreadsheet size={16}/> Exporter
            </button>
            <button className="button new-printer" onClick={() => setShowAddForm(true)}>
              <Icons.Plus size={16}/> Nouvelle Imprimante
            </button>
          </div>

          {importProgress && (
              <div className="import-progress">
                <div className="import-header">
                  <Icons.FileSpreadsheet size={18} style={{ marginRight: '8px', color: '#ff5c35' }} />
                  {importProgress.fileName && (
                      <span className="file-name">{importProgress.fileName}</span>
                  )}
                </div>

                <p>
                  <Icons.Loader size={16} className={!isImportComplete ? "loading-icon" : ""} style={{ marginRight: '8px' }} />
                  {isImportComplete
                      ? "Importation terminée!"
                      : `Importation en cours: ${importProgress.current}/${importProgress.total} lignes (${progressPercentage}%)`
                  }
                </p>

                <div className="progress-bar">
                  <div
                      className={`progress-fill ${!isImportComplete ? "importing" : ""}`}
                      style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>

                <div className="import-summary">
                  {isImportComplete ? (
                      <div className="import-stats">
                        <div className="stat-item stat-success">
                          <Icons.CheckCircle size={16} />
                          <span className="stat-value">{importProgress.success} réussis</span>
                        </div>

                        {importProgress.failed > 0 && (
                            <div className="stat-item stat-failed">
                              <Icons.XCircle size={16} />
                              <span className="stat-value">{importProgress.failed} échoués</span>
                            </div>
                        )}
                      </div>
                  ) : (
                      importProgress.current > 0 && (
                          <div className="import-stats">
                            <div className="stat-item stat-success">
                              <Icons.CheckCircle size={16} />
                              <span className="stat-value">{importProgress.success}</span>
                            </div>

                            {importProgress.failed > 0 && (
                                <div className="stat-item stat-failed">
                                  <Icons.XCircle size={16} />
                                  <span className="stat-value">{importProgress.failed}</span>
                                </div>
                            )}
                          </div>
                      )
                  )}
                </div>
              </div>
          )}

          <div className="inventory-actions">
            <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <table className="inventory-table">
            <thead>
            <tr>
              <th>#</th>
              <th>Emplacement</th>
              <th>Adresse IP</th>
              <th>Hostname</th>
              <th>N° Série</th>
              <th>Modèle</th>
              <th>État Consommables</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {filteredPrinters.map((printer, i) => (
                <tr key={printer.id}>
                  <td>{i + 1}</td>
                  <td>{printer.emplacement}</td>
                  <td>
                    <a href={`http://${printer.adresseip}`} target="_blank" rel="noopener noreferrer">
                      {printer.adresseip}
                    </a>
                  </td>
                  <td>{printer.hostname}</td>
                  <td>{printer.numero_serie}</td>
                  <td>{printer.modele_peripherique}</td>
                  <td>
                    <button onClick={() => onClickConsult(printer.adresseip)}>
                      Consulter
                    </button>
                  </td>
                  <td>
                    <button onClick={() => setEditPrinter(printer)}>
                      <Icons.Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeletePrinter(printer)}>
                      <Icons.Trash2 size={14} />
                    </button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        {showPromptModal && (
            <ConsumablePrompt
                initialIp={selectedIp}
                onSubmit={handleConsultConsumable}
                onCancel={() => setShowPromptModal(false)}
            />
        )}

        {showResultModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Informations consommables</h3>
                <div
  className="result-html"
  dangerouslySetInnerHTML={{ __html: resultat }}
  style={{ maxHeight: '70vh', overflowY: 'auto' }}
></div>
                <button onClick={() => {
                  fermerResultat();
                  setShowResultModal(false);
                }}>
                  Fermer
                </button>
              </div>
            </div>
        )}

        {(editPrinter || showAddForm) && (
            <ImprinterForm
                printer={editPrinter}
                onSubmit={editPrinter ? handleEditPrinter : handleAddPrinter}
                onCancel={() => {
                  setEditPrinter(null);
                  setShowAddForm(false);
                }}
            />
        )}

        {deletePrinter && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Confirmer la suppression</h3>
                <p>Êtes-vous sûr de vouloir supprimer l'imprimante {deletePrinter.hostname || deletePrinter.adresseip} ?</p>
                <div className="modal-actions">
                  <button onClick={handleDeletePrinter}>Confirmer</button>
                  <button onClick={() => setDeletePrinter(null)}>Annuler</button>
                </div>  
              </div>
            </div>
        )}
        {isConsultingConsumables && (
            <div className="modal-overlay">
              <div className="loading-modal">
                <div className="loading-spinner"></div>
                <h3>Consultation en cours...</h3>
                <p>Récupération des informations des consommables</p>
              </div>
            </div>
        )}
      </>
  );
};

export default ImprimenteInventory;