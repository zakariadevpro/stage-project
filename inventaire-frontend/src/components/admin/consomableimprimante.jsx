import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {CirclePlus, Edit, Trash2} from "lucide-react";
import './InventaireConsommable.css';

const Consomable = () => {
    const navigate = useNavigate();
    const [showBranches, setShowBranches] = useState(false);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const filteredBranches = branches.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/branches', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            if (!response.ok) throw new Error('Erreur lors du chargement des branches');
            const data = await response.json();
            setBranches(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleShowBranches = () => {
        setShowBranches(true);
        fetchBranches();
    };

    return (
        <div className="nouveau-pc-container">
            <h2 style={{ color: 'black' }}>Gestion des consommables imprimantes</h2>

            {!showBranches && (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-orange" onClick={handleShowBranches}>
                        Consommables disponibles
                    </button>
                    <button className="btn-orange" onClick={() => navigate('/admin/consommables-en-commande')}>
                        Consommables en commande
                    </button>
                </div>
            )}

            {showBranches && (
                <div className="branches">
                    <h2 className="page-title">Succursales</h2>

                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Rechercher un Succursales ou une adresse..."
                            className="search-bar-branch"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                          <p>Chargement...</p>
                    ) : error ? (
                        <p>Erreur : {error}</p>
                    ) : (
                        <div className="branch-list">
                            {filteredBranches.map((branch) => (
                                <div key={branch.id} className="branch-card-light">
                                    <div className="card-image">
                                        <img
                                            src={branch.image_path}
                                            alt={branch.name}
                                            className="card-img"
                                            onClick={() => navigate(`/admin/consommables/${branch.name}`)}
                                        />

                                        <h4 onClick={() => navigate(`/admin/consommables/${branch.name} `)} className="titlepoint">
                                            {branch.name}<br />RENAULT/DACIA/ALPINE
                                        </h4>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Consomable;
