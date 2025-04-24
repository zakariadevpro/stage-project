"use client"

import { useState, useEffect } from "react"
import ConfirmationModal from "./ConfirmationModal"
import EditUserModal from "./edit-user-modal"
import AddUserModal from "./add-user-modal"
import "./usersManagement.css"
import { Pencil, Trash2, Plus, X } from "lucide-react"

// URL de l'API sans pagination pour le moment
const API_URL = "http://localhost:8000"

const UsersManagement = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  // État pour stocker l'ID de l'utilisateur connecté
  const [currentUserId, setCurrentUserId] = useState(null)

  // États pour la recherche
  const [searchTerm, setSearchTerm] = useState("")

  // États pour le modal de confirmation de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  // États pour le modal d'édition
  const [showEditModal, setShowEditModal] = useState(false)
  const [userToEdit, setUserToEdit] = useState(null)

  // État pour le modal d'ajout
  const [showAddModal, setShowAddModal] = useState(false)

  // Récupérer l'utilisateur actuellement connecté
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Token d'authentification manquant")
        return
      }

      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const userData = await response.json()
      setCurrentUserId(userData.id)
      console.log("Utilisateur connecté:", userData)
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur connecté:", error)
    }
  }

  // Charger la liste des utilisateurs
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log("Données reçues de l'API:", data)

      // Stocker les données brutes
      setUsers(data)
      setFilteredUsers(data)
      setError(null)
    } catch (error) {
      console.error("Erreur de récupération des utilisateurs :", error)
      setError("Impossible de charger les utilisateurs. Veuillez réessayer plus tard.")
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les utilisateurs et l'utilisateur connecté au chargement initial
  useEffect(() => {
    fetchCurrentUser()
    fetchUsers()
  }, [])

  // Filtrer les utilisateurs lorsque le terme de recherche change
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(lowercasedSearch) ||
          user.email?.toLowerCase().includes(lowercasedSearch) ||
          user.role?.toLowerCase().includes(lowercasedSearch),
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  // Gérer l'ajout d'un utilisateur
  const handleAddUser = () => {
    setShowAddModal(true)
  }

  // Fonction appelée après l'ajout d'un utilisateur
  const handleUserAdded = () => {
    // Actualiser la liste des utilisateurs
    fetchUsers()
  }

  // Gérer la modification d'un utilisateur
  const handleEdit = (user) => {
    setUserToEdit(user)
    setShowEditModal(true)
  }

  // Fonction appelée après la mise à jour d'un utilisateur
  const handleUserUpdated = () => {
    // Actualiser la liste des utilisateurs
    fetchUsers()
  }

  // Ouvrir le modal de confirmation pour la suppression
  const confirmDelete = (user) => {
    // Vérifier si l'utilisateur essaie de supprimer son propre compte
    if (user.id === currentUserId) {
      alert("Vous ne pouvez pas supprimer votre propre compte administrateur.")
      return
    }

    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  // Gérer la suppression d'un utilisateur après confirmation
  const handleDelete = async () => {
    if (!userToDelete) return

    // Double vérification pour s'assurer qu'un admin ne supprime pas son propre compte
    if (userToDelete.id === currentUserId) {
      alert("Vous ne pouvez pas supprimer votre propre compte administrateur.")
      setShowDeleteModal(false)
      setUserToDelete(null)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()

      // Mettre à jour la liste des utilisateurs
      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setFilteredUsers(filteredUsers.filter((user) => user.id !== userToDelete.id))

      // Fermer le modal et réinitialiser userToDelete
      setShowDeleteModal(false)
      setUserToDelete(null)

      // Afficher un message de succès
      
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error)
      alert("Erreur lors de la suppression de l'utilisateur. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

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
            <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bouton Ajouter Utilisateur */}
      <div className="add-user-container" style={{ marginBottom: "20px" }}>
      <button className="add-user-button" onClick={handleAddUser}>
  <Plus size={16} style={{ marginRight: "5px" }} />
  Ajouter un Utilisateur
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
              {searchTerm ? `Aucun utilisateur ne correspond à "${searchTerm}"` : "Aucun utilisateur trouvé."}
            </div>
          ) : (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th id="action">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={user.id === currentUserId ? "current-user-row" : ""}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role?.toLowerCase()}`}>{user.role}</span>
                      </td>
                      <td className="action-buttons">
                        
                      <button className="edit-button" onClick={() => handleEdit(user)}>
  <Pencil size={16} style={{ marginRight: "5px" }} />
  Éditer
</button>
                        {user.id !== currentUserId ? (
                         <button className="delete-button" onClick={() => confirmDelete(user)}>
                         <Trash2 size={16} style={{ marginRight: "5px" }} />
                         Supprimer
                       </button>
                       
                        ) : (
                        <div></div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setUserToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message={userToDelete ? `Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete.name} ?` : ""}
      />

      {/* Modal d'édition d'utilisateur */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setUserToEdit(null)
        }}
        user={userToEdit}
        onUserUpdated={handleUserUpdated}
      />

      {/* Modal d'ajout d'utilisateur */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
        }}
        onUserAdded={handleUserAdded}
      />
    </div>
  )
}

export default UsersManagement