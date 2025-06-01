import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './imprimente_inventory.css';
import logoright from "./assets/logoright.svg";
import logoleft from "./assets/logoleft.svg";

const BranchInventoryPrinterUser = () => {
  const [printers, setPrinters] = useState([]);
  const [filteredPrinters, setFilteredPrinters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
   const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userBranche, setUserBranche] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserBranche(user.branche || '');
    }
  }, []);
  const handleLogoClick = () => navigate('/responsable/dashboard');

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8000/api/printers-by-branche/${userBranche}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) throw new Error('Erreur lors du chargement des imprimantes');

        const data = await res.json();
        setPrinters(data);
        setFilteredPrinters(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userBranche) {
      fetchPrinters();
    }
  }, [userBranche]);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = printers.filter((printer) =>
      printer.emplacement?.toLowerCase().includes(lowerSearch) ||
      printer.adresseip?.toLowerCase().includes(lowerSearch) ||
      printer.hostname?.toLowerCase().includes(lowerSearch) ||
      printer.branche?.toLowerCase().includes(lowerSearch)
    );
    setFilteredPrinters(filtered);
  }, [searchTerm, printers]);

  if (loading) return <p>Chargement des imprimantes...</p>;
  if (error) return <p className="error">{error}</p>;

  return <>      <header className="login-header">
          <img src={logoleft} alt="M-AUTOMOTIV" className="header-logo" onClick={handleLogoClick}/>
          <img src={logoright} alt="Service Client 2025" className="service-logo"/>
        </header>
    <div className="branch-inventory-container">
      <h2>Inventaire des Imprimantes - {userBranche}</h2>
      <div className="inventory-actions">

      <input
        type="text"
        placeholder="Rechercher par emplacement, IP ou hostname..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      /></div>
      
      

      {filteredPrinters.length === 0 ? (
        <p>Aucune imprimante trouvée.</p>
      ) : (
        <table className="printer-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Emplacement</th>

              <th>Adresse IP</th>
              <th>Hostname</th>
              <th>Modèle</th>
              <th>consomable</th>

            </tr>
          </thead>
          <tbody>
            {filteredPrinters.map((printer,i) => (
              <tr key={printer.id}>
                <td>{i + 1}</td>
                <td>{printer.emplacement}</td>

                <td>                <a href={`http://${printer.adresseip}`} target="_blank" rel="noopener noreferrer">
                  {printer.adresseip}
                </a></td>

                <td>{printer.hostname || ''}</td>
                <td>{printer.modele_peripherique}</td>
                <td><button>consulter</button></td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    <footer className="login-footer">

      <p className="copyright"style={{color: 'white'}}>© {new Date().getFullYear()} M.automotiv. Tous droits réservés.</p>
      
    </footer>
  </>;
};

export default BranchInventoryPrinterUser;
