"use client"

import { useState, useEffect } from "react"
import ConfirmationModal from "./ConfirmationModal"
import EditUserModal from "./edit-user-modal"
import AddUserModal from "./add-user-modal"
import "./usersManagement.css"
import { Pencil, Trash2, Plus } from "lucide-react"

const API_URL = "http://localhost:8000"

const UsersManagement = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [userToEdit, setUserToEdit] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      const response = await fetch(`${API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
      const userData = await response.json()
      setCurrentUserId(userData.id)
    } catch (error) {
      console.error("Erreur récupération user connecté:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
      setError(null)
    } catch (error) {
      console.error("Erreur de récupération utilisateurs :", error)
      setError("Impossible de charger les utilisateurs. Réessayez plus tard.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      const lower = searchTerm.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(lower) ||
            user.username?.toLowerCase().includes(lower) ||
            user.prenom?.toLowerCase().includes(lower) ||
          user.email?.toLowerCase().includes(lower) ||
          user.role?.toLowerCase().includes(lower)
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  const handleAddUser = () => setShowAddModal(true)

  const handleUserAdded = () => fetchUsers()

  const handleEdit = (user) => {
    setUserToEdit(user)
    setShowEditModal(true)
  }

  const handleUserUpdated = () => fetchUsers()

  const confirmDelete = (user) => {
    if (user.id === currentUserId) {
      alert("Vous ne pouvez pas supprimer votre propre compte administrateur.")
      return
    }
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!userToDelete) return
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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
      setUsers(users.filter((u) => u.id !== userToDelete.id))
      setFilteredUsers(filteredUsers.filter((u) => u.id !== userToDelete.id))
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (error) {
      console.error("Erreur suppression utilisateur :", error)
      alert("Erreur lors de la suppression. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour afficher le rôle avec une majuscule initiale
  const formatRole = (role) => {
    if (!role) return ""
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <div className="users-management-container">
      <h1>Gestion des utilisateurs</h1>

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

      <div className="add-user-container" style={{ marginBottom: "20px" }}>
        <button className="add-user-button" onClick={handleAddUser}>
          <Plus size={16} style={{ marginRight: "5px" }} />
          Ajouter un Utilisateur
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading-spinner">
         
          
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="no-results">
          {searchTerm ? `Aucun utilisateur ne correspond à "${searchTerm}"` : "Aucun utilisateur trouvé."}
        </div>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Identifiant</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Branche</th>
                <th id="action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.id === currentUserId ? "current-user-row" : ""}>
                  <td>{user.username}</td>
                  <td>{user.name}</td>
                  <td>{user.prenom}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td>{user.branche}</td>
                  <td className="action-buttons">
                    <button className="edit-button" onClick={() => handleEdit(user)} style={{backgroundColor: "#2c2051" }}>
                      <Pencil size={16} style={{ marginRight: "5px"}} />
                      Éditer
                    </button>
                    {user.id !== currentUserId && (
                      <button className="delete-button" onClick={() => confirmDelete(user)}>
                        <Trash2 size={16} style={{ marginRight: "5px" }} />
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setUserToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message={userToDelete ? `Supprimer ${userToDelete.name} ?` : ""}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setUserToEdit(null)
        }}
        user={userToEdit}
        onUserUpdated={handleUserUpdated}
      />

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  )
}

export default UsersManagement
