import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './branchInventoriy.css';
import logoright from "./assets/logoright.svg";
import logoleft from "./assets/logoleft.svg";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as Icons from 'lucide-react';

const BranchInventory = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [pcs, setPcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editPc, setEditPc] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [etatFilter, setEtatFilter] = useState('');
  const [importProgress, setImportProgress] = useState(null);
  const [formData, setFormData] = useState({
    nom_poste: '', num_serie: '', user: '', email: '',
    service: '', description: '', date_aff: '', etat: '', remarque: ''
  });

  // Field order for headerless Excel imports
  const fieldOrder = [
    'nom_poste', 'num_serie', 'user', 'email', 'service', 
    'description', 'date_aff', 'etat', 'remarque'
  ];

  const fetchPcs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/pcs-by-branche/${name}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      const data = await res.json();
      setPcs(data.pcs || []);
    } catch {
      alert("Erreur lors du chargement des PCs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPcs(); }, [name]);

  const filteredPcs = pcs.filter(pc => {
    const text = `${pc.nom_poste} ${pc.num_serie} ${pc.user} ${pc.email} ${pc.service}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchEtat = etatFilter ? pc.etat.toLowerCase() === etatFilter.toLowerCase() : true;
    return matchSearch && matchEtat;
  });

  const handleLogoClick = () => navigate('/admin/Dashboard');

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/pcs/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setPcs(pcs.filter(pc => pc.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/pcs/${editPc.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      await fetchPcs();
      setEditPc(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/pcs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, branches: name })
      });
      await fetchPcs();
      setShowAddForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredPcs.map(({ id, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PCs');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `pcs_${name}.xlsx`);
  };

// Fonction handleImport optimisée pour être plus robuste avec la gestion des données

// Fonction handleImport améliorée pour résoudre les problèmes d'importation
  const handleImport = e => {
    const file = e.target.files[0];
    if (!file) return;

    // Montrer immédiatement la barre de progression à 0%
    setImportProgress({
      current: 0,
      total: 0,
      success: 0,
      failed: 0,
      fileName: file.name,
      errors: [], // Pour stocker les détails des erreurs
      retries: [] // Pour stocker les identifiants des lignes à réessayer
    });

    const reader = new FileReader();

    reader.onload = async evt => {
      try {
        // Parse Excel file
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: 'array', cellDates: true, dateNF: 'yyyy-mm-dd' });
        const sheet = wb.Sheets[wb.SheetNames[0]];

        // Options améliorées pour la conversion des données Excel
        const sheetOpts = {
          header: 1,
          defval: '',
          raw: false,
          dateNF: 'yyyy-mm-dd'
        };

        // Get data as array of arrays
        const rawData = XLSX.utils.sheet_to_json(sheet, sheetOpts);
        if (rawData.length === 0) {
          throw new Error("Le fichier Excel est vide");
        }

        // Détecter les en-têtes et les mapper aux champs attendus
        const headerMap = {
          'nom du poste': 'nom_poste',
          'nom poste': 'nom_poste',
          'nom_poste': 'nom_poste',
          'poste': 'nom_poste',
          'nom': 'nom_poste',
          'sn': 'num_serie',
          'num_serie': 'num_serie',
          'numéro de série': 'num_serie',
          'numero de serie': 'num_serie',
          'utilisateur': 'user',
          'user': 'user',
          'email': 'email',
          'mail': 'email',
          'service': 'service',
          'département': 'service',
          'departement': 'service',
          'description': 'description',
          'desc': 'description',
          'date d\'affectation': 'date_aff',
          'date_aff': 'date_aff',
          'date daffectation': 'date_aff',
          'état': 'etat',
          'etat': 'etat',
          'status': 'etat',
          'remarque': 'remarque',
          'remarques': 'remarque',
          'commentaire': 'remarque',
          'note': 'remarque'
        };

        // Normaliser les en-têtes (supprimer accents, espaces, majuscules)
        const normalizeHeader = (header) => {
          if (!header) return '';
          return String(header)
              .toLowerCase()
              .trim()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, ""); // Supprime les accents
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
          // Sinon, utiliser l'ordre défini dans fieldOrder
          fieldOrder.forEach((field, index) => {
            if (index < firstRow.length) {
              columnIndexes[field] = index;
            }
          });
        }

        // Filtrer les données (ignorer les en-têtes si présents)
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

        // Fonction améliorée pour traiter les dates
        const parseDate = (value) => {
          if (!value) return '';

          // Si c'est déjà un objet Date
          if (value instanceof Date && !isNaN(value)) {
            return value.toISOString().split('T')[0];
          }

          // Si c'est déjà une chaîne au format date
          if (typeof value === 'string') {
            // Nettoyer la chaîne
            const cleanedDate = value.trim();

            // Formats communs: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY
            if (cleanedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
              return cleanedDate;
            }

            // Essayer de convertir les formats français DD/MM/YYYY
            const parts = cleanedDate.split(/[\/.-]/);
            if (parts.length === 3) {
              // Si le premier nombre semble être un jour (1-31)
              if (parseInt(parts[0]) <= 31 && parts[0].length <= 2) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                return `${year}-${month}-${day}`;
              }
            }
          }

          // Si c'est un numéro de série Excel
          if (typeof value === 'number') {
            try {
              // Convertir le numéro de série Excel en date JavaScript
              const date = new Date(Math.round((value - 25569) * 86400 * 1000));
              if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
              }
            } catch (e) {
              console.warn("Erreur lors de la conversion de date Excel:", e);
            }
          }

          // Essayer de convertir avec Date
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
          } catch (e) {
            console.warn("Erreur lors de la conversion de date:", e);
          }

          // Retourner une chaîne vide si tout échoue
          return '';
        };

        // Fonction améliorée pour nettoyer les emails
        const cleanEmail = (email) => {
          if (!email) return '';

          // Convertir en string et supprimer les espaces
          let cleanedEmail = String(email).trim();

          // Corriger les erreurs courantes
          cleanedEmail = cleanedEmail
              .replace(/;/g, '.') // Remplacer les ; par .
              .replace(/,/g, '.') // Remplacer les , par .
              .replace(/\s+/g, '') // Supprimer tous les espaces
              .replace(/(\.+)@/g, '@') // Remplacer les points multiples avant @ par un seul
              .replace(/@(\.+)/g, '@'); // Remplacer les points multiples après @ par un seul

          // Validation basique du format email
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (cleanedEmail && !emailPattern.test(cleanedEmail)) {
            console.warn(`Format d'email invalide: ${cleanedEmail}`);
            if (cleanedEmail.includes('@')) {
              // Essayer de corriger si le format est proche
              const parts = cleanedEmail.split('@');
              if (parts.length === 2 && parts[1].includes('.')) {
                return cleanedEmail; // C'est peut-être une erreur mineure, on garde
              }
            }
            return '';
          }

          return cleanedEmail;
        };

        // Traiter chaque ligne valide avec des retries
        const processRows = async (rows, isRetry = false) => {
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowIndex = isRetry ? retriesNeeded[i].index : i;

            // Créer un nouvel objet PC avec des valeurs par défaut
            const pc = {
              nom_poste: '',
              num_serie: '',
              user: '',
              email: '',
              service: '',
              description: '',
              date_aff: '',
              etat: 'Actif', // Valeur par défaut
              remarque: '',
              branches: name // Toujours ajouter le nom de la branche actuelle
            };

            // Remplir l'objet PC avec les données disponibles
            Object.keys(columnIndexes).forEach(field => {
              const index = columnIndexes[field];

              if (index !== undefined && index < row.length) {
                const value = row[index];

                if (value !== null && value !== undefined) {
                  // Traitement spécial pour les dates
                  if (field === 'date_aff') {
                    pc[field] = parseDate(value);
                  }
                  // Traitement spécial pour les emails
                  else if (field === 'email') {
                    pc[field] = cleanEmail(value);
                  }
                  // Pour les champs de texte, convertir en chaîne et supprimer les espaces
                  else {
                    pc[field] = typeof value === 'string' ? value.trim() : String(value).trim();
                  }
                }
              }
            });

            // Validation et nettoyage final
            if (!pc.nom_poste) {
              pc.nom_poste = `PC-${Math.floor(Math.random() * 10000)}`; // Générer un nom s'il est manquant
            }

            // Essayer d'envoyer avec backoff exponentiel
            let attempt = 0;
            const maxAttempts = 3; // Nombre max de tentatives par ligne
            let success = false;

            while (attempt < maxAttempts && !success) {
              try {
                // Ajouter un délai exponentiel entre les tentatives
                if (attempt > 0) {
                  await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 200));
                }

                const response = await fetch('http://localhost:8000/api/pcs', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(pc)
                });

                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  const errorMessage = errorData.message || `Erreur ${response.status}`;
                  throw new Error(errorMessage);
                }

                success = true;
                successCount++;
              } catch (error) {
                attempt++;

                // Si toutes les tentatives ont échoué
                if (attempt >= maxAttempts) {
                  console.error(`Échec après ${maxAttempts} tentatives pour la ligne ${rowIndex + (hasHeaders ? 2 : 1)}:`, error);

                  if (!isRetry) {
                    // Ajouter à la liste des lignes à réessayer plus tard
                    retriesNeeded.push({
                      index: rowIndex,
                      row: row
                    });
                  } else {
                    failedCount++;
                    errors.push({
                      row: rowIndex + (hasHeaders ? 2 : 1), // Numéro de ligne dans le fichier
                      pc: pc,
                      error: error.message
                    });
                  }
                }
              }
            }

            // Mettre à jour la progression
            setImportProgress(prev => ({
              ...prev,
              current: isRetry ? prev.current : i + 1,
              success: successCount,
              failed: failedCount,
              errors: errors
            }));
          }
        };

        // Traiter toutes les lignes
        await processRows(validRows);

        // Si des lignes nécessitent une nouvelle tentative
        if (retriesNeeded.length > 0) {
          console.log(`Réessai de ${retriesNeeded.length} lignes qui ont échoué...`);
          const rowsToRetry = retriesNeeded.map(item => item.row);
          // Attendre un peu avant la seconde tentative
          await new Promise(resolve => setTimeout(resolve, 1000));
          await processRows(rowsToRetry, true);
        }

        // Recharger les données
        await fetchPcs();

        // Conserver la progression visible pendant quelques secondes
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

  const inputType = key =>
    key === 'email' ? 'email' : key === 'date_aff' ? 'date' : 'text';

  // Calculer le pourcentage d'avancement
  const progressPercentage = importProgress?.total > 0 
    ? Math.round((importProgress.current / importProgress.total) * 100) 
    : 0;

  // Déterminer si l'importation est terminée
  const isImportComplete = importProgress?.current === importProgress?.total && importProgress?.total > 0;

  return (
    <>
      <header className="login-header">
        <img src={logoleft} alt="M-AUTOMOTIV" className="header-logo" onClick={handleLogoClick}/>
        <img src={logoright} alt="Service Client 2025" className="service-logo"/>
      </header>

      <div className="branch-inventory">
        <h2>
          Inventaire PCs pour la succursale :
          <span className="highlight-orange">{name}</span>
        </h2>

        <div className="button-group">
          <button className="button import" onClick={() => document.getElementById('file-import').click()}>
            <Icons.Import size={16}/> Importer
          </button>
          <input id="file-import" type="file" accept=".xlsx, .xls" onChange={handleImport} style={{ display: 'none' }}/>
          <button className="button export" onClick={exportToExcel}>
            <Icons.FileSpreadsheet size={16}/> Exporter
          </button>
          <button className="button new-pc" onClick={() => {
            setFormData({ nom_poste: '', num_serie: '', user: '', email: '', service: '', description: '', date_aff: '', etat: '', remarque: '' });
            setShowAddForm(true);
          }}>
            <Icons.Plus size={16}/> Nouveau PC
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

        <div className="top-bar">
          <div className="search-bar">
            <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <div className="etat-filter">
            <p>Filtrer par état :</p>
            <div className="etat-buttons">
              {['Actif','Inactif','Hors service','Tous'].map(label => (
                <button key={label}
                  onClick={() => setEtatFilter(label==='Tous'? '': label)}
                  className={etatFilter===label? 'active':''}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? <p>Chargement...</p> : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Nom du poste</th><th>Numéro de série</th>
                <th>Utilisateur</th><th>Email</th><th>Service</th><th>Description</th>
                <th>Date d'affectation</th><th>État</th><th>Remarque</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPcs.map((pc,i)=>(
                <tr key={pc.id}>
                  <td>{i+1}</td><td>{pc.nom_poste}</td><td>{pc.num_serie}</td>
                  <td>{pc.user}</td><td>{pc.email}</td><td>{pc.service}</td>
                  <td>{pc.description}</td><td>{pc.date_aff}</td><td>{pc.etat}</td><td>{pc.remarque}</td>
                  <td>
                    <button onClick={()=>{ setEditPc(pc); setFormData(pc); }}>
                      <Icons.Edit2 size={14}/> Éditer
                    </button>
                    <button onClick={()=>setDeleteTarget(pc)}>
                      <Icons.Trash2 size={14}/> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {deleteTarget && (
          <div className="modal"><div className="modal-content">
            <p className="head">
              Confirmer la suppression du PC « {deleteTarget.nom_poste} » ?
            </p>
            <div className="modal-actions">
              <button onClick={handleDelete}>Confirmer</button>
              <button onClick={()=>setDeleteTarget(null)}>Annuler</button>
            </div>
          </div></div>
        )}

        {(editPc || showAddForm) && (
          <div className="modal"><div className="modal-content">
            <h3>{editPc? 'Modifier PC': 'Ajouter un PC'}</h3>
            <form onSubmit={editPc? handleEditSubmit: handleAddSubmit}>
            {Object.keys(formData).map(key => key !== 'id' && (
                <div className="form-field" key={key}>
                <label htmlFor={key}>{key.replace('_', ' ').toUpperCase()}</label>
                <input
                   id={key}
                   name={key}
                   type={inputType(key)}
                   placeholder={key}
                    value={formData[key] || ''}
                    onChange={handleChange}
                  />
                </div>
              ))}

              <div className="modal-actions">
                <button type="submit">{editPc? 'Modifier':'Ajouter'}</button>
                <button type="button" onClick={()=>{
                  setEditPc(null);
                  setShowAddForm(false);
                }}>Annuler</button>
              </div>
            </form>
          </div></div>
        )}
      </div>
      <footer className="login-footer">

        <p className="copyright" style={{color :'white'}}>© {new Date().getFullYear()} M.automotiv. Tous droits réservés.</p>

      </footer>
    </>
  );
};

export default BranchInventory;