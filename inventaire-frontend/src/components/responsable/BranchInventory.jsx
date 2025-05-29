import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './branchInventory.css';
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

  const handleLogoClick = () => navigate('/responsable/dashboard');

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

  const handleImport = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async evt => {
      try {
        setImportProgress({ current: 0, total: 0, success: 0, failed: 0 });
        
        // Parse Excel file
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        
        // Get data as array of arrays to handle both header and headerless formats
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (rawData.length === 0) {
          throw new Error("Le fichier Excel est vide");
        }
        
        // Detect if headers are present (first row contains strings)
        const hasHeaders = rawData[0].some(cell => 
          typeof cell === 'string' && 
          !Number.isInteger(parseFloat(cell)) && 
          isNaN(Date.parse(cell))
        );
        
        // Skip header row if present
        const dataRows = hasHeaders ? rawData.slice(1) : rawData;
        
        setImportProgress(prev => ({ ...prev, total: dataRows.length }));
        
        const token = localStorage.getItem('token');
        let successCount = 0;
        let failedCount = 0;
        
        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          if (row.length === 0 || (row.length === 1 && !row[0])) continue; // Skip empty rows
          
          const pc = {};
          fieldOrder.forEach((field, index) => {
            if (index < row.length) {
              if (field === 'date_aff' && typeof row[index] === 'number') {
                // Convert Excel date number to ISO date string
                const excelDate = XLSX.SSF.parse_date_code(row[index]);
                if (excelDate) {
                  const jsDate = new Date(
                    excelDate.y, 
                    excelDate.m - 1, 
                    excelDate.d
                  );
                  pc[field] = jsDate.toISOString().split('T')[0];
                } else {
                  pc[field] = row[index] || '';
                }
              } else {
                pc[field] = row[index] !== undefined ? String(row[index]).trim() : '';
              }
            } else {
              pc[field] = ''; // Set empty value for missing fields
            }
          });
          
          // Add branch name
          pc.branches = name;
          
          try {
            const response = await fetch('http://localhost:8000/api/pcs', {
              method: 'POST',
              headers: { 
                Authorization: `Bearer ${token}`, 
                'Content-Type': 'application/json' 
              },
              body: JSON.stringify(pc)
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            successCount++;
          } catch (error) {
            console.error('Error importing row:', error, pc);
            failedCount++;
          }
           
          setImportProgress(prev => ({ 
            ...prev, 
            current: i + 1,
            success: successCount,
            failed: failedCount
          }));
        }
        setLoading(true);

        await fetchPcs();
        
        // Keep progress visible briefly to show completion
        setTimeout(() => {
          setImportProgress(null);
        }, 2000);
        
      } catch (error) {
        console.error('Import error:', error);
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



        {importProgress && (
          <div className="import-progress">
            <p>
              Importation en cours : {importProgress.current}/{importProgress.total} 
              ({Math.round((importProgress.current / importProgress.total) * 100)}%)
            </p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.round((importProgress.current / importProgress.total) * 100)}%` }}
              ></div>
            </div>
            {importProgress.current === importProgress.total && (
              <p className="import-summary">
                Import terminé : {importProgress.success} réussis, {importProgress.failed} échoués
              </p>
            )}
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
                <th>Date d'affectation</th><th>État</th><th>Remarque</th>
              </tr>
            </thead>
            <tbody>
              {filteredPcs.map((pc,i)=>(
                <tr key={pc.id}>
                  <td>{i+1}</td><td>{pc.nom_poste}</td><td>{pc.num_serie}</td>
                  <td>{pc.user}</td><td>{pc.email}</td><td>{pc.service}</td>
                  <td>{pc.description}</td><td>{pc.date_aff}</td><td>{pc.etat}</td><td>{pc.remarque}</td>
               
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
      <div className="social-links">
        <a href="https://web.facebook.com/M.Automotiv" target="_blank" rel="noopener noreferrer" className="social-link facebook"></a>
        <a href="https://www.linkedin.com/company/m-automotiv" target="_blank" rel="noopener noreferrer" className="social-link linkedin"></a>
        <a href="https://www.youtube.com/@mautomotiv" target="_blank" rel="noopener noreferrer" className="social-link youtube"></a>
        <a href="https://www.instagram.com/m.automotiv.maroc" target="_blank" rel="noopener noreferrer" className="social-link instagram"></a>
      </div>
      <p className="copyright">© {new Date().getFullYear()} M.automotiv. Tous droits réservés.</p>
      <img src="https://m-automotiv.ma/assets/img/packimg/logoleft.svg" alt="M-AUTOMOTIV" className="footer-logo" />
    </footer>
    </>
  );
};

export default BranchInventory;