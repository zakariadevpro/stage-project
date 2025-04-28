import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const BranchInventory = () => {
  const { name } = useParams();
  const [pcs, setPcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPcs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8000/api/pcs-by-branche/${name}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) throw new Error('Erreur lors du chargement des PCs');

        const data = await res.json();
        setPcs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPcs();
  }, [name]);

  if (loading) return <p>Chargement des PCs...</p>;
  if (error) return <p>Erreur: {error}</p>;

  return (
    <div className="branch-inventory">
      <h2>PCs pour la branche : {name}</h2>
      <table>
        <thead>
          <tr>
            <th>Nom du poste</th>
            <th>Numéro de série</th>
            <th>Utilisateur</th>
            <th>Email</th>
            <th>Service</th>
            <th>Description</th>
            <th>Date d'affectation</th>
            <th>État</th>
            <th>Remarque</th>
          </tr>
        </thead>
        <tbody>
          {pcs.map((pc) => (
            <tr key={pc.id}>
              <td>{pc.nom_poste}</td>
              <td>{pc.num_serie}</td>
              <td>{pc.user}</td>
              <td>{pc.email}</td>
              <td>{pc.service}</td>
              <td>{pc.description}</td>
              <td>{pc.date_aff}</td>
              <td>{pc.etat}</td>
              <td>{pc.remarque}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BranchInventory;
