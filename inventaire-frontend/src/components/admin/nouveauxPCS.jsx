
import { useNavigate } from 'react-router-dom';

const NouveauPC = () => {
  const navigate = useNavigate();

  return (
    <div className="nouveau-pc-container">
      <h2 style={{ color: 'black' }}>Gestion des Nouveaux PC</h2>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-orange" onClick={() => navigate('/admin/nouveaux-pc-dispo')}>
          Nouveaux PCs dispo
        </button>
        <button className="btn-orange" onClick={() => navigate('/admin/nouveaux-pc-commande')}>
          Nouveaux PCs en commande
        </button>
      </div>
    </div>  
  );
};

export default NouveauPC;
