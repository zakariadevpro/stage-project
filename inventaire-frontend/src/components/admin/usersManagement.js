import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import './usersManagement.css';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Charger la liste des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setUsers(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur de récupération des utilisateurs :', error);
      }
    };
    fetchUsers();
  }, []);

  // Gérer la modification d'un utilisateur
  const handleEdit = (user) => {
    navigate.push(`/admin/edit-user/${user.id}`);
  };

  // Gérer la suppression d'un utilisateur  
  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?');
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const result = await response.json();
        if (result.message) {
          setUsers(users.filter(user => user.id !== userId));  // Mettre à jour la liste après suppression
          alert(result.message);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
      }
    }
  };

  return (
    <div className="container" id='container-admin'>
      <h1>Gestion des utilisateurs</h1>
      {isLoading ? (
        <p>Chargement des utilisateurs...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleEdit(user)}>Éditer</button>
                  <button onClick={() => handleDelete(user.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsersManagement;
