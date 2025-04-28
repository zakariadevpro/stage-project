import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardUser = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/branches', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) throw new Error('Erreur lors du chargement des branches');

        const data = await res.json();
        setBranches(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error}</p>;

  return (
    <div className="dashboard-user">
      <h2>Branches Disponibles</h2>
      <div className="branch-list">
        {branches.map((branch) => (
          <div 
            key={branch.id} 
            className="branch-card" 
            onClick={() => navigate(`/responsable/branch/${branch.name}`)}
          >
            <h3>{branch.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardUser;
