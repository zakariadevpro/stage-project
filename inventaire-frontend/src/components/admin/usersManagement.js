import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';
import './usersManagement.css';

// URL de l'API sans pagination pour le moment
const API_URL = 'http://localhost:8000';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // États pour la recherche
  const [searchTerm, setSearchTerm] = useState('');

  // États pour le modal de confirmation
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Charger la liste des utilisateurs sans pagination côté serveur
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        // Utiliser l'URL exacte que vous utilisiez avant
        const response = await fetch(`${API_URL}/api/users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Données reçues de l'API:", data); // Pour déboguer
        
        // Stocker les données brutes
        setUsers(data);
        setFilteredUsers(data);
        setError(null);
      } catch (error) {
        console.error('Erreur de récupération des utilisateurs :', error);
        setError('Impossible de charger les utilisateurs. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Filtrer les utilisateurs lorsque le terme de recherche change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(lowercasedSearch) || 
        user.email?.toLowerCase().includes(lowercasedSearch) ||
        user.role?.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Gérer la modification d'un utilisateur
  const handleEdit = (user) => {
    navigate(`/admin/edit-user/${user.id}`);
  };

  // Ouvrir le modal de confirmation pour la suppression
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowModal(true);
  };

  // Gérer la suppression d'un utilisateur après confirmation
  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Mettre à jour la liste des utilisateurs
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setFilteredUsers(filteredUsers.filter(user => user.id !== userToDelete.id));
      
      // Fermer le modal et réinitialiser userToDelete
      setShowModal(false);
      setUserToDelete(null);
      
      // Afficher un message de succès
      alert(result.message || 'Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur :', error);
      alert('Erreur lors de la suppression de l\'utilisateur. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="users-management-container">
      <h1>Gestion des utilisateurs</h1>
      
      {/* Barre de recherche et contrôles */}
      <div className="controls-container">
        <div className="search-container">
        
        <input
            type="text"
            placeholder="Rechercher par nom, email ou rôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bouton Ajouter Utilisateur */}
      <div className="add-user-container" style={{ marginBottom: '20px' }}>
        <button 
          className="add-user-button"
          onClick={() => navigate('/admin/add-user')}
        >
           ➕ Ajouter un Utilisateur 
        </button>
      </div>

      {/* Tableau des utilisateurs */}
      {error && <div className="error-message">{error}</div>}
      
      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des utilisateurs...</p>
        </div>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <div className="no-results">
              {searchTerm ? 
                `Aucun utilisateur ne correspond à "${searchTerm}"` : 
                'Aucun utilisateur trouvé.'
              }
            </div>
          ) : (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th id='action'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button 
                          className="edit-button" 
                          onClick={() => handleEdit(user)}
                        >
                          ✏️ Éditer
                        </button>
                        <button 
                          className="delete-button" 
                          onClick={() => confirmDelete(user)}
                        >
                          🗑️ Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message={userToDelete ? `Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete.name} ?` : ''}
      />
    </div>
  );
};

export default UsersManagement;